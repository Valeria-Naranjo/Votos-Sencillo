<?php

namespace App\Http\Controllers;

use App\Models\Ballot;
use App\Models\ObjResponse;
use App\Models\Project;
use App\Models\Participation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\ElectionRules;
use Carbon\CarbonImmutable;


class BallotController extends BaseCrudController
{
    protected $modelClass = Ballot::class;
    protected $validationRules = [
        'user_id' => 'required|exists:users,id',
        'vote_1'  => 'nullable|exists:projects,id',
        'vote_2'  => 'nullable|exists:projects,id',
        'vote_3'  => 'nullable|exists:projects,id',
        'vote_4'  => 'nullable|exists:projects,id',
        'vote_5'  => 'nullable|exists:projects,id',
        'active'  => 'boolean',
    ];
    protected $validationMessages = [
        'user_id.exists' => 'Este usuario no existe',
        'vote_1.exists'  => 'El proyecto seleccionado no existe',
        'vote_2.exists'  => 'El proyecto seleccionado no existe',
        'vote_3.exists'  => 'El proyecto seleccionado no existe',
        'vote_4.exists'  => 'El proyecto seleccionado no existe',
        'vote_5.exists'  => 'El proyecto seleccionado no existe',
    ];
    protected $defaultOrderBy = ['created_at' => 'desc'];

    public function openWithOtp(Request $request)
    {
        $request->validate(['folio' => 'required|string', 'otp' => 'required|digits:6']);
        $participation = Participation::with(['event', 'user.casilla'])->where('folio', Str::upper(trim($request->folio)))->where('active', true)->first();
        if (!$participation || !$participation->otp_hash || !Hash::check($request->otp, $participation->otp_hash)) {
            if ($participation) $participation->increment('otp_attempts');
            return ObjResponse::validationError(['otp' => ['Folio o código incorrecto.']]);
        }
        $rules = new ElectionRules();
        if ($participation->otp_expires_at?->lessThanOrEqualTo($rules->now())) return ObjResponse::validationError(['otp' => ['El código expiró. Solicite uno nuevo en Registro.']]);
        if ($participation->voted_at) return ObjResponse::validationError(['folio' => ['Este folio ya concluyó su votación.']]);
        if ($participation->event?->event_type !== 'attendance_ballot') return ObjResponse::validationError(['event_id' => ['Este evento sólo registra asistencia.']]);
        if (!$rules->eventIsOpen($participation->event)) return ObjResponse::validationError(['event_id' => ['El evento no está dentro de su horario vigente.']]);
        $district = $rules->districtFor(Auth::user());
        if (!$rules->participationDistrictMatches($participation, $district)) return ObjResponse::validationError(['district' => ['La participación no corresponde al distrito de la casilla autenticada.']]);

        $token = Str::random(64);
        $participation->update([
            'ballot_token_hash' => Hash::make($token),
            'ballot_token_expires_at' => now()->addMinutes(30),
            'ballot_opened_at' => CarbonImmutable::now(ElectionRules::TIMEZONE),
        ]);

        return ObjResponse::success([
            'ballot_token' => $token,
            'event' => $participation->event->only(['id', 'name', 'event_type', 'max_votes', 'starts_at', 'ends_at']),
            'participation' => ['id' => $participation->id],
            'district' => $district,
        ], 'Boleta habilitada.');
    }

