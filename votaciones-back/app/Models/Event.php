<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory, Auditable;

    protected $fillable = ['name', 'logo_path', 'event_type', 'max_votes', 'starts_at', 'ends_at', 'active'];

    protected $casts = [
        'active' => 'boolean',
        'max_votes' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /** Los límites del evento son inclusivos y sus fechas se manejan en hora local oficial. */
    protected $dateFormat = 'Y-m-d H:i:s';

    public function participations() { return $this->hasMany(Participation::class); }
    public function projects() { return $this->hasMany(Project::class); }
    public function ballots() { return $this->hasMany(Ballot::class); }
}
