<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Helper para insertar grupos y sus hijos con id automático
        function insertMenuGroup($group, $order)
        {
            $groupData = [
                'menu' => $group['menu'],
                'code' => $group['code'] ?? null,
                'caption' => $group['caption'] ?? '',
                'type' => 'group',
                'belongs_to' => 0,
                'icon' => $group['icon'] ?? '',
                'order' => $order,
                'created_at' => now(),
            ];
            $groupId = DB::table('menus')->insertGetId($groupData);
            $itemOrder = 1;
            foreach ($group['items'] as $item) {
                $data = [
                    'menu' => $item['menu'],
                    'code' => $item['code'] ?? null,
                    'type' => 'item',
                    'belongs_to' => $groupId,
                    'url' => $item['url'],
                    'icon' => $item['icon'] ?? '',
                    'order' => $itemOrder,
                    'created_at' => now(),
                ];
                if (isset($item['caption'])) $data['caption'] = $item['caption'];
                if (isset($item['others_permissions'])) $data['others_permissions'] = $item['others_permissions'];
                DB::table('menus')->insert($data);
                $itemOrder++;
            }
        }

        $menuGroups = [
            [
                'menu' => 'Principal',
                'code' => 'main',
                'icon' => '',
                'caption' => '',
                'items' => [
                    [
                        'menu' => 'Registrar Participación',
                        'code' => 'participation_capture',
                        'url' => '/registro',
                        'icon' => 'LuClipboardList',
                    ],
                    [
                        'menu' => 'Boleta',
                        'code' => 'ballot',
                        'url' => '/boleta',
                        'icon' => 'LuVote',
                    ],
                    // [
                    //     'menu' => 'Reporteador',
                    //     'url' => '/app/reporteador',
                    //     'icon' => 'ViewQuiltRounded',
                    // ],
                    // [
                    //     'menu' => 'Noticias',
                    //     'url' => '/app/noticias',
                    //     'icon' => 'NewspaperRounded',
                    // ],
                ],
            ],
            [
                'menu' => 'Administración',
                'code' => 'administration',
                'icon' => '',
                'caption' => 'Control del sistema, usuarios y roles',
                'items' => [
                    [
                        'menu' => 'Menus',
                        'code' => 'menus',
                        'url' => '/menus',
                        'icon' => 'MenuBookRounded',
                    ],
                    [
                        'menu' => 'Roles y Permisos',
                        'code' => 'access_control',
                        'url' => '/roles-permisos',
                        'icon' => '',
                        'others_permissions' => 'manage_permissions',
                    ],
                    // [
                    //     'menu' => 'Departamentos',
                    //     'url' => '/app/configuraciones/departamentos',
                    //     'icon' => 'ApartmentRounded',
                    // ],
                    // [
                    //     'menu' => 'Puestos de trabajo',
                    //     'url' => '/app/configuraciones/puestos',
                    //     'icon' => 'WorkspacesRounded',
                    // ],
                    // [
                    //     'menu' => 'Empleados',
                    //     'url' => '/app/configuraciones/empleados',
                    //     'icon' => 'BadgeRounded',
                    // ],
                    [
                        'menu' => 'Usuarios',
                        'code' => 'users',
                        'url' => '/usuarios',
                        'icon' => 'PeopleAltRounded',
                    ],
                    [
                        'menu' => 'Eventos',
                        'code' => 'events',
                        'url' => '/eventos',
                        'icon' => 'LuCalendarDays',
                    ],
                    [
                        'menu' => 'Ajustes',
                        'url' => '/app/configuraciones/ajustes',
                        'icon' => 'TuneRounded',
                    ],
                ],
            ],
            [
                'menu' => 'Catalogos',
                'code' => 'catalogs',
                'icon' => '',
                'caption' => 'Gestión de Catalogos',
                'items' => [
                    [
                        'menu' => 'Casillas',
                        'code' => 'casillas',
                        'url' => '/casillas',
                        'icon' => 'LuMapPin',
                    ],
                    [
                        'menu' => 'Proyectos',
                        'code' => 'projects',
                        'url' => '/proyectos',
                        'icon' => 'LuChartBar',
                        // 'others_permissions' => 'Exportar Plantilla',
                    ],
                ],
            ],
            [
                'menu' => 'Resultados',
                'code' => 'results',
                'caption' => 'Seguimiento de la jornada',
                'items' => [
                    ['menu' => 'Participaciones', 'code' => 'participations', 'url' => '/participaciones', 'icon' => 'LuList'],
                    ['menu' => 'Estadísticas', 'code' => 'statistics', 'url' => '/estadisticas', 'icon' => 'LuChartBar'],
                ],
            ],
            // [
            //     'menu' => 'Flujo de Productos',
            //     'icon' => 'SimCardRounded',
            //     'caption' => 'Proceso de distribución',
            //     'items' => [
            //         [
            //             'menu' => 'Productos',
            //             'url' => '/app/productos',
            //             'icon' => 'SimCardRounded',
            //             'others_permissions' => 'Carga Masiva, Importar Detalles, Asignar Productos, Importa Portaciones, Portacion Manual',
            //         ],
            //         [
            //             'menu' => 'Productos en Stock',
            //             'url' => '/app/productos/en-stock',
            //             'icon' => 'Inventory2Rounded',
            //             'read_only' => 1,
            //         ],
            //         [
            //             'menu' => 'Productos Asignados',
            //             'url' => '/app/productos/asignados',
            //             'icon' => 'AssignmentIndRounded',
            //             'read_only' => 1,
            //         ],
            //         [
            //             'menu' => 'Productos Distribuidos',
            //             'url' => '/app/productos/distribuidos',
            //             'icon' => 'OutboxRounded',
            //             'read_only' => 1,
            //         ],
            //         [
            //             'menu' => 'Productos Activados',
            //             'url' => '/app/productos/activados',
            //             'icon' => 'VerifiedRounded',
            //             'read_only' => 1,
            //         ],
            //         [
            //             'menu' => 'Productos Portados',
            //             'url' => '/app/productos/portados',
            //             'icon' => 'SimCardAlertRounded',
            //             'read_only' => 1,
            //         ],
            //     ]
            // ],
        ];

        $groupOrder = 1;
        foreach ($menuGroups as $group) {
            insertMenuGroup($group, $groupOrder);
            $groupOrder++;
        }
    }
}
