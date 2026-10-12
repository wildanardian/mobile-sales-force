<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create(
            [
                'name' => 'Medical Representative',
                'email' => 'mr@gmail.com',
                'password' => bcrypt('password'),
                'role' => Role::MR->value,
            ],
            [
                'name' => 'District Manager',
                'email' => 'dm@gmail.com',
                'password' => bcrypt('password'),
                'role' => Role::DM->value,
            ],
            [
                'name' => 'Regional Sales Manager',
                'email' => 'rsm@gmail.com',
                'password' => bcrypt('password'),
                'role' => Role::RSM->value,
            ],
            [
                'name' => 'Marketing Manager',
                'email' => 'mm@gmail.com',
                'password' => bcrypt('password'),
                'role' => Role::MM->value,
            ]
        );
    }
}
