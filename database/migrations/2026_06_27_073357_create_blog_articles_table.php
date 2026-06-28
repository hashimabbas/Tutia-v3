<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('featured_image')->nullable();
            $table->string('featured_image_alt')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('blog_authors')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('blog_categories')->nullOnDelete();
            $table->string('status', 20)->default('draft')->index();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedInteger('featured_order')->default(0);
            $table->unsignedBigInteger('view_count')->default(0);
            $table->unsignedSmallInteger('reading_time')->default(0);
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 160)->nullable();
            $table->string('seo_keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_image')->nullable();
            $table->string('twitter_card', 20)->default('summary_large_image');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index(['is_featured', 'featured_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_articles');
    }
};
