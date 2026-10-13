<?php

namespace App\Models;

use App\Enums\VisitType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['plan_id', 'user_id', 'doctor_id', 'visit_date', 'check_in', 'check_out', 'photo_url', 'signature_url', 'visit_type'])]
class CallActual extends Model
{
    protected $casts = [
        'visit_date' => 'date:Y-m-d',
        'visit_type' => VisitType::class,
    ];

    public function callPlan()
    {
        return $this->belongsTo(CallPlan::class, 'plan_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctor()
    {
        return $this->belongsTo(MasterCustomer::class, 'doctor_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'call_actual_products', 'call_actual_id', 'product_id');
    }
}
