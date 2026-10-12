<?php

namespace App\Models;

use App\Enums\CallListStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['user_id', 'period', 'status', 'submitted_at', 'decided_at'])]
class CallList extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(MasterCustomer::class, 'call_list_doctors', 'call_list_id', 'doctor_id');
    }

    protected $casts = [
        'status'       => CallListStatus::class,
        'period'       => 'date:Y-m-d',
        'submitted_at' => 'datetime',
        'decided_at'   => 'datetime',
    ];
}
