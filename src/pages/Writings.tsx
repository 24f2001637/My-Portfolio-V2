import { useState, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Link } from "react-router-dom";
import { formatDate } from "../lib/utils";
import SEO from "../components/SEO";

export default function Writings() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filters, setFilters] = useState<string[]>(["All"]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "blogs"), (snap) => {
      const fetchedBlogs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setBlogs(fetchedBlogs);
      
      const categories: string[] = [];
      fetchedBlogs.forEach(b => {
        if (b.category && !categories.includes(b.category)) {
          categories.push(b.category);
        }
      });
      setFilters(["All", ...categories]);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, "blogs");
    });
    return unsub;
  }, []);

  const filteredBlogs = blogs.filter(b => {
    const matchFilter = activeFilter === "All" || b.category === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = q === "" || 
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  return (
    <>
      <SEO 
        title="Writings & Blog | Sahil Bind — Insights on AI and Data Science"
        description="Read articles, tutorials, and thoughts by Sahil Bind on artificial intelligence, data science, and web development. Stay updated with the latest trends and projects."
        url="https://sahilbind.in/writings"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20 fade-in">
        <div className="flex flex-col mb-10 pb-5 border-b border-theme-border">
        <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">Writing</div>
        <h2 className="font-serif text-4xl tracking-[-0.02em] text-theme-text">All <em className="italic text-theme-accent">Writings</em></h2>
      </div>

      <div className="flex items-center gap-2.5 bg-theme-card border border-theme-border rounded-md px-3.5 py-2 mb-6 shadow-theme-card transition-colors duration-200 focus-within:border-theme-accent">
        <Search className="w-4 h-4 text-theme-text3" />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search writings..." 
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBlogs.length === 0 && <div className="col-span-full pt-8 text-center text-theme-text2">No blogs found. Check the Admin panel to add some.</div>}
        
        {filteredBlogs.map((blog) => (
          <Link to={`/blogs/${blog.id}`} key={blog.id} className="bg-theme-card border border-theme-border rounded-3xl p-8 cursor-pointer transition-all duration-300 shadow-theme-card hover:-translate-y-1 hover:shadow-theme-hover hover:border-theme-accent flex flex-col md:flex-row gap-6 items-center group decoration-transparent">
            <div className="h-48 w-full md:w-1/2 bg-theme-bg2 rounded-lg border border-theme-border flex items-center justify-center text-5xl overflow-hidden">
              {blog.coverImage ? (
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-theme-text flex items-center justify-center">
                  {((LucideIcons as any)[blog.icon]) ? 
                    (() => {
                      const IconComp = (LucideIcons as any)[blog.icon];
                      return <IconComp size={48} className="text-theme-text" />;
                    })()
                    :
                    <span>{blog.icon}</span>
                  }
                </span>
              )}
            </div>
            <div className="w-full md:w-1/2 flex flex-col h-full justify-center">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="font-mono text-[10px] text-theme-accent uppercase tracking-[0.08em]">{blog.category}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-theme-text3"></span>
                <span className="font-mono text-[10px] text-theme-text3">{blog.createdAt ? formatDate(blog.createdAt) : blog.readTime}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-theme-text3"></span>
                <span className="font-mono text-[10px] text-theme-text3">{blog.readTime}</span>
              </div>
              <div className="font-serif text-xl text-theme-text mb-2 leading-tight group-hover:text-theme-accent transition-colors duration-200">{blog.title}</div>
              <div className="text-sm text-theme-text2 leading-relaxed mb-4 flex-1">
                {blog.excerpt}
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-theme-border">
                <div className="flex gap-1.5 flex-wrap">
                  {blog.tags?.map((tag: string) => (
                    <span key={tag} className="font-mono text-[9px] px-[7px] py-[2px] rounded bg-theme-bg2 text-theme-text3 border border-theme-border">{tag}</span>
                  ))}
                </div>
                <span className="text-[11px] text-theme-accent flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight className="w-3 h-3" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
