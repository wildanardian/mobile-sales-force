<?php

namespace App\Http\Resources;

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
        return [
            'id'           => $this->id,
            'period'       => $this->period->format('Y-m'),
            'status'       => $this->status->value,
            'submitted_at' => $this->submitted_at,
            'doctors'      => $this->whenLoaded(
                'doctors',
                fn() =>
                $this->doctors->map(fn($d) => [
                    'id'             => $d->id,
                    'name'           => $d->name,
                    'specialization' => $d->specialization,
                ])
            ),
        ];
    }
}
