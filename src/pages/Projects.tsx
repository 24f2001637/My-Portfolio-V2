import { useState, useEffect } from "react";
import { Search, Github, ExternalLink } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Helmet } from "react-helmet-async";

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [filters, setFilters] = useState<string[]>(["All"]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snap) => {
      const fetchedProjects = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setProjects(fetchedProjects);
      
      const categories: string[] = [];
      fetchedProjects.forEach(p => {
        if (p.category && !categories.includes(p.category)) {
          categories.push(p.category);
        }
      });
      setFilters(["All", ...categories]);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, "projects");
    });
    return unsub;
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchFilter = activeFilter === "All" || p.category === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = q === "" || 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  return (
    <>
      <Helmet>
        <title>Projects | Sahil Bind</title>
        <meta name="description" content="Projects and experiments by Sahil Bind." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20 fade-in">
        <div className="flex flex-col mb-10 pb-5 border-b border-theme-border">
        <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">Portfolio</div>
        <h2 className="font-serif text-4xl tracking-[-0.02em] text-theme-text">All <em className="italic text-theme-accent">Projects</em></h2>
      </div>

      <div className="flex items-center gap-2.5 bg-theme-card border border-theme-border rounded-md px-3.5 py-2 mb-6 shadow-theme-card transition-colors duration-200 focus-within:border-theme-accent">
        <Search className="w-4 h-4 text-theme-text3" />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..." 
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.length === 0 && <div className="col-span-full pt-8 text-center text-theme-text2">No projects found. Check the Admin panel to add some.</div>}
        
        {filteredProjects.map((proj, i) => (
          <div key={proj.id} className={`${i === 0 ? 'col-span-1 md:col-span-2 flex-col sm:flex-row' : 'flex-col'} bg-theme-card border border-theme-border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-hover hover:border-theme-accent group flex`}>
            <div className={`${i === 0 ? 'h-48 sm:h-auto w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r shrink-0' : 'h-48 border-b shrink-0'} bg-theme-bg2 flex items-center justify-center text-4xl border-theme-border relative overflow-hidden`}>
              {proj.coverImage ? (
                <img src={proj.coverImage} alt={proj.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-theme-text3 text-sm font-mono">No cover image</span>
              )}
              {proj.status && (
                <span className={`absolute top-2.5 right-2.5 font-mono text-[9px] px-2 py-[3px] rounded font-medium z-10 ${
                  proj.status.toLowerCase().includes('live') 
                    ? 'bg-[#DCFCE7] text-[#166534] dark:bg-[#052e16] dark:text-[#4ade80]'
                    : 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#1c1107] dark:text-[#fbbf24]'
                }`}>
                  {proj.status}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent from-60% to-theme-accent-glow pointer-events-none"></div>
            </div>
            <div className={`p-5 flex flex-col ${i === 0 ? 'sm:w-1/2 justify-center' : 'flex-1'}`}>
              <div className="font-mono text-[9px] text-theme-accent uppercase tracking-[0.1em] mb-1.5">{proj.category}</div>
              <div className="font-serif text-xl text-theme-text mb-1.5 leading-tight">{proj.name}</div>
              <div className="text-xs text-theme-text2 leading-relaxed mb-3.5">
                {proj.description}
              </div>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {proj.stack?.map((tag: string) => (
                  <span key={tag} className="font-mono text-[10px] text-theme-text3 bg-theme-bg2 px-[7px] py-[2px] rounded border border-theme-border">{tag}</span>
                ))}
              </div>
              <div className="flex gap-2 mt-auto">
                {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-[11px] px-2.5 py-1 rounded-md cursor-pointer border border-theme-border bg-theme-bg2 text-theme-text2 hover:border-theme-accent hover:text-theme-accent transition-colors flex items-center gap-1"><Github size={12}/> GitHub</a>}
                {proj.demoLink && <a href={proj.demoLink} target="_blank" rel="noreferrer" className="text-[11px] px-2.5 py-1 rounded-md cursor-pointer border border-theme-border bg-theme-bg2 text-theme-text2 hover:border-theme-accent hover:text-theme-accent transition-colors flex items-center gap-1"><ExternalLink size={12}/> Demo</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
