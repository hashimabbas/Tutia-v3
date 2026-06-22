<?php

namespace Database\Seeders;

use App\Models\CrmProjectTemplate;
use App\Models\CrmTemplateDeliverable;
use App\Models\CrmTemplateMilestone;
use Illuminate\Database\Seeder;

class CrmProjectTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $this->createErpTemplate();
        $this->createVpnTemplate();
        $this->createConnectivityTemplate();
        $this->createBulkSmsTemplate();
        $this->createPaymentGatewayTemplate();
        $this->createCustomDevelopmentTemplate();
        $this->createConsultingTemplate();
    }

    private function createErpTemplate(): void
    {
        $template = CrmProjectTemplate::create([
            'name' => 'ERP Implementation',
            'category' => 'erp',
            'description' => 'Full ERP implementation lifecycle from discovery through hypercare.',
        ]);

        $discovery = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Discovery',
            'description' => 'Requirements gathering, gap analysis, and project planning.',
            'default_duration_days' => 14,
            'sort_order' => 1,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $discovery->id, 'name' => 'Requirements Document', 'description' => 'Detailed functional and technical requirements.', 'sort_order' => 1],
            ['template_milestone_id' => $discovery->id, 'name' => 'Gap Analysis Report', 'description' => 'Analysis of gaps between requirements and standard system capabilities.', 'sort_order' => 2],
            ['template_milestone_id' => $discovery->id, 'name' => 'Project Plan', 'description' => 'Detailed project schedule with milestones, resources, and dependencies.', 'sort_order' => 3],
        ]);

        $config = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Configuration',
            'description' => 'System configuration, customization, and internal testing.',
            'default_duration_days' => 28,
            'sort_order' => 2,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $config->id, 'name' => 'System Configuration', 'description' => 'System configured per requirements document.', 'sort_order' => 1],
            ['template_milestone_id' => $config->id, 'name' => 'Customization Log', 'description' => 'Record of all customizations made to the standard system.', 'sort_order' => 2],
            ['template_milestone_id' => $config->id, 'name' => 'Internal Test Results', 'description' => 'Results of internal QA testing with pass/fail per requirement.', 'sort_order' => 3],
        ]);

        $migration = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Data Migration',
            'description' => 'Data mapping, migration execution, and validation.',
            'default_duration_days' => 14,
            'sort_order' => 3,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $migration->id, 'name' => 'Data Mapping Document', 'description' => 'Source-to-target data mapping for all entities.', 'sort_order' => 1],
            ['template_milestone_id' => $migration->id, 'name' => 'Migration Execution Report', 'description' => 'Summary of migration run including record counts and errors.', 'sort_order' => 2],
            ['template_milestone_id' => $migration->id, 'name' => 'Validation Report', 'description' => 'Post-migration validation confirming data integrity.', 'sort_order' => 3],
        ]);

        $uat = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'UAT',
            'description' => 'User acceptance testing with customer team.',
            'default_duration_days' => 14,
            'sort_order' => 4,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $uat->id, 'name' => 'Test Cases', 'description' => 'UAT test scenarios and expected results.', 'sort_order' => 1],
            ['template_milestone_id' => $uat->id, 'name' => 'UAT Sign-off', 'description' => 'Formal customer sign-off confirming system meets requirements.', 'sort_order' => 2],
        ]);

        $goLive = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Go Live',
            'description' => 'Production deployment and cutover.',
            'default_duration_days' => 7,
            'sort_order' => 5,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $goLive->id, 'name' => 'Production Deployment', 'description' => 'System deployed to production environment.', 'sort_order' => 1],
            ['template_milestone_id' => $goLive->id, 'name' => 'Cutover Plan', 'description' => 'Step-by-step cutover procedure with rollback steps.', 'sort_order' => 2],
        ]);

        $hypercare = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Hypercare',
            'description' => 'Post-go-live support and handover.',
            'default_duration_days' => 14,
            'sort_order' => 6,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $hypercare->id, 'name' => 'Support Log', 'description' => 'Record of all post-go-live issues and resolutions.', 'sort_order' => 1],
            ['template_milestone_id' => $hypercare->id, 'name' => 'Handover Document', 'description' => 'Operations handover documentation for ongoing support.', 'sort_order' => 2],
            ['template_milestone_id' => $hypercare->id, 'name' => 'Training Completion Report', 'description' => 'Confirmation that customer team training is complete.', 'sort_order' => 3],
        ]);
    }

    private function createVpnTemplate(): void
    {
        $template = CrmProjectTemplate::create([
            'name' => 'VPN Deployment',
            'category' => 'vpn',
            'description' => 'Site-to-site, remote access, or SSL VPN deployment.',
        ]);

        $assessment = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Assessment',
            'description' => 'Network assessment and VPN requirements gathering.',
            'default_duration_days' => 5,
            'sort_order' => 1,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $assessment->id, 'name' => 'Network Assessment Report', 'description' => 'Current network topology and bandwidth analysis.', 'sort_order' => 1],
            ['template_milestone_id' => $assessment->id, 'name' => 'VPN Requirements Specification', 'description' => 'Required sites, users, protocols, and security policies.', 'sort_order' => 2],
        ]);

        $provisioning = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Provisioning',
            'description' => 'VPN infrastructure provisioning and configuration.',
            'default_duration_days' => 10,
            'sort_order' => 2,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $provisioning->id, 'name' => 'VPN Gateway Configuration', 'description' => 'Gateway devices configured with VPN policies.', 'sort_order' => 1],
            ['template_milestone_id' => $provisioning->id, 'name' => 'Tunnel Configuration', 'description' => 'Site-to-site tunnels established and verified.', 'sort_order' => 2],
            ['template_milestone_id' => $provisioning->id, 'name' => 'Client Configuration Package', 'description' => 'Remote access client configurations and installers.', 'sort_order' => 3],
        ]);

        $testing = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Testing',
            'description' => 'Connectivity, throughput, and security testing.',
            'default_duration_days' => 5,
            'sort_order' => 3,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $testing->id, 'name' => 'Connectivity Test Report', 'description' => 'End-to-end connectivity verification for all sites.', 'sort_order' => 1],
            ['template_milestone_id' => $testing->id, 'name' => 'Security Audit Report', 'description' => 'VPN security posture assessment.', 'sort_order' => 2],
            ['template_milestone_id' => $testing->id, 'name' => 'Performance Test Results', 'description' => 'Throughput and latency measurements.', 'sort_order' => 3],
        ]);

        $handover = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Handover',
            'description' => 'Documentation delivery and knowledge transfer.',
            'default_duration_days' => 3,
            'sort_order' => 4,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $handover->id, 'name' => 'VPN Operations Manual', 'description' => 'Administration and troubleshooting guide.', 'sort_order' => 1],
            ['template_milestone_id' => $handover->id, 'name' => 'Network Diagram', 'description' => 'Updated network diagram including VPN topology.', 'sort_order' => 2],
        ]);
    }

    private function createConnectivityTemplate(): void
    {
        $template = CrmProjectTemplate::create([
            'name' => 'Connectivity Setup',
            'category' => 'connectivity',
            'description' => 'Dedicated internet, MPLS, SD-WAN, or fiber lease provisioning.',
        ]);

        $survey = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Site Survey',
            'description' => 'Physical site assessment and infrastructure readiness check.',
            'default_duration_days' => 7,
            'sort_order' => 1,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $survey->id, 'name' => 'Site Survey Report', 'description' => 'Physical inspection results and readiness assessment.', 'sort_order' => 1],
            ['template_milestone_id' => $survey->id, 'name' => 'Infrastructure Requirements', 'description' => 'Required equipment, power, and space specifications.', 'sort_order' => 2],
        ]);

        $provisioning = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Provisioning',
            'description' => 'Circuit provisioning and equipment installation.',
            'default_duration_days' => 21,
            'sort_order' => 2,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $provisioning->id, 'name' => 'Circuit Provisioning Confirmation', 'description' => 'Carrier confirmation of circuit activation.', 'sort_order' => 1],
            ['template_milestone_id' => $provisioning->id, 'name' => 'Equipment Installation Report', 'description' => 'CPE installation and configuration verification.', 'sort_order' => 2],
        ]);

        $testing = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Testing',
            'description' => 'Service verification and performance testing.',
            'default_duration_days' => 5,
            'sort_order' => 3,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $testing->id, 'name' => 'Service Acceptance Test Report', 'description' => 'SAT results confirming service meets SLA.', 'sort_order' => 1],
            ['template_milestone_id' => $testing->id, 'name' => 'Bandwidth & Latency Report', 'description' => 'Measured throughput, latency, and jitter.', 'sort_order' => 2],
        ]);

        $handover = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Handover',
            'description' => 'Service handover with documentation.',
            'default_duration_days' => 3,
            'sort_order' => 4,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $handover->id, 'name' => 'Service Acceptance Certificate', 'description' => 'Customer signed acceptance of the service.', 'sort_order' => 1],
            ['template_milestone_id' => $handover->id, 'name' => 'Circuit Documentation Package', 'description' => 'Circuit IDs, handoff details, and support contacts.', 'sort_order' => 2],
        ]);
    }

    private function createBulkSmsTemplate(): void
    {
        $template = CrmProjectTemplate::create([
            'name' => 'Bulk SMS Integration',
            'category' => 'bulk_sms',
            'description' => 'API setup and integration for bulk SMS services.',
        ]);

        $apiSetup = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'API Setup',
            'description' => 'API key provisioning and account configuration.',
            'default_duration_days' => 3,
            'sort_order' => 1,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $apiSetup->id, 'name' => 'API Key Provisioning', 'description' => 'API credentials generated and securely delivered.', 'sort_order' => 1],
            ['template_milestone_id' => $apiSetup->id, 'name' => 'API Documentation Handover', 'description' => 'API reference documentation with endpoints and examples.', 'sort_order' => 2],
            ['template_milestone_id' => $apiSetup->id, 'name' => 'Account Configuration', 'description' => 'Sender IDs, webhook URLs, and delivery reports configured.', 'sort_order' => 3],
        ]);

        $testing = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Testing',
            'description' => 'API integration testing and message delivery verification.',
            'default_duration_days' => 5,
            'sort_order' => 2,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $testing->id, 'name' => 'Integration Test Results', 'description' => 'API call success rates and response times.', 'sort_order' => 1],
            ['template_milestone_id' => $testing->id, 'name' => 'Message Delivery Report', 'description' => 'End-to-end message delivery confirmation.', 'sort_order' => 2],
        ]);

        $goLive = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Go Live',
            'description' => 'Production cutover and monitoring setup.',
            'default_duration_days' => 3,
            'sort_order' => 3,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $goLive->id, 'name' => 'Production Go Live Confirmation', 'description' => 'Production environment verified and active.', 'sort_order' => 1],
            ['template_milestone_id' => $goLive->id, 'name' => 'Monitoring Dashboard Setup', 'description' => 'Delivery monitoring and alerting configured.', 'sort_order' => 2],
        ]);
    }

    private function createPaymentGatewayTemplate(): void
    {
        $template = CrmProjectTemplate::create([
            'name' => 'Payment Gateway Onboarding',
            'category' => 'payment_gateway',
            'description' => 'Payment gateway account setup, integration, and go-live.',
        ]);

        $accountSetup = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Account Setup',
            'description' => 'Merchant account creation and gateway configuration.',
            'default_duration_days' => 7,
            'sort_order' => 1,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $accountSetup->id, 'name' => 'Merchant Account Created', 'description' => 'Merchant ID and gateway credentials issued.', 'sort_order' => 1],
            ['template_milestone_id' => $accountSetup->id, 'name' => 'Gateway Configuration', 'description' => 'Payment methods, currencies, and routing rules configured.', 'sort_order' => 2],
        ]);

        $integration = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Integration',
            'description' => 'API/SDK integration with customer system.',
            'default_duration_days' => 10,
            'sort_order' => 2,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $integration->id, 'name' => 'Integration Completion', 'description' => 'Payment gateway integrated with customer application.', 'sort_order' => 1],
            ['template_milestone_id' => $integration->id, 'name' => 'Test Transaction Results', 'description' => 'Successful test transactions for all payment methods.', 'sort_order' => 2],
        ]);

        $testing = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Testing',
            'description' => 'End-to-end testing including refunds and reconciliation.',
            'default_duration_days' => 5,
            'sort_order' => 3,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $testing->id, 'name' => 'E2E Test Report', 'description' => 'Full transaction lifecycle testing results.', 'sort_order' => 1],
            ['template_milestone_id' => $testing->id, 'name' => 'Reconciliation Report', 'description' => 'Settlement and reconciliation process verified.', 'sort_order' => 2],
        ]);

        $goLive = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Go Live',
            'description' => 'Production deployment and monitoring.',
            'default_duration_days' => 3,
            'sort_order' => 4,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $goLive->id, 'name' => 'Production Go Live', 'description' => 'Live transactions processing in production.', 'sort_order' => 1],
            ['template_milestone_id' => $goLive->id, 'name' => 'Monitoring & Alerts Configured', 'description' => 'Transaction monitoring and failure alerts active.', 'sort_order' => 2],
        ]);
    }

    private function createCustomDevelopmentTemplate(): void
    {
        $template = CrmProjectTemplate::create([
            'name' => 'Custom Development',
            'category' => 'custom_development',
            'description' => 'Custom software development from requirements through deployment.',
        ]);

        $requirements = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Requirements',
            'description' => 'Detailed requirements specification and scope finalization.',
            'default_duration_days' => 10,
            'sort_order' => 1,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $requirements->id, 'name' => 'Software Requirements Specification', 'description' => 'Detailed functional and technical specifications.', 'sort_order' => 1],
            ['template_milestone_id' => $requirements->id, 'name' => 'Scope Sign-off', 'description' => 'Customer approval of final scope and estimate.', 'sort_order' => 2],
        ]);

        $design = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Design',
            'description' => 'System architecture, UX design, and technical design.',
            'default_duration_days' => 10,
            'sort_order' => 2,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $design->id, 'name' => 'Technical Architecture Document', 'description' => 'System architecture, technology stack, and data model.', 'sort_order' => 1],
            ['template_milestone_id' => $design->id, 'name' => 'UI/UX Design Mockups', 'description' => 'Screen mockups and user flow diagrams.', 'sort_order' => 2],
            ['template_milestone_id' => $design->id, 'name' => 'Design Sign-off', 'description' => 'Customer approval of designs.', 'sort_order' => 3],
        ]);

        $development = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Development',
            'description' => 'Sprint-based development and internal testing.',
            'default_duration_days' => 30,
            'sort_order' => 3,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $development->id, 'name' => 'Sprint Completion Reports', 'description' => 'Per-sprint progress and velocity reports.', 'sort_order' => 1],
            ['template_milestone_id' => $development->id, 'name' => 'Code Repository & Documentation', 'description' => 'Source code with inline documentation and README.', 'sort_order' => 2],
            ['template_milestone_id' => $development->id, 'name' => 'Unit & Integration Test Report', 'description' => 'Test coverage report and results.', 'sort_order' => 3],
        ]);

        $qa = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'QA',
            'description' => 'Quality assurance, UAT, and bug fixing.',
            'default_duration_days' => 10,
            'sort_order' => 4,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $qa->id, 'name' => 'QA Test Report', 'description' => 'Manual and automated QA results.', 'sort_order' => 1],
            ['template_milestone_id' => $qa->id, 'name' => 'UAT Sign-off', 'description' => 'Customer UAT completion and sign-off.', 'sort_order' => 2],
        ]);

        $deployment = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Deployment',
            'description' => 'Production deployment and handover.',
            'default_duration_days' => 5,
            'sort_order' => 5,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $deployment->id, 'name' => 'Production Deployment', 'description' => 'Application deployed to production environment.', 'sort_order' => 1],
            ['template_milestone_id' => $deployment->id, 'name' => 'Operations Handover', 'description' => 'Deployment, monitoring, and support documentation.', 'sort_order' => 2],
        ]);
    }

    private function createConsultingTemplate(): void
    {
        $template = CrmProjectTemplate::create([
            'name' => 'Consulting Engagement',
            'category' => 'consulting',
            'description' => 'Consulting engagement from kickoff through final recommendations.',
        ]);

        $kickoff = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Kickoff',
            'description' => 'Project kickoff, stakeholder alignment, and schedule confirmation.',
            'default_duration_days' => 3,
            'sort_order' => 1,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $kickoff->id, 'name' => 'Kickoff Presentation', 'description' => 'Engagement overview, timeline, and success criteria.', 'sort_order' => 1],
            ['template_milestone_id' => $kickoff->id, 'name' => 'Stakeholder Contact List', 'description' => 'Key stakeholders with roles and contact information.', 'sort_order' => 2],
            ['template_milestone_id' => $kickoff->id, 'name' => 'Meeting Schedule', 'description' => 'Scheduled interviews, workshops, and review sessions.', 'sort_order' => 3],
        ]);

        $assessment = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Assessment',
            'description' => 'Current state assessment, data gathering, and analysis.',
            'default_duration_days' => 10,
            'sort_order' => 2,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $assessment->id, 'name' => 'Current State Assessment Report', 'description' => 'As-is analysis of processes, systems, and organization.', 'sort_order' => 1],
            ['template_milestone_id' => $assessment->id, 'name' => 'Data Collection Summary', 'description' => 'Compiled data from interviews, surveys, and system analysis.', 'sort_order' => 2],
        ]);

        $findings = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Findings',
            'description' => 'Preliminary findings presentation and validation.',
            'default_duration_days' => 5,
            'sort_order' => 3,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $findings->id, 'name' => 'Findings Presentation', 'description' => 'Preliminary findings, observations, and initial recommendations.', 'sort_order' => 1],
            ['template_milestone_id' => $findings->id, 'name' => 'Findings Validation Session', 'description' => 'Workshop minutes and validated findings log.', 'sort_order' => 2],
        ]);

        $recommendations = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Recommendations',
            'description' => 'Final recommendations, roadmap, and business case.',
            'default_duration_days' => 7,
            'sort_order' => 4,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $recommendations->id, 'name' => 'Final Recommendations Report', 'description' => 'Detailed recommendations with implementation roadmap.', 'sort_order' => 1],
            ['template_milestone_id' => $recommendations->id, 'name' => 'Business Case Analysis', 'description' => 'Cost-benefit analysis and ROI projections.', 'sort_order' => 2],
        ]);

        $closure = CrmTemplateMilestone::create([
            'template_id' => $template->id,
            'name' => 'Closure',
            'description' => 'Engagement closure, final presentation, and handover.',
            'default_duration_days' => 3,
            'sort_order' => 5,
        ]);
        CrmTemplateDeliverable::insert([
            ['template_milestone_id' => $closure->id, 'name' => 'Final Presentation', 'description' => 'Executive summary of findings, recommendations, and next steps.', 'sort_order' => 1],
            ['template_milestone_id' => $closure->id, 'name' => 'Engagement Closure Report', 'description' => 'Project summary, lessons learned, and follow-up recommendations.', 'sort_order' => 2],
        ]);
    }
}
