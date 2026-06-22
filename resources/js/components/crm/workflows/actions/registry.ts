import type { ComponentType } from 'react';

export interface ActionContext {
    approvalFlows?: Array<{ id: number; name: string; strategy: string; steps_count: number }>;
}

export interface ActionConfigProps {
    value: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
    context?: ActionContext;
}

type ActionConfigComponent = ComponentType<ActionConfigProps>;

export const actionConfigRegistry: Record<string, ActionConfigComponent> = {};

export function registerActionConfig(type: string, component: ActionConfigComponent): void {
    actionConfigRegistry[type] = component;
}
