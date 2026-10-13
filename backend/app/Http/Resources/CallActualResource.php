<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CallActualResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    // app/Http/Resources/CallActualResource.php
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'plan_id'       => $this->plan_id,
            'visit_type'    => $this->visit_type->value,
            'visit_date'    => $this->visit_date->format('Y-m-d'),
            'check_in'      => $this->check_in,
            'check_out'     => $this->check_out,
            'photo_url'     => $this->photo_url,
            'signature_url' => $this->signature_url,
            'doctor'        => $this->whenLoaded('doctor', fn() => [
                'id' => $this->doctor->id,
                'name' => $this->doctor->name,
                'specialization' => $this->doctor->specialization,
            ]),
            'products'      => $this->whenLoaded(
                'products',
                fn() =>
                $this->products->map(fn($p) => ['id' => $p->id, 'name' => $p->name])
            ),
        ];
    }
}