    public function submitWithToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'participation_id' => 'required|exists:participations,id',
            'ballot_token' => 'required|string',
            'votes' => 'required|array|min:1|max:5',
            'votes.*' => 'required|integer|distinct|exists:projects,id',
        ]);
        if ($validator->fails()) return ObjResponse::validationError($validator->errors()->toArray());

        return DB::transaction(function () use ($request) {
            $participation = Participation::with(['event', 'user.casilla'])->lockForUpdate()->findOrFail($request->participation_id);
            $rules = new ElectionRules();
            if (!$rules->eventIsOpen($participation->event)) return ObjResponse::validationError(['event_id' => ['El evento no está dentro de su horario vigente.']]);
            if ($participation->event?->event_type !== 'attendance_ballot') return ObjResponse::validationError(['event_id' => ['Este evento sólo registra asistencia.']]);
            $district = $rules->districtFor(Auth::user());
            if (!$rules->participationDistrictMatches($participation, $district)) return ObjResponse::validationError(['district' => ['La participación no corresponde al distrito de la casilla autenticada.']]);
            if (!$participation->ballot_token_hash || !Hash::check($request->ballot_token, $participation->ballot_token_hash)) {
                return ObjResponse::validationError(['ballot_token' => ['La sesión de boleta no es válida.']]);
            }
            if ($participation->ballot_token_expires_at?->lessThanOrEqualTo($rules->now())) return ObjResponse::validationError(['ballot_token' => ['La sesión de boleta expiró.']]);
            if ($participation->voted_at || Ballot::where('participation_id', $participation->id)->exists()) {
                return ObjResponse::validationError(['participation_id' => ['La votación ya fue registrada.']]);
            }
            if (count($request->votes) > ($participation->event?->max_votes ?? 5)) {
                return ObjResponse::validationError(['votes' => ['La selección supera el máximo configurado para el evento.']]);
            }
            $validProjects = Project::where('assigned_district', $district)->where('active', true)->whereIn('id', $request->votes)
                ->when(!app()->environment('local'), fn ($query) => $query->where('event_id', $participation->event_id))
                ->count();
            if ($validProjects !== count($request->votes)) return ObjResponse::validationError(['votes' => ['Hay proyectos que no pertenecen al evento y distrito autorizados o están inactivos.']]);

            $votes = array_pad(array_values($request->votes), 5, null);
            $ballot = Ballot::create([
                'event_id' => $participation->event_id,
                'participation_id' => $participation->id,
                'user_id' => Auth::id(),
                'vote_1' => $votes[0],
                'vote_2' => $votes[1],
                'vote_3' => $votes[2],
                'vote_4' => $votes[3],
                'vote_5' => $votes[4],
                'active' => true,
                'voted_at' => CarbonImmutable::now(ElectionRules::TIMEZONE),
            ]);
            $votedAt = CarbonImmutable::now(ElectionRules::TIMEZONE);
            $ballot->update(['voted_at' => $votedAt]);
            $participation->update(['voted_at' => $votedAt, 'ballot_token_hash' => null, 'otp_hash' => null]);
            return ObjResponse::success(['id' => $ballot->id], 'Votación registrada correctamente.');
        });
    }

    /** Ballots can only be written through the OTP/token election flow. */
    public function createOrUpdate(Request $request) { return ObjResponse::validationError(['ballot' => ['Use el flujo de boleta electoral.']]); }

    /**
     * Prepara los datos para validación y guardado.
     */
    protected function prepareForValidation(Request $request, $id = null)
    {
        $data = $request->all();
        foreach (['vote_1', 'vote_2', 'vote_3', 'vote_4', 'vote_5'] as $field) {
            if (isset($data[$field]) && ($data[$field] == 0 || $data[$field] === '0')) {
                $data[$field] = null;
            }
        }
        $request->replace($data);
    }

    /**
     * Sobrescribimos validateRequest para añadir:
     * 1. Regla 'different' solo entre valores no nulos y no cero.
     * 2. Validación de que no se repitan proyectos (valores > 0).
     */
    protected function validateRequest(Request $request, $id = null)
    {
        $rules = $this->validationRules;

        // // Asegurar que cada regla sea un array (para poder añadir más reglas)
        // foreach ($rules as $field => &$rule) {
        //     if (is_string($rule)) {
        //         $rule = explode('|', $rule);
        //     }
        // }


        // // Reglas base: user_id único, y vote_* nullable (acepta 0, null, etc.)
        // $rules = [
        //     'user_id' => 'required|exists:users,id|unique:ballots,user_id',
        //     'vote_1'  => 'nullable',
        //     'vote_2'  => 'nullable',
        //     'vote_3'  => 'nullable',
        //     'vote_4'  => 'nullable',
        //     'vote_5'  => 'nullable',
        //     'active'  => 'boolean',
        // ];

        $this->prepareForValidation($request, $id);

        $validator = Validator::make($request->all(), $rules, $this->validationMessages);

        // Validación adicional: proyectos distintos entre sí (solo valores >0)
        $validator->after(function ($validator) use ($request) {
            $votes = [];
            foreach (['vote_1', 'vote_2', 'vote_3', 'vote_4', 'vote_5'] as $field) {
                $value = $request->input($field);
                if (is_numeric($value) && $value > 0) {
                    $votes[] = $value;
                }
            }
            if (count($votes) !== count(array_unique($votes))) {
                $validator->errors()->add('votes', 'No se puede seleccionar el mismo proyecto más de una vez.');
            }
        });

        return $validator;

        // Validación adicional personalizada
        $validator->after(function ($validator) use ($request) {
            // Obtener solo los valores de voto que son > 0
            $votes = array_filter([
                $request->vote_1,
                $request->vote_2,
                $request->vote_3,
                $request->vote_4,
                $request->vote_5,
            ], function ($val) {
                return !is_null($val) && $val > 0;
            });

            // 1. No deben haber duplicados entre los valores > 0
            if (count($votes) !== count(array_unique($votes))) {
                $validator->errors()->add('votes', 'No se puede seleccionar el mismo proyecto más de una vez.');
            }

            // 2. (Opcional) Validar que al menos se haya seleccionado un proyecto
            // if (empty($votes)) {
            //     $validator->errors()->add('votes', 'Debe seleccionar al menos un proyecto.');
            // }

            // 3. (Opcional) Validar que el número de votos no supere 5 (ya implícito)
        });

        return $validator;
    }

    // Opcional: Si quieres personalizar la respuesta del show para incluir relaciones
    // public function show(Request $request, $id, $internal = false)
    // {
    //     $ballot = parent::show($request, $id, true);
    //     if (!$ballot || $internal) return $ballot;
    //     $ballot->load('user', 'vote1Project', 'vote2Project', 'vote3Project', 'vote4Project', 'vote5Project');
    //     return ObjResponse::success($ballot, 'Boleta encontrada');
    // }

    // Opcional: mostrar la boleta con los proyectos cargados
    public function show(Request $request, $id, $internal = false)
    {
        $ballot = parent::show($request, $id, true);
        if (!$ballot || $internal) return $ballot;

        // Cargar relaciones para la respuesta
        $ballot->load(['vote1Project', 'vote2Project', 'vote3Project', 'vote4Project', 'vote5Project', 'user']);
        return ObjResponse::success($ballot, 'Boleta encontrada');
    }
}
