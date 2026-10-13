<?php

namespace App\Http\Controllers\Api;

use App\Enums\CallListStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\CallListResource;
use App\Models\CallList;
use App\Models\CallListApproval;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CallListController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $callLists = CallList::with(['doctors', 'approvals'])
            ->where('user_id', $user->id)
            ->orderByDesc('period')
            ->get();

        return ApiResponse::success(CallListResource::collection($callLists), 'Call lists retrieved successfully');
    }

    public function draft(Request $request)
    {
        $user = $request->user();
        $draftCallList = CallList::with(['doctors', 'approvals'])
            ->where('user_id', $user->id)
            ->where('status', CallListStatus::DRAFT->value)
            ->orderByDesc('period')
            ->first();

        if (!$draftCallList) {
            return ApiResponse::error('No draft call list found', 404);
        }

        return ApiResponse::success(new CallListResource($draftCallList), 'Draft call list retrieved successfully');
    }

    /**
     * Antrean persetujuan: call list pending milik bawahan langsung user login.
     */
    public function pendingApproval(Request $request)
    {
        $user = $request->user();
        $subordinateRole = $user->role->subordinateRole();

        $callLists = CallList::with(['doctors', 'user'])
            ->where('status', CallListStatus::PENDING_APPROVAL->value)
            // Sama dengan aturan User::canApprove: bawahan langsung dan role tepat satu tingkat di bawah
            ->whereHas('user', fn($q) => $q
                ->where('manager_id', $user->id)
                ->where('role', $subordinateRole?->value))
            ->orderBy('submitted_at')
            ->get();

        return ApiResponse::success(
            CallListResource::collection($callLists),
            'Pending call lists retrieved successfully'
        );
    }

    /**
     * Riwayat keputusan yang dibuat user login (terbaru dulu).
     */
    public function decisions(Request $request)
    {
        $request->validate(['decision' => 'nullable|in:approved,rejected']);

        $approvals = CallListApproval::with([
            'callList' => fn($q) => $q->withCount('doctors')->with('user:id,name,role'),
        ])
            ->where('approver_id', $request->user()->id)
            ->when($request->filled('decision'), fn($q) => $q->where('decision', $request->decision))
            ->orderByDesc('decided_at')
            ->orderByDesc('id')
            ->get();

        $data = $approvals->map(fn($a) => [
            'id'            => $a->id,
            'call_list_id'  => $a->call_list_id,
            'decision'      => $a->decision,
            'reason'        => $a->reason,
            'decided_at'    => $a->decided_at,
            'period'        => $a->callList->period->format('Y-m'),
            'doctors_count' => $a->callList->doctors_count,
            'user'          => [
                'id'   => $a->callList->user->id,
                'name' => $a->callList->user->name,
                'role' => $a->callList->user->role->value,
            ],
        ]);

        return ApiResponse::success($data, 'Decisions retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $submit = $request->boolean('submit');

        if ($user->role === Role::MM) {
            return ApiResponse::error('You are not allowed to create a call list', 403);
        }

        if ($submit && !$user->manager_id) {
            return ApiResponse::error('You cannot submit a call list without a manager', 403);
        }

        // Validasi request data
        $validated = $request->validate([
            'period' => [
                'required',
                'date_format:Y-m',
                function ($attribute, $value, $fail) {
                    $month = Carbon::createFromFormat('!Y-m', $value)->startOfMonth();
                    if ($month->lt(now()->startOfMonth())) {
                        $fail('The period must be the current month or a future month.');
                    }
                },
            ],
            'doctor_ids' => 'required|array|min:1',
            'doctor_ids.*' => 'integer|distinct|exists:master_customers,id',
            'submit' => 'sometimes|boolean',
        ]);

        $period = Carbon::createFromFormat('!Y-m', $validated['period'])->startOfMonth();
        $exists = CallList::where('user_id', $user->id)
            ->whereDate('period', $period->toDateString())
            ->exists();

        if ($exists) {
            return ApiResponse::error('Call list already exists for this period', 409);
        }

        try {
            $callList = DB::transaction(function () use ($user, $period, $validated, $submit) {
                $callList = CallList::create([
                    'user_id' => $user->id,
                    'period' => $period->toDateString(),
                    'status' => CallListStatus::DRAFT->value,
                    'submitted_at' => null,
                    'decided_at' => null,
                ]);

                $callList->doctors()->sync($validated['doctor_ids']);

                if ($submit) {
                    $callList->transitionTo(CallListStatus::SUBMITTED);
                    $callList->transitionTo(CallListStatus::PENDING_APPROVAL);
                    $callList->submitted_at = now();
                    $callList->save();
                }

                return $callList;
            });
        } catch (UniqueConstraintViolationException $e) {
            return ApiResponse::error('Call list already exists for this period', 409);
        } catch (\Exception $e) {
            return ApiResponse::error($e->getMessage(), 500);
        }

        return ApiResponse::created(
            new CallListResource($callList->load(['doctors', 'approvals'])),
            'Call list created successfully'
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $callList = CallList::with(['doctors', 'user', 'approvals.approver'])->find($id);

        if (!$callList) {
            return ApiResponse::error('Call list not found', 404);
        }

        // Hanya pemilik atau atasan langsungnya yang boleh melihat
        if ($callList->user_id !== $user->id && !$user->canApprove($callList->user)) {
            return ApiResponse::error('You are not allowed to view this call list', 403);
        }

        return ApiResponse::success(
            new CallListResource($callList),
            'Call list retrieved successfully'
        );
    }

    public function submit(Request $request, string $id)
    {
        $user = $request->user();
        $callList = CallList::where('user_id', $user->id)->findOrFail($id);

        if ($callList->status !== CallListStatus::DRAFT) {
            return ApiResponse::error('Only draft call lists can be submitted', 400);
        }

        if (!$user->manager_id) {
            return ApiResponse::error('You cannot submit a call list without a manager', 403);
        }

        DB::transaction(fn() => $callList->submit());

        return ApiResponse::success(
            new CallListResource($callList->fresh()->load(['doctors', 'approvals'])),
            'Call list submitted successfully'
        );
    }

    /**
     * Approve call list by id
     */
    public function approve(Request $request, string $id)
    {
        $approver = $request->user();
        $callList = CallList::with('user')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'required_if:status,rejected|nullable|string|max:1000',
        ]);

        if ($callList->user_id === $approver->id) {
            return ApiResponse::error('You cannot approve your own call list', 403);
        }

        if (!$approver->canApprove($callList->user)) {
            return ApiResponse::error('You are not allowed to approve this call list', 403);
        }

        if ($callList->status !== CallListStatus::PENDING_APPROVAL) {
            return ApiResponse::error('Call list is not pending approval', 400);
        }

        DB::transaction(function () use ($callList, $validated, $approver) {
            $callList->approvals()->create([
                'approver_id' => $approver->id,
                'decision' => $validated['status'],
                'reason' => $validated['reason'] ?? null,
                'decided_at' => now(),
            ]);

            if ($validated['status'] === 'approved') {
                $callList->transitionTo(CallListStatus::APPROVED);
                $callList->decided_at = now();
            } else {
                // Ditolak: kembali ke draft agar bisa diperbaiki dan diajukan ulang
                $callList->transitionTo(CallListStatus::REJECTED);
                $callList->transitionTo(CallListStatus::DRAFT);
                $callList->decided_at = null;
            }
            $callList->save();
        });

        return ApiResponse::success(
            new CallListResource($callList->fresh()->load('doctors'))
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();

        $callList = CallList::where('user_id', $user->id)->findOrFail($id);

        if ($callList->status !== CallListStatus::DRAFT) {
            return ApiResponse::error('Only draft call lists can be resubmitted', 400);
        }

        $validated = $request->validate([
            'doctor_ids' => 'required|array|min:1',
            'doctor_ids.*' => 'integer|distinct|exists:master_customers,id',
            'submit' => 'sometimes|boolean',
        ]);

        $submit = $request->boolean('submit');

        if ($submit && !$user->manager_id) {
            return ApiResponse::error('You cannot submit a call list without a manager', 403);
        }

        DB::transaction(function () use ($callList, $validated, $submit) {
            $callList->doctors()->sync($validated['doctor_ids']);

            if ($submit) {
                $callList->transitionTo(CallListStatus::SUBMITTED);
                $callList->transitionTo(CallListStatus::PENDING_APPROVAL);
                $callList->submitted_at = now();
                $callList->save();
            }
        });

        return ApiResponse::success(
            new CallListResource($callList->load(['doctors', 'approvals'])),
            'Call list updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
