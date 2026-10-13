<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CallActualController;
use App\Http\Controllers\Api\CallListController;
use App\Http\Controllers\Api\CallPlanController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::post('refresh', [AuthController::class, 'refresh']);
Route::post('logout', [AuthController::class, 'logout']);

Route::middleware('auth:api')->group(function () {
    Route::get('me', [AuthController::class, 'me']);

    Route::get('doctors', [DoctorController::class, 'index']);

    Route::get('products', [ProductController::class, 'index']);

    Route::get('call-lists/draft', [CallListController::class, 'draft']);
    Route::get('call-lists/pending-approval', [CallListController::class, 'pendingApproval']);
    Route::get('call-lists/decisions', [CallListController::class, 'decisions']);
    Route::apiResource('call-lists', CallListController::class)->only(['index', 'store', 'show']);
    Route::patch('call-lists/{id}/submit', [CallListController::class, 'submit']);
    Route::patch('call-lists/{id}/approve', [CallListController::class, 'approve']);
    Route::patch('call-lists/{id}/resubmit', [CallListController::class, 'update']);

    Route::apiResource('call-plans', CallPlanController::class)->only(['index', 'store']);
    Route::get('call-plans/{id}', [CallPlanController::class, 'show']);

    Route::apiResource('call-actuals', CallActualController::class)->only(['index', 'store']);
});
