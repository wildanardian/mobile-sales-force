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
        $marketing = User::create([
            'name' => 'Marketing Manager',
            'email' => 'mm@gmail.com',
            'password' => bcrypt('password'),
            'role' => Role::MM->value,
        ]);

        $regional = User::create([
            'name' => 'Regional Sales Manager',
            'email' => 'rsm@gmail.com',
            'password' => bcrypt('password'),
            'role' => Role::RSM->value,
            'manager_id' => $marketing->id,
        ]);

        $district = User::create([
            'name' => 'District Manager',
            'email' => 'dm@gmail.com',
            'password' => bcrypt('password'),
            'role' => Role::DM->value,
            'manager_id' => $regional->id,
        ]);

        $district2 = User::create([
            'name' => 'District Manager 2',
            'email' => 'dm2@gmail.com',
            'password' => bcrypt('password'),
            'role' => Role::DM->value,
            'manager_id' => $regional->id,
        ]);

        User::create([
            'name' => 'Medical Representative',
            'email' => 'mr@gmail.com',
            'password' => bcrypt('password'),
            'role' => Role::MR->value,
            'manager_id' => $district->id,
        ]);

        User::create([
            'name' => 'Medical Representative 2',
            'email' => 'mr2@gmail.com',
            'password' => bcrypt('password'),
            'role' => Role::MR->value,
            'manager_id' => $district2->id,
        ]);
    }
}
