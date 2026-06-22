<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_addresses', function (Blueprint $table) {
            $table->id();
            $table->morphs('addressable');
            $table->string('label', 50)->nullable()->comment('billing, shipping, primary');
            $table->string('line_1', 200);
            $table->string('line_2', 200)->nullable();
            $table->string('city', 100);
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index('label');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_addresses');
    }
};
