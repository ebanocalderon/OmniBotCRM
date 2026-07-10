"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Search, Filter, MoreHorizontal, User, DollarSign, Calendar } from "lucide-react";

// Mock data based on schema
const MOCK_STAGES = [
  { id: "s-1", name: "Prospecting" },
  { id: "s-2", name: "Qualification" },
  { id: "s-3", name: "Proposal" },
  { id: "s-4", name: "Negotiation" },
  { id: "s-5", name: "Closed Won" },
  { id: "s-6", name: "Closed Lost" }
];

const MOCK_OPPS = [
  { id: "opp-1", name: "Acme Corp Deal", stage: "Prospecting", amount: 12500.0, contact: "John Doe", probability: 10, close_date: "2025-04-15" },
  { id: "opp-2", name: "Globex Enterprise", stage: "Qualification", amount: 45000.0, contact: "Jane Smith", probability: 25, close_date: "2025-05-01" },
  { id: "opp-3", name: "Initech Software", stage: "Proposal", amount: 8500.0, contact: "Peter Gibbons", probability: 50, close_date: "2025-03-30" },
  { id: "opp-4", name: "Stark Industries", stage: "Proposal", amount: 120000.0, contact: "Tony Stark", probability: 60, close_date: "2025-06-10" },
  { id: "opp-5", name: "Wayne Ent", stage: "Negotiation", amount: 95000.0, contact: "Bruce Wayne", probability: 75, close_date: "2025-04-01" }
];

export default function OpportunitiesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [opportunities, setOpportunities] = useState(MOCK_OPPS);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const draggedOpp = opportunities.find(o => o.id === draggableId);
    if (!draggedOpp) return;

    // Determine target stage
    const targetStage = MOCK_STAGES.find(s => s.id === destination.droppableId)?.name;
    if (!targetStage) return;

    // Optimistically update
    const newOpps = opportunities.map(opp => 
      opp.id === draggableId ? { ...opp, stage: targetStage } : opp
    );
    setOpportunities(newOpps);

    // TODO: Make API call to backend `PATCH /opportunities/{id}/move`
  };

  if (!isMounted) return null; // Avoid hydration mismatch for DnD

  // Group opps by stage
  const columns = MOCK_STAGES.map(stage => {
    return {
      ...stage,
      opps: opportunities.filter(o => o.stage === stage.name)
    };
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-800">Pipeline</h1>
          
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Sales Pipeline</option>
            <option>Onboarding</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search deals..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors border border-slate-200">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Opportunity
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-6 items-start">
            {columns.map(col => {
              const columnTotal = col.opps.reduce((sum, o) => sum + o.amount, 0);
              
              return (
                <div key={col.id} className="w-[320px] shrink-0 flex flex-col h-full">
                  {/* Column Header */}
                  <div className="bg-slate-100/80 rounded-t-lg p-3 border border-slate-200 border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-800 text-sm">{col.name}</h3>
                      <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {col.opps.length}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      ${columnTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[150px] p-2 rounded-b-lg border border-t-0 border-slate-200 bg-slate-100/50 overflow-y-auto custom-scrollbar ${
                          snapshot.isDraggingOver ? "bg-blue-50/50 border-blue-200 border-dashed" : ""
                        }`}
                      >
                        {col.opps.map((opp, index) => (
                          <Draggable key={opp.id} draggableId={opp.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-3 rounded-md shadow-sm border border-slate-200 mb-2 group hover:border-blue-300 transition-colors ${
                                  snapshot.isDragging ? "shadow-md ring-1 ring-blue-400 rotate-2 scale-[1.02]" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-slate-800 leading-tight">{opp.name}</h4>
                                  <button className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-600 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="space-y-1.5 mt-3">
                                  <div className="flex items-center text-xs text-slate-600 font-medium">
                                    <DollarSign className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                    ${opp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div className="flex items-center text-xs text-slate-500">
                                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                    {opp.contact}
                                  </div>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {opp.close_date}
                                  </div>
                                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    opp.probability >= 70 ? 'bg-green-100 text-green-700' :
                                    opp.probability >= 40 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {opp.probability}%
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
