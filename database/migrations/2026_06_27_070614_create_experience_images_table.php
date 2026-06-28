<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experience_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('experience_event_id')->constrained()->cascadeOnDelete();
            $table->string('image');
            $table->string('caption')->nullable();
            $table->string('alt_text')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index(['experience_event_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experience_images');
    }
};
