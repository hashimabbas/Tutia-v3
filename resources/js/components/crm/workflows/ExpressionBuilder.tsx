import { useState, useEffect, useCallback, useRef } from 'react'
import type { ExpressionField, ExpressionOperator, ExpressionRule, ValidationResult } from '@/types/expression'

interface Props {
    workflowId: number
    expression: string | null
    fields: ExpressionField[]
    operators: ExpressionOperator[]
    onExpressionChange: (expression: string, rows: ExpressionRule[]) => void
}

function parseInitialRows(expression: string | null, fields: ExpressionField[]): ExpressionRule[] {
    if (!expression) return []

    const tokens = expression.match(/(?:NOT\s*\([^)]+\)|[A-Za-z_.]+(?:\s*[!=<>]+\s*"[^"]*"|[A-Za-z_.]+\s*[!=<>]+\s*[^\s"]+)|AND|OR)/g)
    if (!tokens) return []

    const rows: ExpressionRule[] = []

    for (const token of tokens) {
        const trimmed = token.trim()
        if (trimmed === 'AND' || trimmed === 'OR') continue

        const rule = parseSingleRule(trimmed, fields)
        if (rule) rows.push(rule)
    }

    return rows
}

function parseSingleRule(token: string, fields: ExpressionField[]): ExpressionRule | null {
    const negate = token.startsWith('NOT (')
    const inner = negate ? token.slice(5, -1).trim() : token

    const match = inner.match(/^([A-Za-z_.]+)\s+(=|!=|>=|<=|>|<|in|not_in|contains|starts_with|ends_with)\s+(.+)$/)
    if (!match) return null

    const field = match[1]
    const operator = match[2]
    const rawValue = match[3].trim()

    let value: string | number | boolean = rawValue
    if ((rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
        value = rawValue.slice(1, -1)
    } else if (rawValue === 'true') {
        value = true
    } else if (rawValue === 'false') {
        value = false
    } else if (!isNaN(Number(rawValue))) {
        value = Number(rawValue)
    }

    return {
        id: crypto.randomUUID(),
        field,
        operator,
        value,
        negate,
        connector: null,
    }
}

export default function ExpressionBuilder({ workflowId, expression, fields, operators, onExpressionChange }: Props) {
    const [rows, setRows] = useState<ExpressionRule[]>(() => parseInitialRows(expression, fields))
    const [validation, setValidation] = useState<ValidationResult | null>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout>>()

    const convertToExpression = useCallback((currentRows: ExpressionRule[]): string | null => {
        if (currentRows.length === 0) return null

        const parts: string[] = []

        for (const row of currentRows) {
            if (parts.length > 0 && row.connector) {
                parts.push(row.connector)
            }

            const formattedValue = typeof row.value === 'boolean'
                ? (row.value ? 'true' : 'false')
                : typeof row.value === 'number'
                    ? String(row.value)
                    : `"${row.value}"`

            const condition = `${row.field} ${row.operator} ${formattedValue}`
            parts.push(row.negate ? `NOT (${condition})` : condition)
        }

        return parts.join(' ')
    }, [])

    const convertRowsToExpression = useCallback(async (currentRows: ExpressionRule[]) => {
        const body = JSON.stringify({ rows: currentRows.map(r => ({
            field: r.field,
            operator: r.operator,
            value: r.value,
            negate: r.negate,
            connector: r.connector,
        }))})

        try {
            const res = await fetch(`/crm/workflows/expression/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body,
            })
            const data = await res.json()
            return data.expression as string | null
        } catch {
            return convertToExpression(currentRows)
        }
    }, [convertToExpression])

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(async () => {
            const expr = await convertRowsToExpression(rows)
            onExpressionChange(expr ?? '', rows)

            if (expr) {
                try {
                    const res = await fetch('/crm/workflows/expression/validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ expression: expr }),
                    })
                    const data = await res.json()
                    setValidation(data)
                } catch {
                    setValidation({ valid: true, errors: [], warnings: [] })
                }
            } else {
                setValidation({ valid: true, errors: [], warnings: [] })
            }
        }, 500)

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [rows, convertRowsToExpression, onExpressionChange])

    function addRow() {
        const connector = rows.length > 0 ? 'AND' as const : null
        setRows(prev => [...prev, {
            id: crypto.randomUUID(),
            field: fields[0]?.path ?? '',
            operator: '=',
            value: '',
            negate: false,
            connector,
        }])
    }

    function updateRow(id: string, updates: Partial<ExpressionRule>) {
        setRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    }

    function removeRow(id: string) {
        setRows(prev => {
            const idx = prev.findIndex(r => r.id === id)
            return prev.filter((r, i) => {
                if (r.id !== id) {
                    if (i === idx + 1) {
                        return { ...r, connector: null } as ExpressionRule
                    }
                    return r
                }
                return false
            })
        })
    }

    function getOperatorsForField(fieldPath: string): ExpressionOperator[] {
        const field = fields.find(f => f.path === fieldPath)
        if (!field) return operators
        return operators.filter(op => field.operators.includes(op.key))
    }

    function getFieldType(fieldPath: string): 'string' | 'numeric' | 'boolean' {
        return fields.find(f => f.path === fieldPath)?.type ?? 'string'
    }

    function buildPreview(): string {
        if (rows.length === 0) return ''
        const parts: string[] = []

        for (const row of rows) {
            if (parts.length > 0 && row.connector) {
                parts.push(row.connector)
            }

            const formattedValue = typeof row.value === 'boolean'
                ? (row.value ? 'true' : 'false')
                : typeof row.value === 'number'
                    ? String(row.value)
                    : `"${row.value}"`

            const condition = `${row.field} ${row.operator} ${formattedValue}`
            parts.push(row.negate ? `NOT (${condition})` : condition)
        }

        return parts.join(' ')
    }

    return (
        <div className="space-y-3">
            {rows.length === 0 && (
                <div className="text-xs text-gray-400">
                    No conditions defined. Add a condition below.
                </div>
            )}

            {rows.map((row, i) => (
                <div key={row.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                    {row.connector && (
                        <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                            {row.connector}
                        </div>
                    )}

                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Field</label>
                            <select
                                value={row.field}
                                onChange={e => {
                                    const newField = fields.find(f => f.path === e.target.value)
                                    updateRow(row.id, {
                                        field: e.target.value,
                                        operator: newField?.operators[0] ?? '=',
                                        value: newField?.type === 'boolean' ? true : '',
                                    })
                                }}
                                className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                            >
                                {fields.map(f => (
                                    <option key={f.path} value={f.path}>{f.path}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Operator</label>
                            <select
                                value={row.operator}
                                onChange={e => updateRow(row.id, { operator: e.target.value })}
                                className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                            >
                                {getOperatorsForField(row.field).map(op => (
                                    <option key={op.key} value={op.key}>{op.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                            {getFieldType(row.field) === 'boolean' ? (
                                <select
                                    value={String(row.value)}
                                    onChange={e => updateRow(row.id, { value: e.target.value === 'true' })}
                                    className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                                >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : (
                                <input
                                    type={getFieldType(row.field) === 'numeric' ? 'number' : 'text'}
                                    value={String(row.value)}
                                    onChange={e => updateRow(row.id, {
                                        value: getFieldType(row.field) === 'numeric'
                                            ? (e.target.value === '' ? '' : Number(e.target.value))
                                            : e.target.value,
                                    })}
                                    placeholder="Enter value..."
                                    className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-[#3b6cdb] focus:ring-1 focus:ring-[#3b6cdb]/20"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-1 pt-5">
                            <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={row.negate}
                                    onChange={e => updateRow(row.id, { negate: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                NOT
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    setRows(prev => prev.map((r, idx) => {
                                        if (idx === i + 1) return { ...r, connector: r.connector === 'AND' ? 'OR' : 'AND' }
                                        return r
                                    }))
                                    if (i < rows.length - 1) {
                                        updateRow(rows[i + 1].id, {
                                            connector: rows[i + 1].connector === 'AND' ? 'OR' : 'AND',
                                        } as any)
                                    }
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 px-1"
                                title="Toggle AND/OR"
                                disabled={i >= rows.length - 1}
                            >
                                {i < rows.length - 1 ? `\u2195` : ''}
                            </button>

                            <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                className="text-gray-400 hover:text-red-500 text-lg leading-none"
                                title="Remove condition"
                            >
                                {'\u00d7'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addRow}
                className="text-sm text-[#2B4C8C] hover:text-[#3b5d9c] font-medium"
            >
                + Add Condition
            </button>

            {buildPreview() && (
                <div className="mt-3 p-3 bg-gray-50/50 rounded border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 mb-1">Expression Preview</div>
                    <code className="text-sm text-gray-700 break-all">{buildPreview()}</code>
                </div>
            )}

            {validation && !validation.valid && (
                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                    {validation.errors.map((err, i) => (
                        <div key={i} className="text-xs text-red-600">{err}</div>
                    ))}
                </div>
            )}

            {validation && validation.warnings.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    {validation.warnings.map((w, i) => (
                        <div key={i} className="text-xs text-yellow-700">{w}</div>
                    ))}
                </div>
            )}
        </div>
    )
}
