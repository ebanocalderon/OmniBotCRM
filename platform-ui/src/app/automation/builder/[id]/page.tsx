"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  Node, 
  Edge, 
  NodeChange, 
  EdgeChange, 
  Connection,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Play, Settings, Bell, Mail, MessageSquare, Clock, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

// Custom Node Components
const TriggerNode = ({ data }: any) => (
  <div className="bg-white border-2 border-green-500 rounded-md shadow-md min-w-[200px]">
    <div className="bg-green-50 px-3 py-2 border-b border-green-100 rounded-t-sm flex items-center gap-2">
      <Bell className="w-4 h-4 text-green-600" />
      <span className="text-sm font-semibold text-green-800">Trigger</span>
    </div>
    <div className="p-3">
      <div className="text-sm font-medium text-slate-800">{data.label}</div>
      <div className="text-xs text-slate-500 mt-1">{data.details}</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
  </div>
);

const ActionNode = ({ data }: any) => {
  const Icon = data.type === 'email' ? Mail : MessageSquare;
  return (
    <div className="bg-white border-2 border-blue-500 rounded-md shadow-md min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 rounded-t-sm flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-800">Action</span>
      </div>
      <div className="p-3">
        <div className="text-sm font-medium text-slate-800">{data.label}</div>
        <div className="text-xs text-slate-500 mt-1">{data.details}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

const DelayNode = ({ data }: any) => (
  <div className="bg-white border-2 border-slate-400 rounded-md shadow-md min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400" />
    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 rounded-t-sm flex items-center gap-2">
      <Clock className="w-4 h-4 text-slate-600" />
      <span className="text-sm font-semibold text-slate-800">Delay</span>
    </div>
    <div className="p-3">
      <div className="text-sm font-medium text-slate-800">{data.label}</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400" />
  </div>
);

const ConditionNode = ({ data }: any) => (
  <div className="bg-white border-2 border-amber-500 rounded-md shadow-md min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
    <div className="bg-amber-50 px-3 py-2 border-b border-amber-100 rounded-t-sm flex items-center gap-2">
      <ArrowRightLeft className="w-4 h-4 text-amber-600" />
      <span className="text-sm font-semibold text-amber-800">Condition</span>
    </div>
    <div className="p-3">
      <div className="text-sm font-medium text-slate-800">{data.label}</div>
    </div>
    <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} className="w-3 h-3 bg-amber-500" />
    <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} className="w-3 h-3 bg-slate-400" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  delay: DelayNode,
  condition: ConditionNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'Contact Created', details: 'Source: Website Form' } },
  { id: '2', type: 'delay', position: { x: 250, y: 200 }, data: { label: 'Wait 5 minutes' } },
  { id: '3', type: 'action', position: { x: 250, y: 350 }, data: { type: 'email', label: 'Send Welcome Email', details: 'Template: Welcome Series 1' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
];

export default function AutomationBuilderPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/automation" className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              New Lead Welcome Sequence
              <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Draft</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Save & Publish
          </button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 relative flex">
        {/* ReactFlow Canvas */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#f8fafc]"
          >
            <Background color="#cbd5e1" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
        
        {/* Right Sidebar - Node Inspector (Placeholder) */}
        <div className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-lg z-10">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Properties</h2>
            <p className="text-xs text-slate-500 mt-1">Select a node to configure</p>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Action Name</label>
                <input type="text" defaultValue="Send Welcome Email" className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
                <select className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Welcome Series 1</option>
                  <option>Follow Up</option>
                  <option>Custom Content</option>
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
                  Edit Template Content
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
