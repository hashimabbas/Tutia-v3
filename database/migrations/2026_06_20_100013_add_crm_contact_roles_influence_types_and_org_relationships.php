<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ---- Reference Tables ----

        Schema::create('crm_contact_roles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        DB::table('crm_contact_roles')->insert([
            ['slug' => 'employee', 'name' => 'Employee', 'description' => 'Standard employee of the organization'],
            ['slug' => 'executive', 'name' => 'Executive', 'description' => 'C-level or senior leadership'],
            ['slug' => 'consultant', 'name' => 'Consultant', 'description' => 'External consultant or advisor'],
            ['slug' => 'owner', 'name' => 'Owner', 'description' => 'Business owner or founder'],
            ['slug' => 'board_member', 'name' => 'Board Member', 'description' => 'Member of the board of directors'],
        ]);

        Schema::create('crm_contact_influence_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        DB::table('crm_contact_influence_types')->insert([
            ['slug' => 'decision_maker', 'name' => 'Decision Maker', 'description' => 'Has final authority to approve purchases'],
            ['slug' => 'influencer', 'name' => 'Influencer', 'description' => 'Shapes the decision but does not have final authority'],
            ['slug' => 'champion', 'name' => 'Champion', 'description' => 'Advocates internally for your solution'],
            ['slug' => 'blocker', 'name' => 'Blocker', 'description' => 'Resists or blocks the purchasing decision'],
        ]);

        Schema::create('crm_organization_relationship_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        DB::table('crm_organization_relationship_types')->insert([
            ['slug' => 'parent', 'name' => 'Parent Company', 'description' => 'This organization is the parent of the target'],
            ['slug' => 'subsidiary', 'name' => 'Subsidiary', 'description' => 'This organization is a subsidiary of the target'],
            ['slug' => 'partner', 'name' => 'Partner', 'description' => 'Strategic business partnership'],
            ['slug' => 'competitor', 'name' => 'Competitor', 'description' => 'Direct market competitor'],
            ['slug' => 'supplier', 'name' => 'Supplier', 'description' => 'Vendor or supplier relationship'],
        ]);

        // ---- Organization Relationships (Graph Model) ----

        Schema::create('crm_organization_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_org_id')->constrained('crm_organizations')->cascadeOnDelete();
            $table->foreignId('target_org_id')->constrained('crm_organizations')->cascadeOnDelete();
            $table->foreignId('relationship_type_id')->constrained('crm_organization_relationship_types')->cascadeOnDelete();
            $table->unsignedSmallInteger('strength')->default(50)->comment('0-100 relationship strength');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['source_org_id', 'target_org_id', 'relationship_type_id'], 'org_rel_unique');
        });

        // ---- Migrate Contact Influence Role to FK ----

        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->foreignId('influence_type_id')->nullable()
                ->after('influence_role')
                ->constrained('crm_contact_influence_types')
                ->nullOnDelete();
        });

        DB::statement('
            UPDATE crm_contacts
            SET influence_type_id = (SELECT id FROM crm_contact_influence_types WHERE slug = crm_contacts.influence_role)
            WHERE influence_role IS NOT NULL
        ');

        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropIndex(['influence_role']);
        });

        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropColumn('influence_role');
        });

        // ---- Migrate Organization Contact Role to FK ----

        Schema::table('crm_organization_contact', function (Blueprint $table) {
            $table->foreignId('contact_role_id')->nullable()
                ->after('role')
                ->constrained('crm_contact_roles')
                ->nullOnDelete();
        });

        DB::statement('
            UPDATE crm_organization_contact
            SET contact_role_id = (SELECT id FROM crm_contact_roles WHERE slug = crm_organization_contact.role)
            WHERE role IS NOT NULL
        ');

        Schema::table('crm_organization_contact', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        // Restore org_contact.role
        Schema::table('crm_organization_contact', function (Blueprint $table) {
            $table->string('role', 50)->nullable()->after('contact_role_id');
        });

        DB::statement('
            UPDATE crm_organization_contact
            SET role = (SELECT slug FROM crm_contact_roles WHERE id = crm_organization_contact.contact_role_id)
            WHERE contact_role_id IS NOT NULL
        ');

        Schema::table('crm_organization_contact', function (Blueprint $table) {
            $table->dropForeign(['contact_role_id']);
            $table->dropColumn('contact_role_id');
        });

        // Restore contacts.influence_role
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->string('influence_role', 50)->nullable()->after('influence_type_id');
        });

        DB::statement('
            UPDATE crm_contacts
            SET influence_role = (SELECT slug FROM crm_contact_influence_types WHERE id = crm_contacts.influence_type_id)
            WHERE influence_type_id IS NOT NULL
        ');

        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropForeign(['influence_type_id']);
            $table->dropColumn('influence_type_id');
        });

        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->index('influence_role');
        });

        Schema::dropIfExists('crm_organization_relationships');
        Schema::dropIfExists('crm_organization_relationship_types');
        Schema::dropIfExists('crm_contact_influence_types');
        Schema::dropIfExists('crm_contact_roles');
    }
};
