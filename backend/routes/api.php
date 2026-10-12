<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CallListController;
use App\Http\Controllers\Api\CallPlanController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

Route::middleware('auth:api')->group(function () {
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    Route::apiResource('call-lists', CallListController::class)->only(['index', 'store', 'show', 'update']);
    Route::patch('call-lists/{id}/approve', [CallListController::class, 'approve']);

    Route::post('call-plans', [CallPlanController::class, 'index']);
    Route::get('call-plans', [CallPlanController::class, 'index']);
});
