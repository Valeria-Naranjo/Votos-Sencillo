<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('code', 80)->nullable()->unique()->after('menu');
        });

        Schema::create('role_menu_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->boolean('can_view')->default(false);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_update')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->json('custom_permissions')->nullable();
            $table->timestamps();
            $table->unique(['role_id', 'menu_id']);
            $table->index(['role_id', 'can_view']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_menu_permissions');
        Schema::table('menus', fn (Blueprint $table) => $table->dropColumn('code'));
    }
};

