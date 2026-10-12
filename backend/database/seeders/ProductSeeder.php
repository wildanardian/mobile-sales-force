<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $names = range('A', 'Z');

        $categories = [
            'Category 1',
            'Category 2',
            'Category 3',
            'Category 4',
            'Category 5',
        ];

        foreach ($names as $index => $letter) {
            Product::create([
                'name' => "Product $letter",
                'category' => $categories[$index % count($categories)],
            ]);
        }
    }
}
