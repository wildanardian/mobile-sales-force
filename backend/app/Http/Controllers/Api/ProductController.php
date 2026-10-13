<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return ApiResponse::success(Product::orderBy('name')->get(['id', 'name', 'category']), 'Produk berhasil diambil');
    }
}
