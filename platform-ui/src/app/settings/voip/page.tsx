"use client";

import { useState, useEffect } from "react";
import { Phone, Search, Save, Plus, ArrowRight, Loader2, Edit2, X, Check } from "lucide-react";

export default function VoIPSettingsPage() {
  // Credentials State
  const [credentials, setCredentials] = useState({
    sid: "",
    token: ""
  });
  const [isEditingCreds, setIsEditingCreds] = useState(true);
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Numbers State
  const [activeNumbers, setActiveNumbers] = useState<{number: string, capabilities: string[]}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  
  // Routing State
  const [routingRules, setRoutingRules] = useState([
    { id: 1, number: "+1 (305) 555-1234", destination: "Main IVR Menu" }
  ]);
  const [isSavingRules, setIsSavingRules] = useState(false);

  // Fetch initial data (simulated)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Start empty based on requirement, wait for user to add
    };
    fetchInitialData();
  }, []);

  const handleSaveCredentials = async () => {
    setIsSavingCreds(true);
    try {
      // Simulate API call
      console.log("Saving Twilio Credentials:", credentials);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsEditingCreds(false);
    } catch (error) {
      console.error("Failed to save credentials", error);
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleSearchNumbers = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      // Simulate API call
      console.log("Searching Twilio for area code:", searchQuery);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate some fake numbers based on area code
      const fakeNumbers = [
        `+1 (${searchQuery}) 555-${Math.floor(1000 + Math.random() * 9000)}`,
        `+1 (${searchQuery}) 555-${Math.floor(1000 + Math.random() * 9000)}`,
        `+1 (${searchQuery}) 555-${Math.floor(1000 + Math.random() * 9000)}`,
      ];
      setSearchResults(fakeNumbers);
    } catch (error) {
      console.error("Failed to search numbers", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBuyNumber = async (num: string) => {
    // Simulate purchase
    setActiveNumbers([...activeNumbers, { number: num, capabilities: ["Voice", "SMS"] }]);
    setSearchResults(searchResults.filter(n => n !== num));
    
    // Add default routing rule
    setRoutingRules([...routingRules, { id: Date.now(), number: num, destination: "Main IVR Menu" }]);
  };

  const handleRemoveRule = (id: number) => {
    setRoutingRules(routingRules.filter(r => r.id !== id));
  };

  const handleSaveRouting = async () => {
    setIsSavingRules(true);
    try {
      console.log("Saving Routing Rules:", routingRules);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success toast here
    } catch (error) {
      console.error("Failed to save rules", error);
    } finally {
      setIsSavingRules(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">VoIP & Telephony</h1>
        <p className="text-gray-500 mt-1">Configure your phone system, purchase numbers, and set up call routing.</p>
      </div>

      <div className="space-y-8">
        
        {/* Step 1: Credentials */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Step 1: Provider Credentials</h2>
            {!isEditingCreds && (
              <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Twilio Connected
              </span>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account SID</label>
              <input 
                type="text" 
                value={credentials.sid} 
                onChange={e => setCredentials({...credentials, sid: e.target.value})}
                readOnly={!isEditingCreds} 
                placeholder="AC..."
                className={`w-full border rounded-lg px-4 py-2 text-sm outline-none transition-colors ${!isEditingCreds ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900'}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auth Token</label>
              <input 
                type="password" 
                value={credentials.token} 
                onChange={e => setCredentials({...credentials, token: e.target.value})}
                readOnly={!isEditingCreds} 
                placeholder="••••••••••••••••••••••••••••••••"
                className={`w-full border rounded-lg px-4 py-2 text-sm outline-none transition-colors ${!isEditingCreds ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900'}`} 
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              {isEditingCreds ? (
                <button 
                  onClick={handleSaveCredentials}
                  disabled={!credentials.sid || !credentials.token || isSavingCreds}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isSavingCreds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSavingCreds ? "Saving..." : "Save Credentials"}
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingCreds(true)}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Credentials
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Step 2: Phone Number Marketplace */}
        <section className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-opacity ${isEditingCreds ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Step 2: Phone Numbers</h2>
            <p className="text-sm text-gray-500 mt-1">Manage existing numbers or purchase new ones.</p>
          </div>
          
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Active Numbers</h3>
            {activeNumbers.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                <Phone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">No active numbers</p>
                <p className="text-xs text-gray-400">Search and buy a number below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeNumbers.map((num, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{num.number}</span>
                      <div className="flex gap-1">
                        {num.capabilities.map(cap => (
                          <span key={cap} className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase font-bold">{cap}</span>
                        ))}
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-800">Configure</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50/30">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Buy a New Number</h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchNumbers()}
                  placeholder="Search by area code (e.g. 305)" 
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <button 
                onClick={handleSearchNumbers}
                disabled={!searchQuery || isSearching}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Search
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Available Numbers
                </div>
                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {searchResults.map((num, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{num}</span>
                        <span className="text-[10px] text-gray-500">$1.15/mo</span>
                      </div>
                      <button 
                        onClick={() => handleBuyNumber(num)}
                        className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded font-bold transition-colors"
                      >
                        Buy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Step 3: Routing Rules */}
        <section className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-opacity ${activeNumbers.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-900">Step 3: Call Routing Rules</h2>
              <p className="text-sm text-gray-500 mt-1">Determine what happens when a customer calls you.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
          
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {routingRules.length === 0 ? (
                 <div className="p-8 text-center bg-gray-50">
                   <p className="text-sm text-gray-500">No routing rules configured.</p>
                 </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {routingRules.map((rule) => (
                    <div key={rule.id} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">If call is to</span>
                          <span className="font-medium text-gray-900">{rule.number}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Route to</span>
                          <select 
                            value={rule.destination}
                            onChange={(e) => setRoutingRules(routingRules.map(r => r.id === rule.id ? {...r, destination: e.target.value} : r))}
                            className="font-medium text-gray-900 border-b border-dashed border-gray-400 focus:border-blue-500 focus:outline-none bg-transparent cursor-pointer"
                          >
                            <option value="Main IVR Menu">Main IVR Menu</option>
                            <option value="Sales Queue">Sales Queue</option>
                            <option value="Support Queue">Support Queue</option>
                            <option value="Forward to Cell">Forward to Cell</option>
                            <option value="Voicemail">Voicemail</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => handleRemoveRule(rule.id)} className="px-3 py-1.5 text-sm border border-red-200 bg-red-50 rounded-md font-medium text-red-600 hover:bg-red-100">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleSaveRouting}
                disabled={isSavingRules}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70"
              >
                {isSavingRules ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                {isSavingRules ? "Saving..." : "Save Routing Configuration"}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
