"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/i18n-context";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Building,
  Loader2,
  Globe,
  Phone,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";

type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
};

export default function CompaniesPage() {
  const { t } = useI18n();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({ name: "", domain: "", industry: "", size: "", website: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI("/crm/companies");
      setCompanies(res.data || []);
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
      await fetchAPI("/crm/companies", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ name: "", domain: "", industry: "", size: "", website: "" });
      loadCompanies();
    } catch (err) {
      alert("Failed to create company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.domain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-black/40 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white/90">Companies</h1>
          <p className="text-white/50 mt-1">Manage B2B accounts and organizations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-all shadow-lg backdrop-blur-md"
        >
          <Plus className="w-4 h-4" />
          New Company
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 shadow-2xl backdrop-blur-xl flex items-center justify-between">
        <div className="relative w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search companies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/50 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Company</th>
                <th className="px-6 py-4 font-medium tracking-wider">Domain / Website</th>
                <th className="px-6 py-4 font-medium tracking-wider">Industry</th>
                <th className="px-6 py-4 font-medium tracking-wider">Size</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-white/40 animate-spin mx-auto mb-2" />
                    <p className="text-white/50">Loading companies...</p>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Building className="w-8 h-8 text-white/30" />
                    </div>
                    <p className="text-white/90 font-medium text-lg">No companies found</p>
                    <p className="text-white/50 mt-1">Get started by adding a new B2B account.</p>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white/90 font-medium shadow-inner">
                          {company.name.charAt(0)}
                        </div>
                        <div className="font-medium text-white/90">{company.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {company.domain && (
                          <div className="flex items-center text-white/60 gap-2">
                            <Globe className="w-3.5 h-3.5" /> {company.domain}
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center text-white/60 gap-2 text-xs">
                            <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-white/90 transition-colors">
                              {company.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/60">
                      {company.industry ? (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5" /> {company.industry}
                        </div>
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/60">
                      {company.size || <span className="text-white/30">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-white/40 hover:text-white/90 p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-lg font-medium text-white">New Company</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white/90 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Company Name *</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder="Acme Corp" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Domain</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder="acme.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Industry</label>
                  <input type="text" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder="Technology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Size</label>
                  <select value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none">
                    <option value="" className="bg-zinc-900 text-white">Select...</option>
                    <option value="1-10" className="bg-zinc-900 text-white">1-10</option>
                    <option value="11-50" className="bg-zinc-900 text-white">11-50</option>
                    <option value="51-200" className="bg-zinc-900 text-white">51-200</option>
                    <option value="201-500" className="bg-zinc-900 text-white">201-500</option>
                    <option value="500+" className="bg-zinc-900 text-white">500+</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white/90 transition-colors">
                  Cancel
                </button>
                <button disabled={isSubmitting} type="submit" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
