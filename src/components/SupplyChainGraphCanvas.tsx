import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Maximize2,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import type { Business, RiskLevel, SupplyEdge, SupplyTier } from '../types/contagion';
import { getRiskColorTokens } from './RiskUI';

interface SupplyChainGraphCanvasProps {
  nodes: Business[];
  edges: SupplyEdge[];
  selectedId: string | null;
  onSelectNode: (business: Business) => void;
  activeCascadeEdgeIds?: string[];
  activeCascadeNodeIds?: string[];
  highlightedWaveIds?: string[];
  heightClass?: string;
  compactToolbar?: boolean;
}

const TIER_FILTERS: Array<'All' | SupplyTier> = [
  'All',
  'Tier-1 Buyer',
  'MSME',
  'Tier-2 Supplier',
  'Tier-3 Supplier',
];

export function SupplyChainGraphCanvas({
  nodes,
  edges,
  selectedId,
  onSelectNode,
  activeCascadeEdgeIds,
  activeCascadeNodeIds,
  highlightedWaveIds,
  heightClass = 'h-[580px]',
  compactToolbar = false,
}: SupplyChainGraphCanvasProps) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tierFilter, setTierFilter] = useState<'All' | SupplyTier>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; origX: number; origY: number }>({
    x: 0,
    y: 0,
    origX: 0,
    origY: 0,
  });

  useEffect(() => {
    setPositions((prev) => {
      const next: Record<string, { x: number; y: number }> = {};
      for (const n of nodes) {
        next[n.id] = prev[n.id] ?? { x: n.x, y: n.y };
      }
      return next;
    });
  }, [nodes]);

  const downstreamSet = useMemo(() => {
    if (activeCascadeNodeIds && activeCascadeNodeIds.length > 0) {
      return new Set(activeCascadeNodeIds);
    }
    if (!selectedId) return new Set<string>();
    const visited = new Set<string>([selectedId]);
    const queue = [selectedId];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const e of edges) {
        if (e.fromBusinessId === cur && !visited.has(e.toBusinessId)) {
          visited.add(e.toBusinessId);
          queue.push(e.toBusinessId);
        }
      }
    }
    return visited;
  }, [selectedId, edges, activeCascadeNodeIds]);

  const activeEdgeSet = useMemo(() => {
    if (activeCascadeEdgeIds && activeCascadeEdgeIds.length > 0) {
      return new Set(activeCascadeEdgeIds);
    }
    if (!selectedId) return new Set<string>();
    const set = new Set<string>();
    for (const e of edges) {
      if (downstreamSet.has(e.fromBusinessId) && downstreamSet.has(e.toBusinessId)) {
        set.add(e.id);
      }
    }
    return set;
  }, [selectedId, edges, downstreamSet, activeCascadeEdgeIds]);

  const visibleNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return nodes.filter((n) => {
      const matchesTier = tierFilter === 'All' || n.tier === tierFilter;
      const matchesSearch =
        !q || n.name.toLowerCase().includes(q) || n.location.toLowerCase().includes(q);
      return matchesTier && matchesSearch;
    });
  }, [nodes, tierFilter, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIds.has(e.fromBusinessId) && visibleNodeIds.has(e.toBusinessId)
      ),
    [edges, visibleNodeIds]
  );

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    const resetPos: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) resetPos[n.id] = { x: n.x, y: n.y };
    setPositions(resetPos);
  };

  const handlePointerDownNode = (e: React.PointerEvent, node: Business) => {
    e.stopPropagation();
    const pos = positions[node.id] ?? { x: node.x, y: node.y };
    setDragNodeId(node.id);
    dragStartRef.current = { x: e.clientX, y: e.clientY, origX: pos.x, origY: pos.y };
    onSelectNode(node);
  };

  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, origX: pan.x, origY: pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragNodeId) {
      const dx = (e.clientX - dragStartRef.current.x) / zoom;
      const dy = (e.clientY - dragStartRef.current.y) / zoom;
      setPositions((prev) => ({
        ...prev,
        [dragNodeId]: {
          x: Math.max(40, Math.min(1080, dragStartRef.current.origX + dx)),
          y: Math.max(30, Math.min(585, dragStartRef.current.origY + dy)),
        },
      }));
    } else if (isPanning) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({ x: dragStartRef.current.origX + dx, y: dragStartRef.current.origY + dy });
    }
  };

  const handlePointerUp = () => {
    setDragNodeId(null);
    setIsPanning(false);
  };

  const legendItems: Array<{ risk: RiskLevel; label: string }> = [
    { risk: 'Low', label: 'Healthy (Low Risk)' },
    { risk: 'Moderate', label: 'Warning (Moderate)' },
    { risk: 'High', label: 'High Risk' },
    { risk: 'Critical', label: 'Critical Risk' },
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800/90 bg-[#080E1B]">
      {/* Graph Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0C1322] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business..."
              className="w-48 rounded-lg border border-slate-700/80 bg-[#060A13] py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {!compactToolbar && (
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#060A13] p-1 border border-slate-800">
              {TIER_FILTERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setTierFilter(tier)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    tierFilter === tier
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tier === 'All' ? 'All Tiers' : tier}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
            aria-label="Zoom in"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#060A13] text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
            aria-label="Zoom out"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#060A13] text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#060A13] px-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset View
          </button>
        </div>
      </div>

      {/* Interactive SVG Viewport */}
      <div className={`relative w-full overflow-hidden select-none ${heightClass}`}>
        {/* Tier Column Guides */}
        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 grid grid-cols-4 px-6 text-[11px] font-medium text-slate-500">
          <span>Tier-1 Buyers</span>
          <span className="text-center">MSME Core Suppliers</span>
          <span className="text-center">Tier-2 Component Vendors</span>
          <span className="text-right">Tier-3 Raw Material Mills</span>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 1120 620"
          className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDownCanvas}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <pattern id="grid-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="rgba(148, 163, 184, 0.14)" />
            </pattern>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />
            </marker>
            <marker
              id="arrow-danger"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
            </marker>
          </defs>

          <rect width="1120" height="620" fill="url(#grid-dots)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {visibleEdges.map((edge) => {
              const fromPos = positions[edge.fromBusinessId];
              const toPos = positions[edge.toBusinessId];
              if (!fromPos || !toPos) return null;

              const isCascade = activeEdgeSet.has(edge.id);
              const hasOverdue = edge.overdueLakhs > 0;
              const x1 = fromPos.x + 86;
              const y1 = fromPos.y + 26;
              const x2 = toPos.x - 6;
              const y2 = toPos.y + 26;
              const midX = (x1 + x2) / 2;
              const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

              const strokeColor = isCascade
                ? hasOverdue
                  ? '#EF4444'
                  : '#38BDF8'
                : 'rgba(100, 116, 139, 0.35)';

              const markerEnd = isCascade
                ? hasOverdue
                  ? 'url(#arrow-danger)'
                  : 'url(#arrow-active)'
                : 'url(#arrow-default)';

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isCascade ? 2.4 : 1.25}
                    strokeDasharray={isCascade && hasOverdue ? '6 4' : undefined}
                    markerEnd={markerEnd}
                    opacity={selectedId && !isCascade ? 0.3 : 1}
                  />
                  {isCascade && (
                    <g transform={`translate(${midX}, ${(y1 + y2) / 2 - 7})`}>
                      <rect
                        x="-28"
                        y="-9"
                        width="56"
                        height="16"
                        rx="4"
                        fill="#060A13"
                        stroke="rgba(56, 189, 248, 0.35)"
                        strokeWidth="0.75"
                      />
                      <text
                        textAnchor="middle"
                        y="2.5"
                        fill="#BAE6FD"
                        fontSize="9.5"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        ₹{edge.exposureLakhs.toFixed(1)}L
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {visibleNodes.map((node) => {
              const pos = positions[node.id] ?? { x: node.x, y: node.y };
              const tokens = getRiskColorTokens(node.riskLevel);
              const isSelected = selectedId === node.id;
              const isDownstream = downstreamSet.has(node.id);
              const isWaveHit = highlightedWaveIds?.includes(node.id) ?? false;
              const dimmed = Boolean(selectedId && !isDownstream && !isSelected);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onPointerDown={(e) => handlePointerDownNode(e, node)}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.32 : 1}
                >
                  {isWaveHit && (
                    <rect
                      x="-6"
                      y="-6"
                      width="196"
                      height="64"
                      rx="12"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  )}
                  <rect
                    x="0"
                    y="0"
                    width="184"
                    height="52"
                    rx="9"
                    fill={isSelected ? '#13203A' : '#0D1526'}
                    stroke={isSelected ? '#38BDF8' : tokens.stroke}
                    strokeWidth={isSelected ? 2.2 : 1.4}
                  />
                  {/* Risk indicator bar on top-left corner dot */}
                  <circle cx="13" cy="15" r="4.5" fill={tokens.stroke} />
                  <text
                    x="24"
                    y="18"
                    fill="#F8FAFC"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {node.name.length > 21 ? `${node.name.slice(0, 20)}…` : node.name}
                  </text>
                  <text
                    x="12"
                    y="38"
                    fill="#94A3B8"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {node.tier.replace(' Supplier', '').replace(' Buyer', '')} · {node.healthScore}/100
                  </text>
                  <text
                    x="172"
                    y="38"
                    textAnchor="end"
                    fill={tokens.stroke}
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    ₹{node.receivablesWaitingLakhs.toFixed(1)}L
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {visibleNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080E1B]/90 p-6 text-center">
            <Maximize2 className="h-7 w-7 text-slate-500" />
            <p className="mt-2 text-sm font-medium text-slate-300">
              No supply-chain entities match the active search or tier filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setTierFilter('All');
                setSearchQuery('');
              }}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Clear Graph Filters
            </button>
          </div>
        )}
      </div>

      {/* Interactive Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 bg-[#0C1322] px-4 py-2.5 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          {legendItems.map((item) => {
            const tk = getRiskColorTokens(item.risk);
            return (
              <span key={item.risk} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: tk.stroke }}
                />
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>
        <span className="text-slate-500">
          Drag nodes to rearrange · Click any business to highlight downstream contagion paths
        </span>
      </div>
    </div>
  );
}
