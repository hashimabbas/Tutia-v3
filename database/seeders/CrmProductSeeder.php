<?php

namespace Database\Seeders;

use App\Models\CrmProduct;
use Illuminate\Database\Seeder;

class CrmProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'ERP Pro', 'category' => 'erp', 'type' => 'service', 'unit_price' => 25000, 'unit_type' => 'license'],
            ['name' => 'ERP Basic', 'category' => 'erp', 'type' => 'service', 'unit_price' => 12000, 'unit_type' => 'license'],
            ['name' => 'ERP Module', 'category' => 'erp', 'type' => 'service', 'unit_price' => 5000, 'unit_type' => 'license'],
            ['name' => 'Dedicated Internet', 'category' => 'connectivity', 'type' => 'subscription', 'unit_price' => 1500, 'unit_type' => 'unit'],
            ['name' => 'MPLS', 'category' => 'connectivity', 'type' => 'subscription', 'unit_price' => 3000, 'unit_type' => 'unit'],
            ['name' => 'SD-WAN', 'category' => 'connectivity', 'type' => 'subscription', 'unit_price' => 2000, 'unit_type' => 'unit'],
            ['name' => 'Fiber Lease', 'category' => 'connectivity', 'type' => 'subscription', 'unit_price' => 1000, 'unit_type' => 'unit'],
            ['name' => 'Site-to-Site VPN', 'category' => 'vpn', 'type' => 'subscription', 'unit_price' => 800, 'unit_type' => 'unit'],
            ['name' => 'Remote Access VPN', 'category' => 'vpn', 'type' => 'subscription', 'unit_price' => 500, 'unit_type' => 'license'],
            ['name' => 'SSL VPN', 'category' => 'vpn', 'type' => 'subscription', 'unit_price' => 600, 'unit_type' => 'license'],
            ['name' => 'Standard SMS', 'category' => 'bulk_sms', 'type' => 'service', 'unit_price' => 0.05, 'unit_type' => 'unit'],
            ['name' => 'Premium SMS', 'category' => 'bulk_sms', 'type' => 'service', 'unit_price' => 0.10, 'unit_type' => 'unit'],
            ['name' => 'OTP SMS', 'category' => 'bulk_sms', 'type' => 'service', 'unit_price' => 0.03, 'unit_type' => 'unit'],
            ['name' => 'SMS API', 'category' => 'bulk_sms', 'type' => 'service', 'unit_price' => 500, 'unit_type' => 'license'],
            ['name' => 'Standard Gateway', 'category' => 'payment_gateway', 'type' => 'service', 'unit_price' => 2000, 'unit_type' => 'unit'],
            ['name' => 'Recurring Billing', 'category' => 'payment_gateway', 'type' => 'service', 'unit_price' => 3500, 'unit_type' => 'unit'],
            ['name' => 'Invoice Link', 'category' => 'payment_gateway', 'type' => 'service', 'unit_price' => 1000, 'unit_type' => 'unit'],
            ['name' => 'Custom Development (Hourly)', 'category' => 'custom_development', 'type' => 'service', 'unit_price' => 150, 'unit_type' => 'hour'],
            ['name' => 'Fixed-Price Project', 'category' => 'custom_development', 'type' => 'service', 'unit_price' => 10000, 'unit_type' => 'unit'],
            ['name' => 'Retainer', 'category' => 'custom_development', 'type' => 'service', 'unit_price' => 5000, 'unit_type' => 'unit'],
            ['name' => 'Strategy Consulting', 'category' => 'consulting', 'type' => 'service', 'unit_price' => 200, 'unit_type' => 'hour'],
            ['name' => 'Implementation Consulting', 'category' => 'consulting', 'type' => 'service', 'unit_price' => 180, 'unit_type' => 'hour'],
            ['name' => 'Migration Consulting', 'category' => 'consulting', 'type' => 'service', 'unit_price' => 180, 'unit_type' => 'hour'],
            ['name' => 'Audit Consulting', 'category' => 'consulting', 'type' => 'service', 'unit_price' => 250, 'unit_type' => 'hour'],
        ];

        foreach ($products as $data) {
            CrmProduct::firstOrCreate(
                ['name' => $data['name'], 'version' => 1],
                array_merge($data, ['description' => null, 'is_active' => true, 'version' => 1, 'parent_id' => null]),
            );
        }
    }
}
