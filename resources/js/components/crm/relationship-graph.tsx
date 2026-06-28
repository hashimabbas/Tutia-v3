import { useState, useRef, useEffect } from 'react';
import InfluenceBadge from '@/components/crm/influence-badge';

interface GraphNode {
    id: number;
    name: string;
    influence_type: string | null;
    influence_type_name: string | null;
    avatar_url: string | null;
    is_primary: boolean;
    org_role: number | null;
}

interface GraphEdge {
    from: number;
    to: string;
    weight: number;
    label: string | null;
}

interface OrgRelationshipEdge {
    source_id: number;
    target_id: number;
    source_name?: string;
    target_name?: string;
    type: string;
    type_name: string;
    strength: number;
    notes: string | null;
}

interface RelationshipGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    influenceSummary: Record<string, number>;
    orgRelationships: OrgRelationshipEdge[];
}

const INFLUENCE_COLORS: Record<string, string> = {
    decision_maker: '#ef4444',
    champion: '#10b981',
    influencer: '#f59e0b',
    blocker: '#8b5cf6',
};

const RADIUS = 80;
const CENTER_X = 140;
const CENTER_Y = 100;

export default function RelationshipGraph({
    nodes,
    edges,
    influenceSummary,
    orgRelationships,
}: RelationshipGraphProps) {
    const [view, setView] = useState<'contacts' | 'orgs'>('contacts');
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const contactNodes = nodes.filter((n) =>
        edges.some((e) => e.from === n.id),
    );
    const standaloneNodes = nodes.filter(
        (n) => !edges.some((e) => e.from === n.id),
    );

    const maxWeight = Math.max(...edges.map((e) => e.weight), 1);

    if (view === 'contacts') {
        return (
            <div className="flex h-full flex-col">
                <div className="flex gap-1 border-b border-[#e2e6ef] bg-white px-4 py-2.5">
                    <button
                        onClick={() => setView('contacts')}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                            view === 'contacts'
                                ? 'bg-[#eef1f8] text-[#1a1a2e]'
                                : 'text-[#6b7280] hover:bg-[#f8f9fc] hover:text-[#374151]'
                        }`}
                    >
                        Contacts
                    </button>
                    <button
                        onClick={() => setView('orgs')}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                            view === 'orgs'
                                ? 'bg-[#eef1f8] text-[#1a1a2e]'
                                : 'text-[#6b7280] hover:bg-[#f8f9fc] hover:text-[#374151]'
                        }`}
                    >
                        Company Network
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white px-4 py-3">
                    {nodes.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-center text-[11px] leading-relaxed text-[#6b7280]">
                                No relationship data yet.
                                <br />
                                Add contacts and log activities
                                <br />
                                to build your relationship map.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* SVG Graph */}
                            <svg
                                ref={svgRef}
                                viewBox="0 0 280 200"
                                className="mb-3 w-full"
                            >
                                {contactNodes.slice(0, 6).map((node, i) => {
                                    const edge = edges.find(
                                        (e) => e.from === node.id,
                                    );
                                    const angle =
                                        (i * 2 * Math.PI) /
                                        Math.min(contactNodes.length, 6);
                                    const x =
                                        CENTER_X + RADIUS * Math.cos(angle);
                                    const y =
                                        CENTER_Y + RADIUS * Math.sin(angle);
                                    const thickness = edge
                                        ? Math.max(
                                              1,
                                              (edge.weight / maxWeight) * 4,
                                          )
                                        : 1;
                                    const influenceColor = node.influence_type
                                        ? (INFLUENCE_COLORS[
                                              node.influence_type
                                          ] ?? '#9ca3af')
                                        : '#9ca3af';
                                    return (
                                        <g key={node.id}>
                                            <line
                                                x1={CENTER_X}
                                                y1={CENTER_Y}
                                                x2={x}
                                                y2={y}
                                                stroke={influenceColor}
                                                strokeWidth={thickness}
                                                strokeOpacity={0.3}
                                            />
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={6}
                                                fill={influenceColor}
                                                fillOpacity={
                                                    hoveredNode === node.id
                                                        ? 0.9
                                                        : 0.6
                                                }
                                                stroke={
                                                    hoveredNode === node.id
                                                        ? '#1a1a2e'
                                                        : 'none'
                                                }
                                                strokeWidth={1.5}
                                                className="cursor-pointer transition-all"
                                                onMouseEnter={() =>
                                                    setHoveredNode(node.id)
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredNode(null)
                                                }
                                            />
                                        </g>
                                    );
                                })}
                                <circle
                                    cx={CENTER_X}
                                    cy={CENTER_Y}
                                    r={8}
                                    fill="#2B4C8C"
                                    fillOpacity={0.85}
                                />
                                <text
                                    x={CENTER_X}
                                    y={CENTER_Y + 3}
                                    textAnchor="middle"
                                    fill="#fff"
                                    fontSize={8}
                                    fontWeight={600}
                                >
                                    {contactNodes.length}
                                </text>
                            </svg>

                            {/* Influence Map */}
                            {Object.keys(influenceSummary).length > 0 && (
                                <div className="mb-3 rounded-xl border border-[#e2e6ef] bg-[#f8f9fc] p-3">
                                    <div className="mb-1.5 text-[9px] font-semibold tracking-wider text-[#6b7280] uppercase">
                                        Influence Map
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(influenceSummary).map(
                                            ([slug, count]) => {
                                                const color =
                                                    INFLUENCE_COLORS[slug] ??
                                                    '#9ca3af';
                                                return (
                                                    <span
                                                        key={slug}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                color + '12',
                                                            color,
                                                        }}
                                                    >
                                                        <span
                                                            className="h-1.5 w-1.5 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    color,
                                                            }}
                                                        />
                                                        <InfluenceBadge
                                                            slug={slug}
                                                        />
                                                        <span className="ml-0.5">
                                                            {count}
                                                        </span>
                                                    </span>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Ranked Contact List */}
                            <div className="space-y-1">
                                {[...nodes]
                                    .sort((a, b) => {
                                        const aWeight =
                                            edges.find((e) => e.from === a.id)
                                                ?.weight ?? 0;
                                        const bWeight =
                                            edges.find((e) => e.from === b.id)
                                                ?.weight ?? 0;
                                        return bWeight - aWeight;
                                    })
                                    .map((node) => {
                                        const edge = edges.find(
                                            (e) => e.from === node.id,
                                        );
                                        const weight = edge?.weight ?? 0;
                                        const pct =
                                            maxWeight > 0
                                                ? (weight / maxWeight) * 100
                                                : 0;
                                        return (
                                            <div
                                                key={node.id}
                                                className="flex items-center gap-2.5 rounded-xl border border-[#e2e6ef] bg-white px-3 py-2.5 transition-all hover:border-[#c8cce0] hover:shadow-sm"
                                            >
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef1f8] text-[10px] font-medium text-[#6b7280]">
                                                    {node.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium text-[#1a1a2e]">
                                                            {node.name}
                                                        </span>
                                                        <InfluenceBadge
                                                            slug={
                                                                node.influence_type
                                                            }
                                                            name={
                                                                node.influence_type_name ??
                                                                undefined
                                                            }
                                                        />
                                                    </div>
                                                    {weight > 0 && (
                                                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#eef1f8]">
                                                            <div
                                                                className="h-full rounded-full transition-all"
                                                                style={{
                                                                    width: `${pct}%`,
                                                                    backgroundColor:
                                                                        node.influence_type
                                                                            ? (INFLUENCE_COLORS[
                                                                                  node
                                                                                      .influence_type
                                                                              ] ??
                                                                              '#2B4C8C')
                                                                            : '#2B4C8C',
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                {weight > 0 && (
                                                    <span className="text-[10px] font-medium text-[#6b7280]">
                                                        {weight}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Company Network view
    return (
        <div className="flex h-full flex-col">
            <div className="flex gap-1 border-b border-[#e2e6ef] bg-white px-4 py-2.5">
                <button
                    onClick={() => setView('contacts')}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                        view === 'contacts'
                            ? 'bg-[#eef1f8] text-[#1a1a2e]'
                            : 'text-[#6b7280] hover:bg-[#f8f9fc] hover:text-[#374151]'
                    }`}
                >
                    Contacts
                </button>
                <button
                    onClick={() => setView('orgs')}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                        view === 'orgs'
                            ? 'bg-[#eef1f8] text-[#1a1a2e]'
                            : 'text-[#6b7280] hover:bg-[#f8f9fc] hover:text-[#374151]'
                    }`}
                >
                    Company Network
                </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white px-4 py-3">
                {orgRelationships.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-center text-[11px] leading-relaxed text-[#6b7280]">
                            No organizational relationships yet.
                            <br />
                            Link this organization to others
                            <br />
                            to build the company network.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {orgRelationships.map((rel, i) => {
                            const strengthColor =
                                rel.strength >= 80
                                    ? '#10b981'
                                    : rel.strength >= 50
                                      ? '#f59e0b'
                                      : '#ef4444';
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-2.5 rounded-xl border border-[#e2e6ef] bg-white px-3 py-2.5 transition-all hover:border-[#c8cce0] hover:shadow-sm"
                                >
                                    <div
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold"
                                        style={{
                                            backgroundColor:
                                                strengthColor + '15',
                                            color: strengthColor,
                                        }}
                                    >
                                        {rel.type === 'parent'
                                            ? 'P'
                                            : rel.type === 'subsidiary'
                                              ? 'S'
                                              : rel.type === 'partner'
                                                ? '↔'
                                                : rel.type === 'competitor'
                                                  ? '!'
                                                  : '→'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium text-[#1a1a2e]">
                                            {rel.source_name ?? rel.target_name}
                                        </div>
                                        <div className="text-[10px] text-[#6b7280] capitalize">
                                            {rel.type_name}
                                        </div>
                                    </div>
                                    {rel.strength > 0 && (
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[10px] font-medium text-[#6b7280]">
                                                {rel.strength}%
                                            </span>
                                            <div className="h-1 w-12 overflow-hidden rounded-full bg-[#eef1f8]">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${rel.strength}%`,
                                                        backgroundColor:
                                                            strengthColor,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
