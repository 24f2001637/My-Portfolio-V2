import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Search, Folder, Book, PenTool, FileText, Mail, Moon } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export default function CommandPalette({ isOpen, onClose, toggleTheme }: { isOpen: boolean; onClose: () => void; toggleTheme: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      
      const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, "projects"));
      
      const unsubBlogs = onSnapshot(collection(db, "blogs"), (snap) => {
        setBlogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, "blogs"));
      
      const unsubResources = onSnapshot(collection(db, "resources"), (snap) => {
        setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, "resources"));
      
      return () => {
        unsubProjects();
        unsubBlogs();
        unsubResources();
        setSearchQuery("");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase();
  
  const filteredProjects = q ? projects.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : [];
  const filteredBlogs = q ? blogs.filter(b => b.title?.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q)) : [];
  const filteredResources = q ? resources.filter(r => r.name?.toLowerCase().includes(q) || r.desc?.toLowerCase().includes(q)) : [];

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-start justify-center pt-[120px] fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-theme-card border border-theme-border rounded-2xl w-full max-w-[560px] mx-4 sm:mx-0 shadow-[0_24px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-[18px] py-[14px] border-b border-theme-border shrink-0">
          <Search className="w-4 h-4 text-theme-text3 shrink-0" />
          <input 
            ref={inputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none outline-none font-sans text-[15px] text-theme-text placeholder:text-theme-text3"
            placeholder="Search projects, blogs, resources..." 
          />
          <span className="font-mono text-[10px] text-theme-text3 bg-theme-bg2 px-[7px] py-[3px] rounded border border-theme-border shrink-0 hidden sm:block">ESC</span>
        </div>
        
        <div className="overflow-y-auto w-full">
          {!q ? (
            <>
              <div className="p-2">
                <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-wider px-2.5 py-1 mb-0.5">Navigation</div>
                <button onClick={() => { navigate('/projects'); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                  <span className="w-6 flex items-center justify-center text-theme-text3"><Folder size={14}/></span>
                  <span className="text-[13px] text-theme-text flex-1">View all Projects</span>
                  <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">Projects</span>
                </button>
                <button onClick={() => { navigate('/resources'); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                  <span className="w-6 flex items-center justify-center text-theme-text3"><Book size={14}/></span>
                  <span className="text-[13px] text-theme-text flex-1">Browse Resources</span>
                  <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">Resources</span>
                </button>
                <button onClick={() => { navigate('/blogs'); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                  <span className="w-6 flex items-center justify-center text-theme-text3"><PenTool size={14}/></span>
                  <span className="text-[13px] text-theme-text flex-1">Read Writings</span>
                  <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">Blog</span>
                </button>
              </div>
              
              <div className="p-2 border-t border-theme-border">
                <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-wider px-2.5 py-1 mb-0.5">Quick Actions</div>
                <button onClick={onClose} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                  <span className="w-6 flex items-center justify-center text-theme-text3"><FileText size={14}/></span>
                  <span className="text-[13px] text-theme-text flex-1">Download Resume</span>
                  <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">PDF</span>
                </button>
                <button onClick={() => { navigator.clipboard.writeText("sahilbind.iitm@gmail.com"); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                  <span className="w-6 flex items-center justify-center text-theme-text3"><Mail size={14}/></span>
                  <span className="text-[13px] text-theme-text flex-1">Copy Email</span>
                  <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">Contact</span>
                </button>
                <button onClick={() => { toggleTheme(); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                  <span className="w-6 flex items-center justify-center text-theme-text3"><Moon size={14}/></span>
                  <span className="text-[13px] text-theme-text flex-1">Toggle Dark Mode</span>
                  <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">UI</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-2">
              {filteredProjects.length > 0 && (
                <div className="mb-2">
                  <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-wider px-2.5 py-1 mb-0.5">Projects</div>
                  {filteredProjects.map(proj => (
                    <button key={proj.id} onClick={() => { navigate('/projects'); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                      <span className="w-6 flex items-center justify-center text-theme-text3"><Folder size={14}/></span>
                      <span className="text-[13px] text-theme-text flex-1 truncate">{proj.name}</span>
                      <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">Project</span>
                    </button>
                  ))}
                </div>
              )}
              
              {filteredBlogs.length > 0 && (
                <div className="mb-2">
                  <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-wider px-2.5 py-1 mb-0.5">Writings</div>
                  {filteredBlogs.map(blog => (
                    <button key={blog.id} onClick={() => { navigate(`/blogs/${blog.id}`); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                      <span className="w-6 flex items-center justify-center text-theme-text3"><PenTool size={14}/></span>
                      <span className="text-[13px] text-theme-text flex-1 truncate">{blog.title}</span>
                      <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">Blog</span>
                    </button>
                  ))}
                </div>
              )}
              
              {filteredResources.length > 0 && (
                <div className="mb-2">
                  <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-wider px-2.5 py-1 mb-0.5">Resources</div>
                  {filteredResources.map(res => (
                    <button key={res.id} onClick={() => { window.open(res.demoLink || res.githubLink, '_blank'); onClose(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-theme-accent-bg text-left group">
                      <span className="w-6 flex items-center justify-center text-theme-text3"><Book size={14}/></span>
                      <span className="text-[13px] text-theme-text flex-1 truncate">{res.name}</span>
                      <span className="font-mono text-[9px] text-theme-text3 bg-theme-bg2 px-1.5 py-0.5 rounded group-hover:bg-theme-bg3">Resource</span>
                    </button>
                  ))}
                </div>
              )}
              
              {filteredProjects.length === 0 && filteredBlogs.length === 0 && filteredResources.length === 0 && (
                <div className="px-2.5 py-4 text-center text-[13px] text-theme-text3">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
