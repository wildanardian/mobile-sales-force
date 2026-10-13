<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['call_list_id', 'doctor_id'])]
class CallListDoctor extends Model
{
    public function callList()
    {
        return $this->belongsTo(CallList::class);
    }

    public function doctor()
    {
        return $this->belongsTo(MasterCustomer::class, 'doctor_id');
    }
}
