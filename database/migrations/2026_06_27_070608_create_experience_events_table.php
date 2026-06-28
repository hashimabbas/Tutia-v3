<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experience_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->date('event_date');
            $table->string('cover_image')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->string('slug')->unique();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_published');
            $table->index('is_featured');
            $table->index(['is_published', 'event_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experience_events');
    }
};
