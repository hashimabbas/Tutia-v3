<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_leads', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->string('name');
            $table->string('email');
            $table->string('phone', 50)->nullable();
            $table->string('company', 255)->nullable();
            $table->string('service', 255)->nullable();
            $table->string('project_type', 255)->nullable();
            $table->string('budget', 255)->nullable();
            $table->string('timeline', 255)->nullable();
            $table->string('time_slot', 50)->nullable();
            $table->text('message')->nullable();
            $table->text('brief')->nullable();
            $table->text('requirements')->nullable();
            $table->string('stage', 50)->default('new');
            $table->string('priority', 20)->default('medium');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_leads');
    }
};
