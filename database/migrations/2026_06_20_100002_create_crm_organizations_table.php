<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('domain', 200)->nullable()->index();
            $table->string('industry', 100)->nullable();
            $table->string('size', 50)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('website', 200)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->softDeletes();
            $table->timestamps();

            $table->index('name');
            $table->index('industry');
            $table->index('owner_id');
        });

        Schema::create('crm_organization_classification', function (Blueprint $table) {
            $table->foreignId('organization_id')->constrained('crm_organizations')->cascadeOnDelete();
            $table->foreignId('classification_id')->constrained('crm_classifications')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['organization_id', 'classification_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_organization_classification');
        Schema::dropIfExists('crm_organizations');
    }
};
