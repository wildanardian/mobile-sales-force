<?php

namespace App\Models;

use App\Enums\CallPlanStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['call_list_id', 'user_id', 'doctor_id', 'plan_date', 'plan_time', 'status'])]
class CallPlan extends Model
{
    protected $casts = [
        'plan_date' => 'date:Y-m-d',
        'status'    => CallPlanStatus::class,
    ];

    public function callList()
    {
        return $this->belongsTo(CallList::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctor()
    {
        return $this->belongsTo(MasterCustomer::class, 'doctor_id');
    }

    public function actual()
    {
        return $this->hasOne(CallActual::class, 'plan_id');
    }
}
