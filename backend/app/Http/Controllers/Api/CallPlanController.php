<?php

namespace App\Http\Controllers\Api;

use App\Enums\CallListStatus;
use App\Enums\CallPlanStatus;
use App\Http\Controllers\Controller;
use App\Models\CallList;
use App\Models\CallPlan;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;

class CallPlanController extends Controller
{
    public function index(Request $request)
    {
        $plans = CallPlan::with('doctor:id,name,specialization')
            ->where('user_id', $request->user()->id)
            ->orderBy('plan_date')
            ->orderBy('plan_time')
            ->get();

        return ApiResponse::success($plans, 'Call plans retrieved successfully');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'call_list_id' => 'required|integer|exists:call_lists,id',
            'doctor_id' => 'required|integer|exists:master_customers,id',
            'plan_date' => 'required|date_format:Y-m-d',
            'plan_time' => 'required|date_format:H:i',
        ]);

        $user = $request->user();

        $callList = CallList::findOrFail($validated['call_list_id']);

        if ($callList->user_id !== $user->id) {
            return ApiResponse::error('You are not authorized to create a call plan for this call list', 403);
        }

        if ($callList->status !== CallListStatus::APPROVED) {
            return ApiResponse::error('Call plan can only be created for approved call lists', 422);
        }

        $doctorInList = $callList->doctors()
            ->where('master_customers.id', $validated['doctor_id'])
            ->exists();

        if (!$doctorInList) {
            return ApiResponse::error('The specified doctor is not in the call list', 422);
        }

        $planDate = Carbon::createFromFormat('!Y-m-d', $validated['plan_date']);

        if (!$planDate->isSameMonth($callList->period, true)) {
            return ApiResponse::error('Plan date must be within the same month as the call list period', 422);
        }

        if ($planDate->lt(today())) {
            return ApiResponse::error('Plan date cannot be in the past', 422);
        }

        $duplicatePlan = CallPlan::where('doctor_id', $validated['doctor_id'])
            ->whereDate('plan_date', $planDate->toDateString())
            ->where('status', '!=', CallPlanStatus::CANCELLED->value)
            ->exists();

        if ($duplicatePlan) {
            return ApiResponse::error('A call plan for this doctor on the specified date already exists', 422);
        }

        try {
            $plan = CallPlan::create([
                'call_list_id' => $validated['call_list_id'],
                'user_id' => $user->id,
                'doctor_id' => $validated['doctor_id'],
                'plan_date' => $planDate->toDateString(),
                'plan_time' => $validated['plan_time'],
                'status' => CallPlanStatus::PLANNED->value,
            ]);
        } catch (UniqueConstraintViolationException $e) {
            return ApiResponse::error('A call plan for this doctor on the specified date already exists', 409);
        }

        return ApiResponse::success($plan->load('doctor:id,name,specialization'), 'Call plan created successfully');
    }

    public function show(Request $request, int $id)
    {
        $user = $request->user();

        $plan = CallPlan::with('doctor:id,name,specialization')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$plan) {
            return ApiResponse::error('Call plan tidak ditemukan', 404);
        }

        return ApiResponse::success($plan, 'Call plan berhasil diambil');
    }
}
