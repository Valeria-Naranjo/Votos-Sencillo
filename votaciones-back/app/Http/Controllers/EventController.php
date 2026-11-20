<?php

namespace App\Http\Controllers;

use App\Models\Event;

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
}
