import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import CommandPalette from "./CommandPalette";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { Menu, X, Search, Sun, Moon, ArrowUp, Heart } from "lucide-react";
import { lazy, Suspense } from "react";

const LazyDynamicIcon = lazy(() => import("./DynamicIcon"));
function DynamicIcon(props: any) {
  return (
    <Suspense fallback={<div className="w-3.5 h-3.5" />}>
      <LazyDynamicIcon {...props} />
    </Suspense>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [footerSocials, setFooterSocials] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
    });
    return unsub;
  }, []);

  // Load social links from config for footer
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "config"), (snap) => {
      if (!snap.empty) {
        try {
          const data = snap.docs[0].data();
          if (data.socialsJSON) setFooterSocials(JSON.parse(data.socialsJSON));
        } catch {}
      }
    });
    return unsub;
  }, []);

  // Dark mode persistence
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu + scroll to top on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Back-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Resources", path: "/resources" },
    { name: "Writings", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="dot-bg"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-[60px] z-[100] flex items-center justify-between px-6 md:px-12 bg-theme-bg/85 backdrop-blur-[16px] border-b border-theme-border transition-all duration-200">
        <Link to="/" className="font-serif text-[18px] text-theme-text cursor-pointer flex items-center gap-2">
          Sahil Bind
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== "/" && location.pathname.startsWith(link.path));
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-[13px] font-medium px-3 py-[5px] rounded-md transition-all duration-200 ${
                    isActive ? "text-theme-text bg-theme-bg3" : "text-theme-text2 hover:text-theme-text hover:bg-theme-bg3"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
          {user?.email === "the.sahilbind@gmail.com" && (
            <li>
              <Link
                to="/admin"
                className="text-[13px] font-medium px-3 py-[5px] rounded-md transition-all duration-200 text-theme-accent border border-theme-border hover:bg-theme-bg3"
              >
                Studio ↗
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex text-[13px] text-theme-text3 bg-theme-bg2 border border-theme-border rounded-md px-2.5 py-1.5 cursor-pointer transition-all duration-200 items-center gap-2 hover:text-theme-text hover:border-theme-text3"
          >
            <Search size={14} /> <span className="opacity-70">Search...</span>
          </button>
          
          <button
            onClick={() => setCmdOpen(true)}
            className="sm:hidden w-8 h-8 border border-theme-border rounded-lg bg-theme-bg2 cursor-pointer flex items-center justify-center text-theme-text transition-all duration-200 hover:bg-theme-bg3"
          >
            <Search size={16} />
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            className="w-8 h-8 border border-theme-border rounded-lg bg-theme-bg2 cursor-pointer flex items-center justify-center text-theme-text transition-all duration-200 hover:bg-theme-bg3"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 border border-theme-border rounded-lg bg-theme-bg2 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-theme-bg3 text-theme-text"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] z-[90] bg-theme-bg md:hidden overflow-y-auto">
          <ul className="flex flex-col p-6 gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== "/" && location.pathname.startsWith(link.path));
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block w-full text-lg font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive ? "text-theme-text bg-theme-bg3" : "text-theme-text2 hover:text-theme-text hover:bg-theme-bg3"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
            {user?.email === "the.sahilbind@gmail.com" && (
              <li>
                <Link
                  to="/admin"
                  className="block w-full text-lg font-medium px-4 py-3 rounded-xl transition-all duration-200 text-theme-accent border border-theme-border bg-theme-bg2"
                >
                  Studio ↗
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Main Content with Page Transitions */}
      <main className="relative z-10 pt-[60px] min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-theme-border px-6 md:px-12 py-10 mt-12 bg-theme-bg/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="text-theme-text3 text-[13px] font-mono">
              &copy; {new Date().getFullYear()} Sahil Bind.
            </div>
            <div className="text-theme-text3 text-[11px] flex items-center gap-1">
              Engineered with <Heart size={10} className="text-theme-accent" /> and mathematical precision.
            </div>
          </div>
          <div className="flex items-center gap-3">
            {footerSocials.slice(0, 4).map((s, i) => {
              return (
                <a key={i} href={s.href} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg border border-theme-border bg-theme-bg2 flex items-center justify-center text-theme-text3 hover:text-theme-text hover:border-theme-text3 transition-all duration-200" title={s.label}>
                  <DynamicIcon name={s.icon} size={14} />
                </a>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[13px] text-theme-text2">
            <Link to="/" className="hover:text-theme-text transition-colors">Home</Link>
            <Link to="/about" className="hover:text-theme-text transition-colors">About</Link>
            <Link to="/projects" className="hover:text-theme-text transition-colors">Projects</Link>
            <Link to="/contact" className="hover:text-theme-text transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-[90] w-10 h-10 rounded-full bg-theme-text text-theme-bg flex items-center justify-center shadow-lg hover:opacity-85 transition-opacity cursor-pointer"
            title="Back to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <CommandPalette 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)} 
        toggleTheme={() => setIsDark(!isDark)} 
      />
    </div>
  );
}
