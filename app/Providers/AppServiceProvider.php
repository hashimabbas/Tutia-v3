<?php

namespace App\Providers;

use App\Events\Crm\ApprovalApproved;
use App\Events\Crm\ApprovalRejected;
use App\Events\Crm\ChangeOrderApproved;
use App\Events\Crm\ChangeOrderRejected;
use App\Events\Crm\DealConvertedToProject;
use App\Events\Crm\DeliverableCompleted;
use App\Events\Crm\HealthDegraded;
use App\Events\Crm\IssueEscalated;
use App\Events\Crm\IssueResolved;
use App\Events\Crm\MilestoneCompleted;
use App\Events\Crm\ProjectAtRisk;
use App\Events\Crm\ProjectCreated;
use App\Events\Crm\RiskClosed;
use App\Listeners\HandleApprovalDecision;
use App\Listeners\HandleDomainNotification;
use App\Listeners\HandleWorkflowAutomation;
use App\Models\CrmActivity;
use App\Models\CrmContact;
use App\Models\CrmDeal;
use App\Models\CrmLead;
use App\Models\CrmOrganization;
use App\Observers\CrmActivityObserver;
use App\Observers\CrmContactObserver;
use App\Observers\CrmDealObserver;
use App\Observers\CrmLeadObserver;
use App\Observers\CrmOrganizationObserver;
use App\Services\Crm\Approvals\ApprovalEngine;
use App\Services\Crm\Approvals\ApprovalStrategyRegistry;
use App\Services\Crm\Approvals\Contracts\ApprovalEngineInterface;
use App\Services\Crm\Approvals\Strategies\FirstApproverWinsStrategy;
use App\Services\Crm\Approvals\Strategies\MajorityVoteStrategy;
use App\Services\Crm\Approvals\Strategies\UnanimousStrategy;
use App\Services\Crm\Communications\Contracts\NotificationRouterInterface;
use App\Services\Crm\Communications\Contracts\RecipientResolverInterface;
use App\Services\Crm\Communications\NotificationCoordinator;
use App\Services\Crm\Communications\NotificationRouter;
use App\Services\Crm\Communications\Resolvers\PortalRecipientResolver;
use App\Services\Crm\Conversion\CrmDealToProjectConversionService;
use App\Services\Crm\CrmDuplicateDetectionService;
use App\Services\Crm\CrmHealthService;
use App\Services\Crm\CrmImportService;
use App\Services\Crm\CrmNextBestActionService;
use App\Services\Crm\CrmRelationshipService;
use App\Services\Crm\Expressions\Contracts\ExpressionEvaluatorInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionValidatorInterface;
use App\Services\Crm\Expressions\Evaluation\ExpressionEvaluator;
use App\Services\Crm\Expressions\Parser\ExpressionParser;
use App\Services\Crm\Expressions\Validation\ExpressionValidator;
use App\Services\Crm\Health\HealthScorerInterface;
use App\Services\Crm\Health\RuleBasedScorer;
use App\Services\Crm\Optimization\Automation\Registries\AutomationScoreRegistryInterface;
use App\Services\Crm\Optimization\Automation\Registries\WorkflowAutomationScoreRegistry;
use App\Services\Crm\Projects\Health\DeliveryHealthScorerInterface;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use App\Services\Crm\Projects\Health\RuleBasedDeliveryHealthScorer;
use App\Services\Crm\Timeline\CrmTimelineService;
use App\Services\Crm\Timeline\Providers\ActivityTimelineProvider;
use App\Services\Crm\Timeline\Providers\AuditLogTimelineProvider;
use App\Services\Crm\Workflows\Actions\AssignOwnerWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateActivityWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateChangeOrderWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateIssueWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateNoteWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateRiskWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateTaskWorkflowAction;
use App\Services\Crm\Workflows\Actions\RequestApprovalWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendEmailWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendPortalNotificationWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendSmsWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendWhatsAppWorkflowAction;
use App\Services\Crm\Workflows\Actions\UpdateStatusWorkflowAction;
use App\Services\Crm\Workflows\Actions\WorkflowActionRegistry;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionEvaluatorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowContextBuilderInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowEvaluatorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowExecutorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowTriggerInterface;
use App\Services\Crm\Workflows\Evaluation\ExpressionWorkflowEvaluator;
use App\Services\Crm\Workflows\Evaluation\LegacyConditionEvaluator;
use App\Services\Crm\Workflows\Evaluation\WorkflowConditionEvaluator;
use App\Services\Crm\Workflows\Services\CrmActionService;
use App\Services\Crm\Workflows\WorkflowCondition;
use App\Services\Crm\Workflows\WorkflowContextBuilder;
use App\Services\Crm\Workflows\WorkflowEngine;
use App\Services\Crm\Workflows\WorkflowEvaluator;
use App\Services\Crm\Workflows\WorkflowExecutor;
use App\Services\Crm\Workflows\WorkflowLoader;
use App\Services\Crm\Workflows\WorkflowTrigger;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(HealthScorerInterface::class, RuleBasedScorer::class);
        $this->app->singleton(DeliveryHealthScorerInterface::class, RuleBasedDeliveryHealthScorer::class);

        $this->app->singleton(CrmHealthService::class);
        $this->app->singleton(CrmNextBestActionService::class);
        $this->app->singleton(CrmDuplicateDetectionService::class);
        $this->app->singleton(CrmImportService::class);
        $this->app->singleton(CrmRelationshipService::class);
        $this->app->singleton(CrmDealToProjectConversionService::class);
        $this->app->singleton(DeliveryHealthService::class);

        $this->app->singleton(CrmTimelineService::class, function () {
            $service = new CrmTimelineService;
            $service->addProvider(app(AuditLogTimelineProvider::class));
            $service->addProvider(app(ActivityTimelineProvider::class));

            return $service;
        });

        $this->app->bind(NotificationRouterInterface::class, NotificationRouter::class);
        $this->app->bind(RecipientResolverInterface::class, PortalRecipientResolver::class);

        // CRM-7 Phase 4A–4D — Expression Engine bindings
        $this->app->singleton(ExpressionParserInterface::class, ExpressionParser::class);
        $this->app->singleton(ExpressionEvaluatorInterface::class, ExpressionEvaluator::class);
        $this->app->singleton(ExpressionValidatorInterface::class, ExpressionValidator::class);

        // CRM-7 Phase 4E — Expression Workflow Integration (v1/v2 bridge)
        $this->app->singleton(LegacyConditionEvaluator::class);
        $this->app->singleton(ExpressionWorkflowEvaluator::class);
        $this->app->singleton(WorkflowConditionEvaluatorInterface::class, WorkflowConditionEvaluator::class);

        // CRM-8 Optimization — Automation Score Registry
        $this->app->singleton(AutomationScoreRegistryInterface::class, WorkflowAutomationScoreRegistry::class);

        // CRM-6 Workflow contracts — concrete implementations built in Phase 2
        $this->app->singleton(WorkflowTriggerInterface::class, WorkflowTrigger::class);
        $this->app->singleton(WorkflowConditionInterface::class, WorkflowCondition::class);
        $this->app->singleton(WorkflowContextBuilderInterface::class, WorkflowContextBuilder::class);
        $this->app->singleton(WorkflowEvaluatorInterface::class, WorkflowEvaluator::class);
        $this->app->singleton(WorkflowExecutorInterface::class, WorkflowExecutor::class);
        $this->app->singleton(WorkflowActionRegistry::class);
        $this->app->singleton(WorkflowLoader::class);
        $this->app->singleton(WorkflowEngine::class);

        // CRM-6 Phase 3 — Action Library
        $this->app->singleton(CrmActionService::class);

        $this->app->singleton(WorkflowActionRegistry::class, function () {
            $registry = new WorkflowActionRegistry;

            // Phase 3A — Communication actions
            $registry->register(new SendEmailWorkflowAction(app(NotificationCoordinator::class)));
            $registry->register(new SendSmsWorkflowAction(app(NotificationCoordinator::class)));
            $registry->register(new SendWhatsAppWorkflowAction(app(NotificationCoordinator::class)));
            $registry->register(new SendPortalNotificationWorkflowAction(app(NotificationCoordinator::class)));

            // Phase 3B — CRM actions
            $service = app(CrmActionService::class);
            $registry->register(new CreateActivityWorkflowAction($service));
            $registry->register(new CreateTaskWorkflowAction($service));
            $registry->register(new CreateNoteWorkflowAction($service));
            $registry->register(new AssignOwnerWorkflowAction($service));
            $registry->register(new UpdateStatusWorkflowAction($service));

            // Phase 3C — Project actions
            $registry->register(new CreateRiskWorkflowAction($service));
            $registry->register(new CreateIssueWorkflowAction($service));
            $registry->register(new CreateChangeOrderWorkflowAction($service));

            // Phase 4C — Approval action (pauses workflow, resumes on decision)
            $registry->register(new RequestApprovalWorkflowAction(app(ApprovalEngineInterface::class)));

            return $registry;
        });

        // CRM-6 Phase 4B — Approval Engine
        $this->app->singleton(ApprovalStrategyRegistry::class, function () {
            $registry = new ApprovalStrategyRegistry;

            $registry->register(new UnanimousStrategy);
            $registry->register(new FirstApproverWinsStrategy);
            $registry->register(new MajorityVoteStrategy);

            return $registry;
        });

        $this->app->singleton(ApprovalEngineInterface::class, ApprovalEngine::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerEventListeners();
    }

    protected function registerEventListeners(): void
    {
        Event::listen(
            DealConvertedToProject::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            ProjectCreated::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            MilestoneCompleted::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            DeliverableCompleted::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            RiskClosed::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            IssueResolved::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            IssueEscalated::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            ProjectAtRisk::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            HealthDegraded::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            ChangeOrderApproved::class,
            HandleDomainNotification::class,
        );
        Event::listen(
            ChangeOrderRejected::class,
            HandleDomainNotification::class,
        );

        // CRM-6 Workflow Automation — separate listener, independent pipeline
        $events = [
            DealConvertedToProject::class,
            ProjectCreated::class,
            MilestoneCompleted::class,
            DeliverableCompleted::class,
            RiskClosed::class,
            IssueResolved::class,
            IssueEscalated::class,
            ProjectAtRisk::class,
            HealthDegraded::class,
            ChangeOrderApproved::class,
            ChangeOrderRejected::class,
        ];

        foreach ($events as $eventClass) {
            Event::listen(
                $eventClass,
                HandleWorkflowAutomation::class,
            );
        }

        // CRM-6 Phase 4D — Auto resume workflows on approval decisions
        Event::listen(
            ApprovalApproved::class,
            [HandleApprovalDecision::class, 'handleApproved'],
        );
        Event::listen(
            ApprovalRejected::class,
            [HandleApprovalDecision::class, 'handleRejected'],
        );
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        CrmLead::observe(CrmLeadObserver::class);
        CrmDeal::observe(CrmDealObserver::class);
        CrmActivity::observe(CrmActivityObserver::class);
        CrmOrganization::observe(CrmOrganizationObserver::class);
        CrmContact::observe(CrmContactObserver::class);

        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
