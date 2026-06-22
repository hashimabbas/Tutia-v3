<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_organization_contact', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('crm_organizations')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained('crm_contacts')->cascadeOnDelete();
            $table->string('role', 30)->nullable()->comment('employee, executive, consultant, owner, board_member');
            $table->boolean('is_primary')->default(false);
            $table->string('job_title', 200)->nullable();
            $table->timestamps();

            $table->index('organization_id');
            $table->index('contact_id');
            $table->unique(['organization_id', 'contact_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_organization_contact');
    }
};
