<?php

namespace App\Models;

use App\Enums\CallListStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['user_id', 'period', 'status', 'submitted_at', 'decided_at'])]
class CallList extends Model
{
    protected $casts = [
        'status'       => CallListStatus::class,
        'period'       => 'date:Y-m-d',
        'submitted_at' => 'datetime',
        'decided_at'   => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(MasterCustomer::class, 'call_list_doctors', 'call_list_id', 'doctor_id');
    }

    public function approvals()
    {
        return $this->hasMany(CallListApproval::class);
    }

    public function transitionTo(CallListStatus $next): void
    {
        if (!$this->status->canTransitionTo($next)) {
            throw new \InvalidArgumentException("Cannot transition from {$this->status->value} to {$next->value}");
        }
        $this->status = $next;
    }

    public function submit(): void
    {
        $this->transitionTo(CallListStatus::SUBMITTED);
        $this->transitionTo(CallListStatus::PENDING_APPROVAL);
        $this->submitted_at = now();
        $this->decided_at = null;
        $this->save();
    }
}
