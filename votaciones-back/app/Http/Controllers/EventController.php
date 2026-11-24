<?php

namespace App\Http\Controllers;

use App\Models\Ballot;
use App\Models\Event;
use App\Models\ObjResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EventController extends BaseCrudController
{
    protected $modelClass = Event::class;
    protected $validationRules = [
        'name' => 'required|string|max:160',
        'logo_path' => 'nullable|string|max:255',
        'event_type' => 'required|in:attendance,attendance_ballot',
        'max_votes' => 'required|integer|min:1|max:5',
        'starts_at' => 'nullable|date',
        'ends_at' => 'nullable|date|after_or_equal:starts_at',
        'active' => 'boolean',
    ];
    protected $selectLabel = 'name';
    protected $defaultOrderBy = ['starts_at' => 'desc', 'id' => 'desc'];

    public function destroy(Request $request, $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $event = Event::lockForUpdate()->find($id);
                if (!$event) return ObjResponse::notFound('Registro no encontrado');

                $participationIds = $event->participations()->pluck('id');
                $projectIds = $event->projects()->pluck('id');

                $hasBallots = Ballot::where('event_id', $event->id)
                    ->orWhereIn('participation_id', $participationIds)
                    ->orWhere(function ($query) use ($projectIds) {
                        foreach (range(1, 5) as $index) {
                            $query->orWhereIn("vote_{$index}", $projectIds);
                        }
                    })
                    ->exists();

                if ($hasBallots) {
                    $message = 'No se puede eliminar el evento porque tiene boletas registradas.';
                    return ObjResponse::validationError(['event' => [$message]], $message);
                }

                $event->participations()->delete();
                $event->projects()->delete();
                $event->delete();

                return ObjResponse::success(null, 'Evento eliminado');
            });
        } catch (\Throwable $ex) {
            Log::error(get_class($this) . ' ~ destroy ~ ' . $ex->getMessage());
            return ObjResponse::serverError('Error al eliminar', $ex);
        }
    }
}
