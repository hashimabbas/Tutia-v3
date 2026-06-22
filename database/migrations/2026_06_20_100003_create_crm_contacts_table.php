<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_contacts', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 200)->nullable()->index();
            $table->string('phone', 50)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->string('job_title', 200)->nullable();
            $table->string('department', 200)->nullable();
            $table->string('linkedin_url', 500)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->string('influence_role', 30)->nullable()->comment('decision_maker, influencer, champion, blocker');
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->softDeletes();
            $table->timestamps();

            $table->index('owner_id');
            $table->index('influence_role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_contacts');
    }
};
