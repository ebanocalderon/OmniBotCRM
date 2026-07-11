"use client";

import { useState } from "react";
import { 
  Plus, 
  Filter, 
  Bot, 
  MessageSquare, 
  Mail,
  Phone, 
  Tags, 
  Trash2, 
  Star, 
  Upload, 
  Download,
  Settings,
  MoreVertical,
  ChevronDown,
  Search,
  MessageCircle,
  FileCheck2,
  Loader2
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useApi, useTenant } from "@/components/TenantProvider";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  created: string;
  lastActivity: string;
  tags: string[];
  color: string;
};

export default function ContactsPage() {
  const { apiFetch } = useApi();
  const { tenantId } = useTenant();
  
  const [activeTab, setActiveTab] = useState("Smart Lists");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabs = ["Smart Lists", "Bulk Actions", "Restore", "Tasks", "Companies", "Manage Smart Lists"];

  // Fetch Contacts
  useEffect(() => {
    if (!tenantId || tenantId === "00000000-0000-0000-0000-000000000000") return;
    
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`/api/v1/crm/contacts?limit=50`);
        if (!res.ok) throw new Error("Failed to fetch contacts");
        const data = await res.json();
        
        const mapped = data.items.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || "Not provided",
          email: c.email || "Not provided",
          created: new Date(c.created_at).toLocaleDateString() + "\\n" + new Date(c.created_at).toLocaleTimeString(),
          lastActivity: "Unknown",
          tags: c.tags || [],
          color: "bg-blue-500" // Default for now
        }));
        
        setContacts(mapped);
      } catch (error) {
        console.error("Error fetching contacts", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, [tenantId, apiFetch]);

  // Bulk Actions
  const handleBulkTag = async () => {
    if (selectedIds.size === 0) return;
    const tag = prompt("Enter tag name:");
    if (!tag) return;
    
    try {
      const res = await apiFetch('/api/v1/crm/contacts/bulk/tag', {
        method: 'POST',
        body: JSON.stringify({
          contact_ids: Array.from(selectedIds),
          tags: [tag]
        })
      });
      if (res.ok) {
        alert(`Successfully tagged ${selectedIds.size} contacts.`);
        // Simple optimistic refresh
        setContacts(contacts.map(c => selectedIds.has(c.id) ? { ...c, tags: [...c.tags, tag] } : c));
        setSelectedIds(new Set());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to archive ${selectedIds.size} contacts?`)) return;
    
    try {
      const res = await apiFetch('/api/v1/crm/contacts/bulk/archive', {
        method: 'POST',
        body: JSON.stringify({
          contact_ids: Array.from(selectedIds)
        })
      });
      if (res.ok) {
        setContacts(contacts.filter(c => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  
  const toggleAll = () => {
    if (selectedIds.size === contacts.length && contacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      
      {/* Top Header / Sub-Nav */}
      <div className="bg-white border-b border-gray-200 px-6 pt-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h1 className="text-xl font-bold text-gray-900 mr-6 mb-3">Contacts</h1>
          <div className="flex gap-6 text-sm font-medium">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
            <button className="pb-3 text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto p-6">
        
        {/* Smart Lists Filters Bar */}
        <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-2">
          <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 -mb-[9px] px-2">
            All
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-800 pb-2 px-2">
            +
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-white border border-gray-200 rounded-t-lg p-2 flex items-center justify-between shadow-sm">
          {/* Left Actions */}
          <div className="flex items-center divide-x divide-gray-200">
            <div className="flex items-center px-2 gap-1 text-gray-500">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center px-2 gap-1 text-gray-500">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Filter className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center px-2 gap-1 text-gray-500">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Bot className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><MessageSquare className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Mail className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center px-2 gap-1 text-gray-500">
              <button onClick={handleBulkTag} disabled={selectedIds.size === 0} className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50" title="Bulk Tag"><Tags className="w-4 h-4" /></button>
              <button onClick={handleBulkArchive} disabled={selectedIds.size === 0} className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50" title="Bulk Archive"><Trash2 className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"><Star className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center px-2 gap-1 text-gray-500">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Upload className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Download className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center px-2 gap-1 text-gray-500">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><MessageCircle className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 pr-2">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Columns <ChevronDown className="w-3.5 h-3.5" />
            </button>
            
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Quick search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded">
              More Filters <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border-x border-b border-gray-200 rounded-b-lg shadow-sm">
          
          {/* Table Metrics */}
          <div className="flex justify-end px-4 py-2 bg-blue-50/50 border-b border-gray-100 text-xs font-medium text-gray-500">
            Total {filteredContacts.length} records | {selectedIds.size > 0 && <span className="text-blue-600 font-bold ml-1">{selectedIds.size} selected</span>}
          </div>

          <div className="overflow-x-auto relative min-h-[200px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                 <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[13px] font-semibold text-gray-500 border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                  </th>
                  <th className="px-2 py-3 w-10"></th>
                  <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-50">Name <ChevronDown className="inline w-3 h-3 ml-1" /></th>
                  <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-50">Phone <ChevronDown className="inline w-3 h-3 ml-1" /></th>
                  <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-50">Email <ChevronDown className="inline w-3 h-3 ml-1" /></th>
                  <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-50">Created <ChevronDown className="inline w-3 h-3 ml-1" /></th>
                  <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-50">Last Activity <ChevronDown className="inline w-3 h-3 ml-1" /></th>
                  <th className="px-4 py-3 whitespace-nowrap">Tags</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelection(contact.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" 
                      />
                    </td>
                    <td className="px-2 py-3 text-gray-400 cursor-pointer hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${contact.color}`}>
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {contact.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        {contact.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-pre-line text-gray-600 leading-tight">
                      <span className="font-medium text-gray-800">{contact.created.split('\n')[0]}</span><br/>
                      <span className="text-blue-500 text-xs">{contact.created.split('\n')[1]}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-medium">
                      {contact.lastActivity && (
                        <div className="flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                          {contact.lastActivity}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {contact.tags.map((tag, i) => (
                        <span key={i} className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
