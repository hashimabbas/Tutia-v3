<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('crm_dismissed_actions')) {
            return;
        }

        Schema::create('crm_dismissed_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('dismissable');
            $table->string('rule_key', 100);
            $table->timestamp('dismissed_until');

            $table->unique(['user_id', 'dismissable_type', 'dismissable_id', 'rule_key'], 'crm_dismissed_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_dismissed_actions');
    }
};
