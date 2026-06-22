import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { index } from '@/routes/crm/workflows';
import WorkflowHeader from '@/components/crm/workflows/WorkflowHeader';
import TriggerSection from '@/components/crm/workflows/TriggerSection';
import ConditionSection from '@/components/crm/workflows/ConditionSection';
import ActionBuilder from '@/components/crm/workflows/ActionBuilder';
import '@/components/crm/workflows/actions';

interface Trigger {
    id: number;
    event_key: string;
}

interface Condition {
    id: number;
    field: string;
    operator: string;
    value: string | null;
    group_order: number;
}

interface Action {
    id: number;
    action_type: string;
    configuration_json: Record<string, any> | null;
    sort_order: number;
    stop_on_fail: boolean;
}

interface Workflow {
    id: number;
    name: string;
    description: string | null;
    entity_type: string;
    is_active: boolean;
    version: number;
    conditions_version: string;
    expression: string | null;
    triggers: Trigger[];
    conditions: Condition[];
    actions: Action[];
}

interface MetaItem {
    key: string;
    label: string;
}

interface ApprovalFlowMeta {
    id: number;
    name: string;
    strategy: string;
    steps_count: number;
}

interface ExpressionFieldMeta {
    path: string;
    type: string;
    operators: string[];
    suggested_min: number | null;
    suggested_max: number | null;
}

interface ExpressionOperatorMeta {
    key: string;
    label: string;
}

interface ConditionsVersionMeta {
    key: string;
    label: string;
}

interface Meta {
    events: MetaItem[];
    operators: MetaItem[];
    actions: MetaItem[];
    approval_flows: ApprovalFlowMeta[];
    expression_fields: ExpressionFieldMeta[];
    expression_operators: ExpressionOperatorMeta[];
    conditions_versions: ConditionsVersionMeta[];
}

interface Props {
    workflow: Workflow;
    meta: Meta;
}

export default function WorkflowShow({ workflow, meta }: Props) {
    const entityTypes = Array.from(new Set([workflow.entity_type, 'lead', 'deal', 'project', 'contact', 'organization']));

    return (
        <>
            <Head title={`CRM · ${workflow.name}`} />

            <div className="flex h-full flex-col">
                <div className="border-b border-[#1e1e2a] px-6 py-2.5">
                    <button
                        onClick={() => router.visit(index().url)}
                        className="flex items-center gap-1.5 text-[11px] text-[#555570] transition-colors hover:text-[#8b8b9e]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Workflows
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-4xl space-y-6 p-6">
                        <WorkflowHeader workflow={workflow} entityTypes={entityTypes} />

                        <TriggerSection
                            workflowId={workflow.id}
                            triggers={workflow.triggers}
                            events={meta.events}
                        />

                        <ConditionSection
                            workflowId={workflow.id}
                            conditions={workflow.conditions}
                            operators={meta.operators}
                            expression={workflow.expression}
                            conditionsVersion={workflow.conditions_version}
                            expressionFields={meta.expression_fields}
                            expressionOperators={meta.expression_operators}
                            conditionsVersions={meta.conditions_versions}
                        />

                        <ActionBuilder
                            workflowId={workflow.id}
                            actions={workflow.actions}
                            actionTypes={meta.actions}
                            context={{ approvalFlows: meta.approval_flows }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
