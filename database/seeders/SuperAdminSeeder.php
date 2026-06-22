<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CrmRolePermissionSeeder::class);

        app()->make(PermissionRegistrar::class)->forgetCachedPermissions();

        $user = User::firstOrCreate(
            ['email' => 'hashim267303@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('2673031992'),
                'email_verified_at' => now(),
            ],
        );

        $user->syncRoles(['admin']);

        $user->syncPermissions(Permission::all());
    }
}
