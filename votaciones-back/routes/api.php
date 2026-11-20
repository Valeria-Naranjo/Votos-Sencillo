<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AccessControlController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BallotController;
use App\Http\Controllers\CasillaController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ParticipationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Models\Menu;
use App\Models\ObjResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

Route::get('/', function (Request $request) {
    return "API LARAVEL v1.0.0.0";
});

Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/signup', [AuthController::class, 'signup']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/checkLoggedIn', function (Response $response, Request $request) {
        $response->data = ObjResponse::success()->getData(true); // convertir a array;
        $id = Auth::user()->id;
        if ($id < 1 || !$id) {
            throw ValidationException::withMessages([
                'message' => false
            ]);
        }
        if ($request->url) {
            $response->data = ObjResponse::default()->getData(true); // convertir a array
            try {
                $menu = Menu::where('url', $request->url)->where('active', 1)->select("id")->first();
                $response->data = ObjResponse::success()->getData(true); // convertir a array;
                $response->data["message"] = 'Peticion satisfactoria | validar inicio de sesión.';
                $response->data["result"] = $menu;
            } catch (\Exception $ex) {
                $response->data = ObjResponse::error($ex->getMessage());
            }
            return response()->json($response, $response->data["status_code"]);
        }
        return response()->json($response, $response->data["status_code"]);
    });
    Route::get('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/changePasswordAuth', [AuthController::class, 'changePasswordAuth']);

    Route::prefix("logs")->group(function () {
        Route::post("/", [ActivityLogController::class, 'index']);
        Route::get("/dashboard", [ActivityLogController::class, 'dashboard']);
        Route::get("/export", [ActivityLogController::class, 'export']);
    });

    Route::prefix("menus")->group(function () {
        Route::get("/", [MenuController::class, 'index'])->middleware('permission:menus,view');
        Route::post("/", [MenuController::class, 'store'])->middleware('permission:menus,create');
        Route::put("/{menu}", [MenuController::class, 'update'])->middleware('permission:menus,update');
        Route::patch("/{menu}/status", [MenuController::class, 'setStatus'])->middleware('permission:menus,delete');
        Route::get("/getMenusByRole/{pages_read}", [MenuController::class, 'getMenusByRole'])->middleware('permission:menus,view');
        Route::get("/getHeadersMenusSelect", [MenuController::class, 'getHeadersMenusSelect'])->middleware('permission:menus,view');
        Route::get("/selectIndexToRoles", [MenuController::class, 'selectIndexToRoles'])->middleware('permission:menus,view');
        Route::post("/createOrUpdate", [MenuController::class, 'createOrUpdate'])->middleware('permission:menus,update');
        Route::get("/id/{id}", [MenuController::class, 'show'])->middleware('permission:menus,view');
        Route::get("/disEnable/{id}/{active}", [MenuController::class, 'disEnable'])->middleware('permission:menus,delete');

        Route::post("/getIdByUrl", [MenuController::class, 'getIdByUrl'])->middleware('permission:menus,view');
    });

    Route::prefix("roles")->group(function () {
        Route::get("/", [RoleController::class, 'index'])->middleware('permission:access_control,view');
        Route::get("/selectIndex", [RoleController::class, 'selectIndex'])->middleware('permission:users,update');
        Route::post("/", [AccessControlController::class, 'createRole'])->middleware('permission:access_control,create');
        Route::put("/{role}", [AccessControlController::class, 'updateRole'])->middleware('permission:access_control,update');
        Route::patch("/{role}/status", [AccessControlController::class, 'setRoleStatus'])->middleware('permission:access_control,delete');
        Route::post("/createOrUpdate", [RoleController::class, 'createOrUpdate'])->middleware('permission:access_control,create');
        Route::get("/id/{id}", [RoleController::class, 'show'])->middleware('permission:access_control,view');
        Route::delete("/delete/{id}", [RoleController::class, 'delete'])->middleware('permission:access_control,delete');
        Route::get("/disEnable/{id}/{active}", [RoleController::class, 'disEnable'])->middleware('permission:access_control,update');
        Route::delete("/deleteMultiple", [RoleController::class, 'deleteMultiple'])->middleware('permission:access_control,delete');

        Route::post("/updatePermissions", [RoleController::class, 'updatePermissions'])->middleware('permission:access_control,manage_permissions');
        Route::get("/access/catalog", [AccessControlController::class, 'catalog'])->middleware('permission:access_control,view');
        Route::get("/{role}/access", [AccessControlController::class, 'show'])->middleware('permission:access_control,view');
        Route::put("/{role}/access", [AccessControlController::class, 'update'])->middleware('permission:access_control,manage_permissions');
        Route::put("/users/{user}/role", [AccessControlController::class, 'assignUserRole'])->middleware('permission:access_control,manage_permissions');
    });


    Route::prefix("casillas")->group(function () {
        Route::get("/", [CasillaController::class, 'index']);
        Route::get("/selectIndex", [CasillaController::class, 'selectIndex']);
        Route::post("/createOrUpdate", [CasillaController::class, 'createOrUpdate']);
        Route::get("/id/{id}", [CasillaController::class, 'show']);
        Route::delete("/delete/{id}", [CasillaController::class, 'delete']);
        Route::get("/disEnable/{id}/{active}", [CasillaController::class, 'disEnable']);
        Route::delete("/deleteMultiple", [CasillaController::class, 'deleteMultiple']);
    });

    Route::prefix("users")->group(function () {
        Route::get("/", [UserController::class, 'index'])->middleware('permission:users,view');
        Route::get("/selectIndexByRole/{role_id}", [UserController::class, 'selectIndexByRole'])->middleware('permission:users,view');
        Route::get("/selectIndex", [UserController::class, 'selectIndex'])->middleware('permission:users,view');
        Route::post("/createOrUpdate", [UserController::class, 'createOrUpdate'])->middleware('permission:users,update');
        Route::get("/id/{id}", [UserController::class, 'show'])->middleware('permission:users,view');
        Route::delete("/delete/{id}", [UserController::class, 'delete'])->middleware('permission:users,delete');
        Route::get("/disEnable/{id}/{active}", [UserController::class, 'disEnable'])->middleware('permission:users,update');
        Route::delete("/deleteMultiple", [UserController::class, 'deleteMultiple'])->middleware('permission:users,delete');
    });

    // Rutas para la gestión de proyectos
    Route::prefix("projects")->group(function () {
        Route::get("/", [ProjectController::class, 'index']);
        Route::get("/selectIndex", [ProjectController::class, 'selectIndex']);
        Route::post("/createOrUpdate", [ProjectController::class, 'createOrUpdate']);
        Route::get("/id/{id}", [ProjectController::class, 'show']);
        Route::delete("/delete/{id}", [ProjectController::class, 'delete']);
        Route::get("/disEnable/{id}/{active}", [ProjectController::class, 'disEnable']);
        Route::delete("/deleteMultiple", [ProjectController::class, 'deleteMultiple']);
    });


    // Rutas para la gestión de participaciones
    Route::prefix("participations")->group(function () {
        Route::post("/register-voter", [ParticipationController::class, 'registerVoter'])->middleware('permission:participation_capture,create');
        Route::post("/ocr-ine", [ParticipationController::class, 'ocrIne'])->middleware('permission:participation_capture,create');
        Route::get("/", [ParticipationController::class, 'index']);
        Route::get("/selectIndex", [ParticipationController::class, 'selectIndex']);
        Route::post("/createOrUpdate", [ParticipationController::class, 'createOrUpdate']);
        Route::get("/id/{id}", [ParticipationController::class, 'show']);
        Route::delete("/delete/{id}", [ParticipationController::class, 'delete']);
        Route::get("/disEnable/{id}/{active}", [ParticipationController::class, 'disEnable']);
        Route::delete("/deleteMultiple", [ParticipationController::class, 'deleteMultiple']);
    });

    // Rutas para la gestión de boletas
    Route::prefix("ballots")->group(function () {
        Route::post("/open", [BallotController::class, 'openWithOtp'])->middleware('permission:ballot,create');
        Route::post("/submit", [BallotController::class, 'submitWithToken'])->middleware('permission:ballot,create');
        Route::get("/", [BallotController::class, 'index']);
        Route::get("/selectIndex", [BallotController::class, 'selectIndex']);
        Route::post("/createOrUpdate", [BallotController::class, 'createOrUpdate']);
        Route::get("/id/{id}", [BallotController::class, 'show']);
        Route::delete("/delete/{id}", [BallotController::class, 'delete']);
        Route::get("/disEnable/{id}/{active}", [BallotController::class, 'disEnable']);
        Route::delete("/deleteMultiple", [BallotController::class, 'deleteMultiple']);
    });

    Route::prefix("events")->group(function () {
        Route::get("/", [EventController::class, 'index'])->middleware('permission:events,view');
        Route::get("/selectIndex", [EventController::class, 'selectIndex'])->middleware('permission:participation_capture,view');
        Route::post("/createOrUpdate", [EventController::class, 'createOrUpdate'])->middleware('permission:events,update');
        Route::get("/id/{id}", [EventController::class, 'show'])->middleware('permission:events,view');
        Route::get("/disEnable/{id}/{active}", [EventController::class, 'disEnable'])->middleware('permission:events,delete');
    });

    // Dashboard
    Route::prefix("statistics")->group(function () {
        Route::get('/dashboard', [StatisticsController::class, 'dashboard']);
    });




    //     Route::get('/export', [DashboardController::class, 'exportDashboard']);
    //     Route::get('/ported', [ProductController::class, 'getPortedProducts']);
    //     Route::get('/ported/report-by-seller', [ProductController::class, 'getPortabilityBySellerReport']);

    //     Route::post('/by-seller', [DashboardController::class, 'getSellerDashboard']);
    //     Route::post('/getReporter', [DashboardController::class, 'getReporter']);
    // });

    // ----------------- RUTAS BASICAS -----------------
});
