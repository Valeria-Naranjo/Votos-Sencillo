<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProjectController extends BaseCrudController
{
    protected $modelClass = Project::class;
    // protected $resourceClass = ProjectResource::class; // opcional
    protected $validationRules = [
        'event_id'         => 'required|exists:events,id',
        'folio'            => 'required|integer',
        'assigned_district' => 'required|integer',
        'project_name'     => 'required|string|max:255',
        'project_place'    => 'required|string|max:255',
        'viability'        => 'boolean',
        'active'           => 'boolean',
    ];
    protected $validationMessages = [
        'folio.unique' => 'El folio ya está registrado',
    ];
    protected $selectLabel = 'project_name'; // para el selectIndex
    protected $defaultOrderBy = ['folio' => 'asc'];
    protected $useAuthFilter = true; // los usuarios normales solo ven activos

    protected function validateRequest(Request $request, $id = null)
    {
        $rules = $this->validationRules;
        $rules['folio'] = [
            'required',
            'integer',
            Rule::unique('projects', 'folio')
                ->where(fn ($query) => $query->where('event_id', $request->event_id))
                ->ignore($id),
        ];

        return Validator::make($request->all(), $rules, $this->validationMessages);
    }
}
