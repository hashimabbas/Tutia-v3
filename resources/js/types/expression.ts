export interface ExpressionField {
    path: string
    type: 'string' | 'numeric' | 'boolean'
    operators: string[]
    suggested_min?: number | null
    suggested_max?: number | null
}

export interface ExpressionOperator {
    key: string
    label: string
}

export interface ExpressionRule {
    id: string
    field: string
    operator: string
    value: string | number | boolean
    negate: boolean
    connector: 'AND' | 'OR' | null
}

export interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}
