<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo_path')->nullable();
            $table->enum('event_type', ['attendance', 'attendance_ballot'])->default('attendance');
            $table->unsignedTinyInteger('max_votes')->default(5);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->dateTime('deleted_at')->nullable();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('event_id')->nullable()->after('id')->constrained('events');
            $table->unique(['event_id', 'folio']);
        });

        Schema::table('participations', function (Blueprint $table) {
            $table->foreignId('event_id')->nullable()->after('id')->constrained('events');
            $table->string('elector_key', 18)->nullable()->after('type');
            $table->string('folio', 24)->nullable()->unique()->after('curp');
            $table->string('otp_hash')->nullable();
            $table->dateTime('otp_expires_at')->nullable();
            $table->unsignedSmallInteger('otp_attempts')->default(0);
            $table->string('ballot_token_hash')->nullable();
            $table->dateTime('ballot_token_expires_at')->nullable();
            $table->dateTime('ballot_opened_at')->nullable();
            $table->dateTime('voted_at')->nullable();
            $table->foreignId('registered_by')->nullable()->constrained('users');
            $table->string('capture_method', 20)->default('manual');
            $table->unique(['event_id', 'elector_key']);
            $table->unique(['event_id', 'curp']);
        });

        Schema::table('ballots', function (Blueprint $table) {
            $table->foreignId('event_id')->nullable()->after('id')->constrained('events');
            $table->foreignId('participation_id')->nullable()->after('event_id')->unique()->constrained('participations');
        });
    }

    public function down(): void
    {
        Schema::table('ballots', function (Blueprint $table) {
            $table->dropConstrainedForeignId('participation_id');
            $table->dropConstrainedForeignId('event_id');
        });
        Schema::table('participations', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'elector_key']);
            $table->dropUnique(['event_id', 'curp']);
            $table->dropConstrainedForeignId('registered_by');
            $table->dropConstrainedForeignId('event_id');
            $table->dropColumn(['elector_key', 'folio', 'otp_hash', 'otp_expires_at', 'otp_attempts', 'ballot_token_hash', 'ballot_token_expires_at', 'ballot_opened_at', 'voted_at', 'capture_method']);
        });
        Schema::table('projects', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'folio']);
            $table->dropConstrainedForeignId('event_id');
        });
        Schema::dropIfExists('events');
    }
};
