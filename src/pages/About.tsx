import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import * as LucideIcons from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function About() {
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    const unsubConfig = onSnapshot(collection(db, "config"), (snap) => {
      if(!snap.empty) {
        setSiteConfig(snap.docs[0].data());
      }
    });

    return () => {
      unsubConfig();
    }
  }, []);

  const parseJSON = (str: string | undefined, defaultVal: any) => {
    try {
      if (str) return JSON.parse(str);
    } catch (e) {}
    return defaultVal;
  };

  const statsJSON = parseJSON(siteConfig?.statsJSON, [
    { label: "Location", val: "Varanasi, UP" },
    { label: "Status", val: "Open to Intern", color: "#22c55e" },
    { label: "Scholarship", val: "INSPIRE SHE" }
  ]);

  const languagesItems = parseJSON(siteConfig?.languagesJSON, [
     { icon: "Code", name: "Python" },
     { icon: "FileJson", name: "JavaScript" },
     { icon: "Database", name: "SQL" }
  ]);

  const frameworksItems = parseJSON(siteConfig?.frameworksJSON, [
     { icon: "Wrench", name: "Flask" },
     { icon: "LayoutTemplate", name: "Vue.js" },
     { icon: "Flame", name: "PyTorch" }
  ]);

  const mathItems = parseJSON(siteConfig?.mathJSON, [
     { icon: "Calculator", name: "Calculus" },
     { icon: "Grid3X3", name: "Linear Algebra" }
  ]);

  const experienceItems = parseJSON(siteConfig?.experienceJSON, [
     { year: "2025", role: "Campus Partner · Perplexity AI", desc: "Introduced AI tools to the university community, supporting research workflows." },
     { year: "2025", role: "Subject Matter Expert · Chegg Inc.", desc: "Helped students with subject-specific queries, teaching and explaining complex concepts." }
  ]);

  const educationItems = parseJSON(siteConfig?.educationJSON, [
     { year: "2024", role: "IIT Madras — BS Data Science & Applications", desc: "Concurrently pursuing BSc. Mathematics at DDU Gorakhpur University" }
  ]);

  const renderIcon = (iconName: string) => {
    if (!iconName) return null;
    if (iconName === "🏗" || iconName === "Building") return <LucideIcons.Hammer size={12}/>;
    if (iconName === "📖" || iconName === "Studying") return <LucideIcons.BookOpen size={12}/>;
    if (iconName === "🎯" || iconName === "Location") return <LucideIcons.MapPin size={12}/>;
    const IconComp = (LucideIcons as any)[iconName];
    if (IconComp) return <IconComp size={12} />;
    return <span>{iconName}</span>;
  };

  return (
    <>
      <Helmet>
        <title>About | Sahil Bind</title>
        <meta name="description" content="About Sahil Bind, Data Scientist & Developer at IIT Madras." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 items-start">
        {/* Sidebar */}
        <div className="md:sticky top-20">
          <div className="bg-theme-card border border-theme-border rounded-3xl p-8 shadow-theme-card mb-4">
            {siteConfig?.profileImage ? (
              <img src={siteConfig.profileImage} alt="Profile" className="w-[72px] h-[72px] rounded-full object-cover mb-3.5 border border-theme-border" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-theme-text flex items-center justify-center font-serif text-[28px] text-theme-bg mb-3.5">
                S
              </div>
            )}
            <div className="font-serif text-[22px] text-theme-text mb-1">Sahil</div>
            <div className="font-mono text-[11px] text-theme-accent mb-3">@sahilbind · IIT Madras'28</div>
            <div className="text-xs text-theme-text2 leading-[1.6] mb-4">
              {siteConfig?.aboutBio || "Data Scientist & Developer building at the intersection of AI, mathematics, and clean code. INSPIRE SHE Scholar. Passionate about making complex ideas accessible."}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <a href="https://github.com/24f2001637" target="_blank" rel="noreferrer" className="font-mono text-[10px] px-2.5 py-[5px] border border-theme-border rounded-md bg-theme-bg2 text-theme-text2 cursor-pointer transition-colors hover:border-theme-accent hover:text-theme-accent flex items-center gap-1"><LucideIcons.Github size={12}/> GitHub</a>
              <a href="https://www.linkedin.com/in/sahilbind-24f2001637" target="_blank" rel="noreferrer" className="font-mono text-[10px] px-2.5 py-[5px] border border-theme-border rounded-md bg-theme-bg2 text-theme-text2 cursor-pointer transition-colors hover:border-theme-accent hover:text-theme-accent flex items-center gap-1"><LucideIcons.Linkedin size={12}/> LinkedIn</a>
              <a href="mailto:sahilbind.iitm@gmail.com" className="font-mono text-[10px] px-2.5 py-[5px] border border-theme-border rounded-md bg-theme-bg2 text-theme-text2 cursor-pointer transition-colors hover:border-theme-accent hover:text-theme-accent flex items-center gap-1"><LucideIcons.Mail size={12}/> Email</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {statsJSON.map((stat: any, i: number) => (
              <div key={i} className={`bg-theme-card border border-theme-border p-4 shadow-theme-card ${i === 2 ? 'rounded-lg col-span-2 p-3' : 'rounded-2xl'}`}>
                <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-[0.1em] mb-1">{stat.label}</div>
                <div className="text-[13px] font-semibold text-theme-text flex justify-between items-center" style={{ color: stat.color || "" }}>
                  {stat.val}
                  {stat.label.toLowerCase() === "location" && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="font-serif text-[32px] text-theme-text mb-4 tracking-[-0.02em] leading-tight">
            Hey, I'm Sahil.<br/><em className="italic text-theme-accent">Nice to meet you.</em>
          </h2>
          <div 
            className="space-y-5 text-[14px] text-theme-text2 leading-[1.75]"
            dangerouslySetInnerHTML={{ __html: siteConfig?.aboutText || "<p>I'm a first-year student at IIT Madras pursuing a BS in Data Science & Applications, concurrently enrolled in BSc Mathematics at DDU Gorakhpur University. I hold the INSPIRE SHE Scholarship from the Department of Science & Technology, Govt. of India.</p><p>I'm driven by a simple belief: the best technology is invisible — it solves problems without getting in the way. That philosophy guides every project I build, every model I train, and every line of code I write.</p><p>Outside of academics, I was the Class XII Topper at my college and ranked 1st in my district at NASTA 2023. I build useful tools, write about concepts I'm learning, and curate resources that helped me. This platform is an extension of that effort.</p>" }}
          />

          <div className="mt-9">
            <div className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.1em] mb-2.5 mt-5">Languages</div>
            <div className="flex gap-1.5 flex-wrap">
              {languagesItems.map((item: any, i: number) => (
                <span key={i} className="text-xs px-3 py-1 bg-theme-bg2 border border-theme-border rounded-md text-theme-text2 flex items-center gap-1.5 cursor-default hover:border-theme-accent hover:text-theme-text transition-colors">
                  {renderIcon(item.icon)} {item.name}
                </span>
              ))}
            </div>
            
            <div className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.1em] mb-2.5 mt-5">Frameworks & Tools</div>
            <div className="flex gap-1.5 flex-wrap">
              {frameworksItems.map((item: any, i: number) => (
                <span key={i} className="text-xs px-3 py-1 bg-theme-bg2 border border-theme-border rounded-md text-theme-text2 flex items-center gap-1.5 cursor-default hover:border-theme-accent hover:text-theme-text transition-colors">
                  {renderIcon(item.icon)} {item.name}
                </span>
              ))}
            </div>
            
            <div className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.1em] mb-2.5 mt-5">Mathematics</div>
            <div className="flex gap-1.5 flex-wrap">
              {mathItems.map((item: any, i: number) => (
                <span key={i} className="text-xs px-3 py-1 bg-theme-bg2 border border-theme-border rounded-md text-theme-text2 flex items-center gap-1.5 cursor-default hover:border-theme-accent hover:text-theme-text transition-colors">
                  {renderIcon(item.icon)} {item.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-9">
            <div className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.1em] mb-2.5">Experience & Education</div>
            <div className="flex flex-col">
              {experienceItems.map((item: any, i: number) => (
                <div key={`exp-${i}`} className="flex gap-4 py-4 border-b border-theme-border">
                  <span className="font-mono text-[11px] text-theme-accent min-w-[48px] pt-1">{item.year}</span>
                  <div>
                    <div className="text-[14px] font-semibold text-theme-text mb-1">{item.role}</div>
                    <div className="text-xs text-theme-text2">{item.desc}</div>
                  </div>
                </div>
              ))}
              {educationItems.map((item: any, i: number) => (
                <div key={`edu-${i}`} className="flex gap-4 py-4 border-b border-theme-border">
                  <span className="font-mono text-[11px] text-theme-accent min-w-[48px] pt-1">{item.year}</span>
                  <div>
                    <div className="text-[14px] font-semibold text-theme-text mb-1">{item.role}</div>
                    <div className="text-xs text-theme-text2">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
