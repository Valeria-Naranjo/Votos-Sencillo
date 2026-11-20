<?php

namespace App\Http\Controllers;

use App\Models\ObjResponse;
use App\Models\Participation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Services\ElectionRules;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;

class ParticipationController extends BaseCrudController
{
    protected $modelClass = Participation::class;
    // protected $resourceClass = ParticipationResource::class; // Opcional

    protected $validationRules = [
        'type'    => 'required|in:INE,Carta Identidad',
        'curp'    => 'required|string|size:18|regex:/^[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}$/|unique:participations,curp',
        'user_id' => 'required|exists:users,id',
        'active'  => 'boolean',
    ];

    protected $validationMessages = [
        'curp.unique' => 'Esta CURP ya ha sido registrada previamente.',
        'curp.regex'  => 'El formato de la CURP no es válido.',
    ];

    protected $selectLabel = 'curp';  // Para el selectIndex (si se necesita)

    protected $defaultOrderBy = ['created_at' => 'desc'];

    /** Registra al ciudadano y emite el folio/OTP sin confiar en el user_id del cliente. */
    public function registerVoter(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'type' => 'required|in:INE,Carta Identidad',
            'elector_key' => ['required', 'string', 'size:18', 'regex:/^[A-Z]{6}\d{6}[A-Z0-9]{6}$/'],
            'curp' => ['nullable', 'string', 'size:18', 'regex:/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/'],
            'capture_method' => 'nullable|in:manual,google_vision,local_ocr',
        ]);
        if ($validator->fails()) return ObjResponse::validationError($validator->errors()->toArray());

        $auth = Auth::user();
        $electorKey = Str::upper(trim($request->elector_key));
        $curp = $request->curp ? Str::upper(trim($request->curp)) : null;

        $event = \App\Models\Event::find($request->event_id);
        if (!(new ElectionRules())->eventIsOpen($event)) return ObjResponse::validationError(['event_id' => ['El evento no está dentro de su horario vigente.']]);

        try {
            return DB::transaction(function () use ($request, $auth, $electorKey, $curp, $event) {
                $duplicate = Participation::where('event_id', $request->event_id)
                    ->where(function ($query) use ($electorKey, $curp) {
                        $query->where('elector_key', $electorKey);
                        if ($curp) $query->orWhere('curp', $curp);
                    })->lockForUpdate()->first();
                if ($duplicate) return ObjResponse::validationError(['elector_key' => ['El ciudadano ya fue registrado en este evento.']]);

                $otp = (string) random_int(100000, 999999);
                $participation = Participation::create([
                    'event_id' => $event->id,
                    'type' => $request->type,
                    'elector_key' => $electorKey,
                    'curp' => $curp,
                    'folio' => 'EV-' . $request->event_id . '-' . Str::upper(Str::random(10)),
                    'otp_hash' => Hash::make($otp),
                    'otp_expires_at' => now()->addMinutes(20),
                    'registered_by' => $auth?->id,
                    'user_id' => $auth?->id,
                    'created_at' => CarbonImmutable::now(ElectionRules::TIMEZONE),
                    'capture_method' => $request->capture_method ?? 'manual',
                    'active' => true,
                ]);

                return ObjResponse::success([
                    'id' => $participation->id,
                    'folio' => $participation->folio,
                    'otp' => $otp,
                    'expires_at' => $participation->otp_expires_at,
                ], 'Ciudadano registrado. Entregue el folio de acceso a la boleta.');
            });
        } catch (QueryException $exception) {
            // Composite unique indexes serialize concurrent duplicate attempts; never return submitted identifiers.
            if (str_contains(strtolower($exception->getMessage()), 'unique') || str_contains(strtolower($exception->getMessage()), 'duplicate')) {
                return ObjResponse::validationError(['elector_key' => ['El ciudadano ya fue registrado en este evento.']]);
            }
            throw $exception;
        }
    }

    /** Participation data is created only by the verified registration flow. */
    public function createOrUpdate(Request $request)
    {
        return ObjResponse::validationError(['participation' => ['Use el flujo de registro electoral.']]);
    }

    /** OCR opcional: la imagen sólo se envía a Vision y no se persiste en el sistema. */
    public function ocrIne(Request $request)
    {
        $request->validate(['image' => 'required|image|max:8192']);
        $apiKey = config('services.google_vision.api_key');
        if (!$apiKey) return ObjResponse::validationError(['image' => ['Google Vision no está configurado. Capture los datos manualmente.']]);

        $content = base64_encode(file_get_contents($request->file('image')->getRealPath()));
        $response = Http::timeout(20)->post("https://vision.googleapis.com/v1/images:annotate?key={$apiKey}", [
            'requests' => [[
                'image' => ['content' => $content],
                'features' => [['type' => 'DOCUMENT_TEXT_DETECTION', 'maxResults' => 1]],
            ]],
        ]);
        if (!$response->successful()) return ObjResponse::serverError('No fue posible procesar la credencial.', new \RuntimeException('Vision API error'));

        $text = Str::upper(data_get($response->json(), 'responses.0.fullTextAnnotation.text', ''));
        preg_match('/[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d/', preg_replace('/\s+/', '', $text), $curp);
        preg_match('/[A-Z]{6}\d{6}[A-Z0-9]{6}/', preg_replace('/\s+/', '', $text), $electorKey);

        return ObjResponse::success([
            'curp' => $curp[0] ?? null,
            'elector_key' => $electorKey[0] ?? null,
        ], 'Lectura terminada. Confirme los datos antes de registrar.');
    }

    // Opcional: si quieres filtrar por usuario autenticado (por ejemplo, solo sus propias participaciones)
    // protected $useAuthFilter = true;
    // protected $indexQueryCallback = function($query, $request) {
    //     $query->where('user_id', auth()->id());
    // };

    /**
     * Opcional: personalizar la respuesta del método show para incluir relaciones.
     */
    public function show(Request $request, $id, $internal = false)
    {
        $participation = parent::show($request, $id, true);
        if (!$participation || $internal) return $participation;
        $participation->load('user');
        return ObjResponse::success($participation, 'Participación encontrada');
    }
}
