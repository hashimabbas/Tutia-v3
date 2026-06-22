<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category');
            $table->string('type')->default('service');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->string('unit_type', 20)->default('unit');
            $table->unsignedSmallInteger('version')->default(1);
            $table->foreignId('parent_id')->nullable()->constrained('crm_products')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('crm_quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained('crm_deals')->cascadeOnDelete();
            $table->unsignedSmallInteger('version')->default(1);
            $table->string('status')->default('draft');
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('discount_total', 14, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(15.00);
            $table->decimal('tax_total', 14, 2)->default(0);
            $table->decimal('grand_total', 14, 2)->default(0);
            $table->text('payment_terms')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['deal_id', 'version']);
        });

        Schema::create('crm_quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained('crm_quotations')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('crm_products')->nullOnDelete();
            $table->string('product_name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('net_price', 12, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('crm_quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('period', 20);
            $table->string('type', 20)->default('quarterly');
            $table->decimal('amount', 14, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'period']);
        });

        Schema::create('crm_deal_risks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained('crm_deals')->cascadeOnDelete();
            $table->string('description');
            $table->string('severity', 10)->default('medium');
            $table->text('mitigation')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('crm_deal_competitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained('crm_deals')->cascadeOnDelete();
            $table->string('name');
            $table->string('position', 20)->default('competitive');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['deal_id', 'name']);
        });

        Schema::table('crm_deals', function (Blueprint $table) {
            $table->string('forecast_category', 20)->nullable()->after('probability');
            $table->foreignId('quota_id')->nullable()->after('owner_id')->constrained('crm_quotas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('crm_deals', function (Blueprint $table) {
            $table->dropForeign(['quota_id']);
            $table->dropColumn(['forecast_category', 'quota_id']);
        });

        Schema::dropIfExists('crm_deal_competitors');
        Schema::dropIfExists('crm_deal_risks');
        Schema::dropIfExists('crm_quotas');
        Schema::dropIfExists('crm_quotation_items');
        Schema::dropIfExists('crm_quotations');
        Schema::dropIfExists('crm_products');
    }
};
