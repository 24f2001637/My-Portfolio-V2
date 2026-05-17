import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import CommandPalette from "./CommandPalette";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Menu, X, Search, Sun, Moon } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
          {user?.email === "sahilbind457@gmail.com" && (
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
            className="hidden sm:flex font-mono text-[11px] text-theme-text3 bg-theme-bg2 border border-theme-border rounded-md px-2.5 py-1 cursor-pointer transition-all duration-200 items-center gap-1.5 hover:text-theme-text hover:border-theme-text3"
          >
            ⌘K <span className="opacity-50">Search</span>
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
            {user?.email === "sahilbind457@gmail.com" && (
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

      {/* Main Content */}
      <main className="relative z-10 pt-[60px] min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between px-6 md:px-12 py-8 mt-12 bg-theme-bg/50">
        <div className="text-theme-text3 text-[13px] font-mono">
          &copy; {new Date().getFullYear()} Sahil Bind.
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0 text-[13px] text-theme-text2">
          <Link to="/" className="hover:text-theme-text transition-colors">Home</Link>
          <Link to="/about" className="hover:text-theme-text transition-colors">About</Link>
          <Link to="/contact" className="hover:text-theme-text transition-colors">Contact</Link>
        </div>
      </footer>

      <CommandPalette 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)} 
        toggleTheme={() => setIsDark(!isDark)} 
      />
    </div>
  );
}
