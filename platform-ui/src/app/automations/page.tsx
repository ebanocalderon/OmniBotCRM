"use client";

import { useState, useEffect } from "react";
import { Plus, Settings, Zap, Trash2, Edit3, Bot } from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  trigger_event: string;
  trigger_condition: any;
  action_type: string;
  action_config: any;
  is_active: boolean;
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("contact_created");
  const [actionType, setActionType] = useState("send_message");
  const [messageText, setMessageText] = useState("");

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/automations", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/proxy/automations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name,
          trigger_event: triggerEvent,
          trigger_condition: {},
          action_type: actionType,
          action_config: actionType === "send_message" ? { message: messageText } : {},
          is_active: true
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setMessageText("");
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    try {
      const res = await fetch(`/api/proxy/automations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      const res = await fetch(`/api/proxy/automations/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          is_active: !rule.is_active
        })
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative z-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-sm">
            <Zap className="w-6 h-6 text-emerald-400" />
            Automation Workflows
          </h1>
          <p className="text-slate-400 mt-1">Build rules to automate your customer operations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass-button-primary px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Workflow
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Loading workflows...</div>
      ) : rules.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <Bot className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No workflows found</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">Create your first automation workflow to save time and streamline your operations.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-button px-6 py-2.5 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Workflow
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Workflow Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trigger</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200">{rule.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                      <Zap className="w-3 h-3" />
                      {rule.trigger_event === 'contact_created' ? 'Contact Created' : 'Message Received'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {rule.action_type === 'send_message' ? `Send Msg: "${rule.action_config?.message?.substring(0, 20)}..."` : rule.action_type}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggle(rule)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rule.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-white/20">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h2 className="text-lg font-bold text-white">Create Workflow</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Workflow Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-lg"
                    placeholder="e.g. Welcome Message"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">When this happens (Trigger)</label>
                  <select 
                    value={triggerEvent}
                    onChange={e => setTriggerEvent(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-lg [&>option]:bg-slate-900"
                  >
                    <option value="contact_created">New Contact is Created</option>
                    <option value="message_received">Message is Received</option>
                  </select>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Do this (Action)</label>
                    <select 
                      value={actionType}
                      onChange={e => setActionType(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg [&>option]:bg-slate-900"
                    >
                      <option value="send_message">Send Auto-Reply Message</option>
                      <option value="add_tag" disabled>Add Tag (Coming Soon)</option>
                    </select>
                  </div>
                  
                  {actionType === "send_message" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Message Content</label>
                      <textarea 
                        required
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        rows={3}
                        className="glass-input w-full px-3 py-2 rounded-lg"
                        placeholder="Hi! Thanks for reaching out..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="glass-button px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="glass-button-primary px-6 py-2 rounded-lg"
                >
                  Save & Enable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
