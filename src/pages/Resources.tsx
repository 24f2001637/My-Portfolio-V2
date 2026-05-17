import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Helmet } from "react-helmet-async";

export default function Resources() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<any[]>([]);
  const [filters, setFilters] = useState<string[]>(["All"]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "resources"), (snap) => {
      const fetchedResources = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setResources(fetchedResources);
      
      const types: string[] = [];
      fetchedResources.forEach(r => {
        if (r.type && !types.includes(r.type)) {
          types.push(r.type);
        }
      });
      setFilters(["All", ...types]);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, "resources");
    });
    return unsub;
  }, []);

  const filteredResources = resources.filter(r => {
    const matchFilter = activeFilter === "All" || (r.type && r.type.includes(activeFilter)) || (r.badge && r.badge === activeFilter);
    const q = searchQuery.toLowerCase();
    const matchSearch = q === "" || 
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.type && r.type.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  return (
    <>
      <Helmet>
        <title>Resources | Sahil Bind</title>
        <meta name="description" content="Curated learning resources and materials by Sahil Bind." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20 fade-in">
        <div className="flex flex-col mb-10 pb-5 border-b border-theme-border">
        <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">Knowledge Hub</div>
        <h2 className="font-serif text-4xl tracking-[-0.02em] text-theme-text">Curated <em className="italic text-theme-accent">Resources</em></h2>
      </div>

      <div className="flex items-center gap-2.5 bg-theme-card border border-theme-border rounded-md px-3.5 py-2 mb-6 shadow-theme-card transition-colors duration-200 focus-within:border-theme-accent">
        <Search className="w-4 h-4 text-theme-text3" />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search resources, topics, types..." 
          className="flex-1 bg-transparent border-none outline-none font-sans text-[13px] text-theme-text" 
        />
      </div>

      <div className="flex gap-1.5 flex-wrap mb-7">
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`font-mono text-[10px] px-3 py-1 rounded-full border transition-colors duration-200 cursor-pointer ${
              activeFilter === f 
                ? "bg-theme-accent border-theme-accent text-theme-bg" 
                : "bg-theme-card border-theme-border text-theme-text2 hover:bg-theme-accent hover:border-theme-accent hover:text-theme-bg"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredResources.length === 0 && <div className="col-span-full pt-8 text-center text-theme-text2">No resources found. Check the Admin panel to add some.</div>}
        
        {filteredResources.map((res, i) => (
          <div key={res.id} className="bg-theme-card border border-theme-border rounded-3xl cursor-pointer transition-all duration-300 shadow-theme-card hover:-translate-y-1 hover:shadow-theme-hover hover:border-theme-accent flex flex-col overflow-hidden">
            {res.coverImage ? (
              <div className="w-full h-32 bg-theme-accent-bg border-b border-theme-border overflow-hidden shrink-0">
                <img src={res.coverImage} alt={res.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : null}
            <div className="p-6 flex flex-col gap-2.5 h-full">
              {res.icon && !res.coverImage && (
                <div className="w-10 h-10 rounded-lg bg-theme-accent-bg border border-theme-border flex items-center justify-center shrink-0 text-theme-text text-xl">
                  {((LucideIcons as any)[res.icon]) ? 
                    (() => {
                      const IconComp = (LucideIcons as any)[res.icon];
                      return <IconComp size={20} className="text-theme-text" />;
                    })()
                    :
                    <span>{res.icon}</span>
                  }
                </div>
              )}
              <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-[0.1em]">{res.type}</div>
              <div className="text-[13px] font-semibold text-theme-text leading-tight">{res.name}</div>
              <div className="text-[11px] text-theme-text2 leading-relaxed flex-1">{res.description}</div>
              <div className="flex items-center justify-between mt-2">
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded ${res.badge.toLowerCase() === 'advanced' ? 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#1c0505] dark:text-[#f87171]' : 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#1c1107] dark:text-[#fbbf24]'}`}>{res.badge}</span>
                <a href={res.actionLink} target="_blank" rel="noreferrer" className={`block text-[11px] px-2.5 py-1 rounded-md cursor-pointer border bg-theme-bg2 transition-colors duration-200 text-theme-accent border-theme-accent hover:bg-theme-accent-bg`}>{res.actionText}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
