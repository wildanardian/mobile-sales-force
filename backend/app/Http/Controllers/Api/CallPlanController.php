<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class CallPlanController extends Controller
{
    public function index()
    {
        return ApiResponse::success([], 'Call plans retrieved successfully');
    }
}
