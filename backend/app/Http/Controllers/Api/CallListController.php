<?php

namespace App\Http\Controllers\Api;

use App\Enums\CallListStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CallListResource;
use App\Models\CallList;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CallListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return ApiResponse::success([], 'Call lists retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi request data
        $request->validate([
            'period' => [
                'required',
                'date_format:Y-m',
                function ($attribute, $value, $fail) {
                    $month = Carbon::createFromFormat('!Y-m', $value)->startOfMonth();
                    if ($month->lt(now()->startOfMonth())) {
                        $fail('Bulan Call List tidak boleh bulan yang sudah lewat.');
                    }
                },
            ],
            'doctor_ids' => 'required|array|min:1',
            'doctor_ids.*' => 'integer|distinct|exists:master_customers,id',
        ], [
            'period.date_format'    => 'Format bulan harus YYYY-MM.',
            'doctor_ids.required'   => 'Pilih minimal 1 dokter.',
            'doctor_ids.min'        => 'Pilih minimal 1 dokter.',
            'doctor_ids.*.distinct' => 'Dokter tidak boleh duplikat.',
            'doctor_ids.*.exists'   => 'Dokter tidak terdaftar di MCL.',
        ]);


        $user = $request->user();

        if ($user->role === 'mm') {
            return ApiResponse::error('Role MM tidak dapat membuat call list', 403);
        }

        $period = Carbon::createFromFormat('Y-m', $request->period)->startOfMonth();
        $exists = CallList::where('user_id', $user->id)
            ->whereDate('period', $period->toDateString())
            ->exists();

        if ($exists) {
            return ApiResponse::error('Call list anda untuk periode ini sudah ada', 409);
        }

        try {
            $callList = DB::transaction(function () use ($user, $period, $request) {
                $callList = CallList::create([
                    'user_id' => $user->id,
                    'period' => $period->toDateString(),
                    'status' => CallListStatus::DRAFT->value,
                    'submitted_at' => null,
                    'decided_at' => null,
                ]);

                $callList->doctors()->sync($request->doctor_ids);
                return $callList;
            });

            return ApiResponse::created(
                new CallListResource($callList->load('doctors')),
                'CallList berhasil dibuat'
            );
        } catch (UniqueConstraintViolationException $e) {
            return ApiResponse::error('Call list anda untuk periode ini sudah ada', 409);
        } catch (\Exception $e) {
            return ApiResponse::error('Terjadi kesalahan saat membuat call list', 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
