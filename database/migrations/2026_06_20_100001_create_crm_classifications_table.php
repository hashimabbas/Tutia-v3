<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_classifications', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->timestamps();
        });

        DB::table('crm_classifications')->insert([
            ['slug' => 'customer', 'name' => 'Customer'],
            ['slug' => 'partner', 'name' => 'Partner'],
            ['slug' => 'supplier', 'name' => 'Supplier'],
            ['slug' => 'government', 'name' => 'Government Entity'],
            ['slug' => 'ngo', 'name' => 'Non-Profit / NGO'],
            ['slug' => 'merchant', 'name' => 'Marketplace Merchant'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_classifications');
    }
};
