import React, { useState } from 'react';
import { TaxonomyNode } from '../../types/taxonomy';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Layers, FileCheck } from 'lucide-react';

interface TaxonomyTreeProps {
  nodes: TaxonomyNode[];
  selectedNodeId?: string;
  onSelectNode?: (node: TaxonomyNode) => void;
}

interface TreeNodeItemProps {
  node: TaxonomyNode;
  selectedNodeId?: string;
  onSelectNode?: (node: TaxonomyNode) => void;
  level?: number;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  selectedNodeId,
  onSelectNode,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Expand first level by default
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  return (
    <div className="select-none">
      <div
        className={`flex items-center justify-between py-1.5 px-2 rounded cursor-pointer text-xs transition-colors ${
          isSelected
            ? 'bg-gov-navy text-white font-semibold'
            : 'hover:bg-slate-100 text-slate-800'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (onSelectNode) onSelectNode(node);
          if (hasChildren) setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 hover:bg-slate-200/50 rounded"
              aria-label={isOpen ? 'Collapse category' : 'Expand category'}
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {hasChildren ? (
            isOpen ? (
              <FolderOpen className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`} />
            ) : (
              <Folder className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`} />
            )
          ) : (
            <FileCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
          )}

          <span className="truncate font-medium">{node.name}</span>
          {node.code && (
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-white/20 text-slate-100' : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {node.code}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
          <span
            className={`font-mono px-1.5 py-0.5 rounded text-[10px] ${
              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {node.canonicalCount.toLocaleString()} CM
          </span>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-0.5 border-l border-slate-200 ml-4">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 overflow-y-auto max-h-[600px] shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 px-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-gov-navy" />
          CPSE Unified Category Hierarchy
        </span>
        <span className="text-[10px] text-slate-400 font-normal">UNSPSC Mapped</span>
      </div>
      <div className="space-y-1">
        {nodes.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            level={0}
          />
        ))}
      </div>
    </div>
  );
};
