import { actionConfigRegistry, type ActionContext } from './registry';

interface Props {
    actionType: string;
    value: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
    context?: ActionContext;
}

export default function ActionConfigRenderer({ actionType, value, onChange, context }: Props) {
    const Component = actionConfigRegistry[actionType];

    if (!Component) {
        return (
            <p className="text-[10px] text-gray-500">
                No configuration form available for <span className="text-gray-600">{actionType}</span>
            </p>
        );
    }

    return <Component value={value} onChange={onChange} context={context} />;
}
