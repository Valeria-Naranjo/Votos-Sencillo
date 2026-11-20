<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('participations', 'registered_at')) {
            Schema::table('participations', fn (Blueprint $table) => $table->dateTime('registered_at')->nullable());
        }
        if (!Schema::hasColumn('ballots', 'voted_at')) {
            Schema::table('ballots', fn (Blueprint $table) => $table->dateTime('voted_at')->nullable());
        }
    }

    public function down(): void
    {
        // Keep election audit timestamps on rollback; dropping them would discard recorded data.
    }
};
