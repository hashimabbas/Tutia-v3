<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('crm_tags')) {
            Schema::create('crm_tags', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100);
                $table->string('color', 7)->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('crm_taggables')) {
            Schema::create('crm_taggables', function (Blueprint $table) {
                $table->foreignId('tag_id')->constrained('crm_tags')->cascadeOnDelete();
                $table->morphs('taggable');
                $table->primary(['tag_id', 'taggable_type', 'taggable_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_taggables');
        Schema::dropIfExists('crm_tags');
    }
};
