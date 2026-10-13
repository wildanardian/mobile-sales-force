<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['call_actual_id', 'product_id'])]
class CallActualProduct extends Model
{
    public function callActual()
    {
        return $this->belongsTo(CallActual::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
