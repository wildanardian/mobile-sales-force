<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['call_list_id', 'approver_id', 'decision', 'reason', 'decided_at'])]
class CallListApproval extends Model
{
    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function callList()
    {
        return $this->belongsTo(CallList::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
