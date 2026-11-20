<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Participation extends Model
{
    use HasFactory, Notifiable, Auditable;

    protected $fillable = [
        'type',
        'event_id',
        'elector_key',
        'curp',
        'folio',
        'otp_hash',
        'otp_expires_at',
        'otp_attempts',
        'ballot_token_hash',
        'ballot_token_expires_at',
        'ballot_opened_at',
        'registered_at',
        'voted_at',
        'registered_by',
        'capture_method',
        'user_id',
        'active'
    ];

    protected $casts = [
        'type' => 'string',
        'active' => 'boolean',
        'otp_expires_at' => 'datetime',
        'ballot_token_expires_at' => 'datetime',
        'ballot_opened_at' => 'datetime',
        'registered_at' => 'datetime',
        'voted_at' => 'datetime',
    ];

    // Relación con el usuario (casilla)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event() { return $this->belongsTo(Event::class); }
    public function registrar() { return $this->belongsTo(User::class, 'registered_by'); }
    public function ballot() { return $this->hasOne(Ballot::class); }

    // Scope para activos
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
