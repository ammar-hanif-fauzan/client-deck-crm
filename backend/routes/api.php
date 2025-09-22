<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});


// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // User routes
    Route::apiResource('users', UserController::class);
    
    // Contact routes
    Route::apiResource('contacts', ContactController::class);
    
    // Project routes
    Route::apiResource('projects', ProjectController::class);
    
    // Legacy user route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
