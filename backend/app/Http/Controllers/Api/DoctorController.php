<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterCustomer;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = MasterCustomer::all();

        return ApiResponse::success($doctors, 'Doctors retrieved successfully');
    }
}
