<?php

namespace App\Http\Resources;

use App\Enums\CallListStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CallListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Riwayat keputusan, terbaru di atas (hanya bila relasinya dimuat)
        $approvals = $this->relationLoaded('approvals')
            ? $this->approvals->sortByDesc('id')->values()
            : null;
        $latest = $approvals?->first();

        return [
            'id'           => $this->id,
            'period'       => $this->period->format('Y-m'),
            'status'       => $this->status->value,
            'created_at'   => $this->created_at,
            'submitted_at' => $this->submitted_at,
            // Pengaju, hanya bila relasinya dimuat (antrean persetujuan dan detail)
            'user'         => $this->whenLoaded('user', fn() => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
                'role' => $this->user->role->value,
            ]),
            // Terisi hanya selama call list masih draft hasil penolakan terakhir
            'last_rejection' => $this->when(
                $approvals !== null,
                fn() => $this->status === CallListStatus::DRAFT && $latest?->decision === 'rejected'
                    ? ['reason' => $latest->reason, 'decided_at' => $latest->decided_at]
                    : null
            ),
            'approvals' => $this->when(
                $approvals !== null && $request->routeIs('call-lists.show'),
                fn() => $approvals->map(fn($a) => [
                    'decision'      => $a->decision,
                    'reason'        => $a->reason,
                    'decided_at'    => $a->decided_at,
                    'approver_name' => $a->approver?->name,
                ])
            ),
            'doctors'      => $this->whenLoaded(
                'doctors',
                fn() =>
                $this->doctors->map(fn($d) => [
                    'id'             => $d->id,
                    'name'           => $d->name,
                    'specialization' => $d->specialization,
                    'address'        => $d->address,
                ])
            ),
        ];
    }
}
