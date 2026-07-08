"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/i18n-context";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone,
  UserCircle2,
  Building,
  Loader2,
  Users
} from "lucide-react";
import { format } from "date-fns";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
};

export default function ContactsPage() {
  const { t } = useI18n();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI("/crm/contacts");
      setContacts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchAPI("/crm/contacts", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ name: "", email: "", phone: "", company: "" });
      loadContacts();
    } catch (err) {
      alert("Failed to create contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-white text-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.contacts.title}</h1>
          <p className="text-gray-500 mt-1">{t.contacts.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#12826a] hover:bg-[#0e6b57] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t.contacts.newContact}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
        <div className="relative w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={t.contacts.search} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#12826a]/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">{t.contacts.name}</th>
                <th className="px-6 py-4 font-medium tracking-wider">Contact Info</th>
                <th className="px-6 py-4 font-medium tracking-wider">{t.contacts.company}</th>
                <th className="px-6 py-4 font-medium tracking-wider">Added On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-[#12826a] animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Loading...</p>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium">{t.contacts.noContacts}</p>
                    <p className="text-gray-500 text-sm mt-1">{t.contacts.createPrompt}</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e6f2ec] border border-[#12826a]/20 flex items-center justify-center text-[#12826a] font-medium">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-900">{contact.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center text-gray-600 gap-2">
                            <Mail className="w-3.5 h-3.5" /> {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center text-gray-600 gap-2">
                            <Phone className="w-3.5 h-3.5" /> {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {contact.company ? (
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5" /> {contact.company}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {format(new Date(contact.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-gray-400 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">{t.contacts.newContact}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contacts.name} *</label>
                <div className="relative">
                  <UserCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12826a]/50 focus:border-[#12826a]" placeholder="Jane Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contacts.email}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12826a]/50 focus:border-[#12826a]" placeholder="jane@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contacts.phone}</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12826a]/50 focus:border-[#12826a]" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contacts.company}</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12826a]/50 focus:border-[#12826a]" placeholder="Acme Corp" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  {t.contacts.cancel}
                </button>
                <button disabled={isSubmitting} type="submit" className="bg-[#12826a] hover:bg-[#0e6b57] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.contacts.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
