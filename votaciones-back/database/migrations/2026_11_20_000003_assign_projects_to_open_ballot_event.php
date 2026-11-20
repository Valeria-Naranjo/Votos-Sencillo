<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonImmutable;

return new class extends Migration
{
    public function up(): void
    {
        $now = CarbonImmutable::now('America/Mexico_City')->format('Y-m-d H:i:s');

        $event = DB::table('events')
            ->where('event_type', 'attendance_ballot')
            ->where('active', true)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->orderByDesc('starts_at')
            ->orderByDesc('id')
            ->first();

        if (!$event) {
            $event = DB::table('events')
                ->where('event_type', 'attendance_ballot')
                ->where('active', true)
                ->orderByDesc('id')
                ->first();
        }

        if (!$event) {
            return;
        }

        DB::table('projects')
            ->whereNull('event_id')
            ->update(['event_id' => $event->id, 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Migración de datos: no revierte automáticamente.
        // Para deshacer: UPDATE projects SET event_id = NULL WHERE event_id = <id del evento>;
    }
};
