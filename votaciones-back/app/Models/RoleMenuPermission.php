<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleMenuPermission extends Model
{
    protected $fillable = [
        'role_id', 'menu_id', 'can_view', 'can_create', 'can_update',
        'can_delete', 'custom_permissions',
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_create' => 'boolean',
        'can_update' => 'boolean',
        'can_delete' => 'boolean',
        'custom_permissions' => 'array',
    ];

    public function role() { return $this->belongsTo(Role::class); }
    public function menu() { return $this->belongsTo(Menu::class); }
}

