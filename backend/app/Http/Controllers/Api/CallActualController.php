<?php

namespace App\Http\Controllers\Api;

use App\Enums\CallListStatus;
use App\Enums\CallPlanStatus;
use App\Enums\VisitType;
use App\Http\Controllers\Controller;
use App\Http\Resources\CallActualResource;
use App\Models\CallActual;
use App\Models\CallList;
use App\Models\CallPlan;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CallActualController extends Controller
{
    private const MAX_BACKDATE_DAYS = 7;

    public function index(Request $request)
    {
        $request->validate(['month' => 'nullable|date_format:Y-m']);

        $actuals = CallActual::query()
            ->where('user_id', $request->user()->id)
            ->when($request->filled('month'), function ($q) use ($request) {
                $start = Carbon::createFromFormat('!Y-m', $request->month)->startOfMonth();
                $q->whereBetween('visit_date', [$start->toDateString(), $start->copy()->endOfMonth()->toDateString()]);
            })
            ->with(['doctor:id,name,specialization', 'products:id,name'])
            ->orderByDesc('visit_date')
            ->orderByDesc('check_in')
            ->get();

        return ApiResponse::success(CallActualResource::collection($actuals), 'Call actual berhasil diambil');
    }

    public function store(Request $request)
    {
        // 1. Validasi format
        $v = $request->validate([
            'plan_id'       => 'nullable|integer|exists:call_plans,id',
            'doctor_id'     => 'required|integer|exists:master_customers,id',
            'visit_date'    => 'required|date_format:Y-m-d',
            'check_in'      => 'required|date_format:H:i:s',
            'check_out'     => 'required|date_format:H:i:s|after:check_in',
            'photo_url'     => 'required|url:http,https|max:2048',
            'signature_url' => 'required|url:http,https|max:2048',
            'products'      => 'required|array|min:1',
            'products.*'    => 'integer|distinct|exists:products,id',
        ]);

        $user      = $request->user();
        $visitDate = Carbon::createFromFormat('!Y-m-d', $v['visit_date']);

        // 2. Aturan tanggal
        if ($visitDate->gt(today())) {
            return ApiResponse::error('Tanggal kunjungan tidak boleh di masa depan.', 422);
        }
        if ($visitDate->lt(today()->subDays(self::MAX_BACKDATE_DAYS))) {
            return ApiResponse::error(
                'Tanggal kunjungan maksimal ' . self::MAX_BACKDATE_DAYS . ' hari ke belakang.',
                422
            );
        }
        if (
            $visitDate->isToday()
            && Carbon::createFromFormat('H:i:s', $v['check_out'])->gt(now())
        ) {
            return ApiResponse::error('Jam check-out tidak boleh melewati waktu sekarang.', 422);
        }

        // 3. Double visit (semua jalur)
        $alreadyVisited = CallActual::where('doctor_id', $v['doctor_id'])
            ->whereDate('visit_date', $visitDate->toDateString())
            ->exists();

        if ($alreadyVisited) {
            return ApiResponse::error('Dokter ini sudah dikunjungi pada tanggal tersebut.', 409);
        }

        // 4. Tentukan jenis kunjungan
        if (! empty($v['plan_id'])) {
            $plan = CallPlan::findOrFail($v['plan_id']);

            if ($plan->user_id !== $user->id) {
                return ApiResponse::error('Call Plan ini bukan milik Anda.', 403);
            }
            if ($plan->status === CallPlanStatus::CANCELLED) {
                return ApiResponse::error('Call Plan ini sudah dibatalkan.', 409);
            }
            if ($plan->doctor_id !== (int) $v['doctor_id']) {
                return ApiResponse::error('Dokter tidak sesuai dengan Call Plan.', 422);
            }
            if ($plan->plan_date->toDateString() !== $visitDate->toDateString()) {
                return ApiResponse::error('Tanggal kunjungan harus sama dengan tanggal Call Plan.', 422);
            }
            if (CallActual::where('plan_id', $plan->id)->exists()) {
                return ApiResponse::error('Call Plan ini sudah memiliki kunjungan.', 409);
            }

            $visitType = VisitType::PLANNED;
        } else {
            // Plan aktif yang belum diaktualisasi memesan slot dokter + tanggal ini (berlaku
            // global, siapa pun pemiliknya): kunjungan hanya boleh dicatat lewat plan tersebut.
            $reservingPlans = CallPlan::where('doctor_id', $v['doctor_id'])
                ->whereDate('plan_date', $visitDate->toDateString())
                ->where('status', CallPlanStatus::PLANNED->value)
                ->whereDoesntHave('actual')
                ->get(['id', 'user_id']);

            if ($reservingPlans->contains('user_id', $user->id)) {
                return ApiResponse::error(
                    'Dokter ini sudah punya Call Plan pada tanggal tersebut. Gunakan mode "Sesuai Call Plan".',
                    409
                );
            }
            if ($reservingPlans->isNotEmpty()) {
                return ApiResponse::error(
                    'Dokter ini sudah terjadwal pada tanggal tersebut melalui Call Plan lain.',
                    409
                );
            }

            $inApprovedList = CallList::where('user_id', $user->id)
                ->where('status', CallListStatus::APPROVED->value)
                ->whereDate('period', $visitDate->copy()->startOfMonth()->toDateString())
                ->whereHas('doctors', fn($q) => $q->where('master_customers.id', $v['doctor_id']))
                ->exists();

            $visitType = $inApprovedList ? VisitType::UNPLAN : VisitType::NON_TARGET;
        }

        // 5. Simpan (dua tabel -> transaksi)
        try {
            $actual = DB::transaction(function () use ($v, $user, $visitDate, $visitType) {
                $actual = CallActual::create([
                    'plan_id'       => $v['plan_id'] ?? null,
                    'user_id'       => $user->id,                 // dari token
                    'doctor_id'     => $v['doctor_id'],
                    'visit_date'    => $visitDate->toDateString(),
                    'check_in'      => $v['check_in'],
                    'check_out'     => $v['check_out'],
                    'photo_url'     => $v['photo_url'],
                    'signature_url' => $v['signature_url'],
                    'visit_type'    => $visitType,                // ditentukan backend
                ]);

                $actual->products()->sync($v['products']);

                return $actual;
            });
        } catch (UniqueConstraintViolationException $e) {
            return ApiResponse::error('Dokter ini sudah dikunjungi pada tanggal tersebut.', 409);
        }

        return ApiResponse::created(
            new CallActualResource($actual->load(['doctor:id,name,specialization', 'products:id,name'])),
            'Call actual berhasil dibuat'
        );
    }
}
