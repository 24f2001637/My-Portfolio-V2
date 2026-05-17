import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { formatDate } from "../lib/utils";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [allProjectsCount, setAllProjectsCount] = useState(0);
  const [allBlogsCount, setAllBlogsCount] = useState(0);
  const [allResCount, setAllResCount] = useState(0);
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
      setAllProjectsCount(snap.docs.length);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 3));
    }, err => {
      handleFirestoreError(err, OperationType.LIST, "projects");
    });
    const unsubBlogs = onSnapshot(collection(db, "blogs"), (snap) => {
      setAllBlogsCount(snap.docs.length);
      setBlogs(snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 2));
    }, err => {
      handleFirestoreError(err, OperationType.LIST, "blogs");
    });
    const unsubRes = onSnapshot(collection(db, "resources"), (snap) => {
      setAllResCount(snap.docs.length);
    });
    const unsubConfig = onSnapshot(collection(db, "config"), (snap) => {
      if(!snap.empty) {
        setSiteConfig(snap.docs[0].data());
      }
    });

    return () => {
      unsubProjects();
      unsubBlogs();
      unsubRes();
      unsubConfig();
    }
  }, []);

  let currentlyItems = [];
  try {
    currentlyItems = siteConfig?.currentlyJSON ? JSON.parse(siteConfig.currentlyJSON) : [];
  } catch (e) {}
  if (!currentlyItems || currentlyItems.length === 0) {
    currentlyItems = [
      { icon: "Hammer", title: "Building", desc: "HMSCare — Hospital Mgmt System" },
      { icon: "BookOpen", title: "Studying", desc: "GenAI & Deep Learning @ IITM" },
      { icon: "MapPin", title: "Location", desc: "Varanasi, India" }
    ];
  }

  return (
    <>
      <Helmet>
        <title>Sahil Bind — Data Scientist, ML Engineer & Full-stack Developer</title>
        <meta name="description" content="Explore the portfolio of Sahil Bind, a Data Scientist and Developer specialized in AI, Machine Learning, and modern Web Technologies. Discover projects, writings, and resources." />
        <meta property="og:title" content="Sahil Bind — Data Scientist & Developer" />
        <meta property="og:description" content="Portfolio and insights on AI, Machine Learning, and Web Development by Sahil Bind." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sahil.bind" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sahil Bind — Data Scientist & Developer" />
        <meta name="twitter:description" content="Portfolio and insights on AI, Machine Learning, and Web Development by Sahil Bind." />
        <meta name="twitter:image" content="/og-image.png" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Hero */}
      <section className="min-h-screen flex flex-col relative pt-8 pb-16 lg:pt-12">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-12 xl:gap-8 mb-8">
          
          <div className="max-w-[700px] relative z-10 w-full xl:w-2/3">
            <div className="font-mono text-[11px] tracking-[0.12em] text-theme-accent uppercase mb-5 flex items-center gap-2 fade-up">
              <div className="w-6 h-px bg-theme-accent"></div>
              {siteConfig?.heroEyebrow || "sahil.dev — personal ecosystem"}
            </div>
            
            <div className="flex gap-1.5 flex-wrap mb-7 fade-up delay-75">
              {(siteConfig?.heroTags ? siteConfig.heroTags.split(',') : ["Mathematics", "Data Science", "AI / ML", "Web Development", "IIT Madras"]).map((tag: string) => (
                <span key={tag} className="font-mono text-[10px] px-2.5 py-[3px] rounded-full border border-theme-border text-theme-text2 bg-theme-card transition-colors duration-200 hover:border-theme-accent hover:text-theme-accent cursor-default">
                  {tag.trim()}
                </span>
              ))}
            </div>
            
            <h1 className="font-serif text-[clamp(44px,6vw,76px)] leading-[1.08] tracking-[-0.02em] text-theme-text mb-2 fade-up delay-150 relative">
              {siteConfig?.heroTitle ? siteConfig.heroTitle.split('\n').map((line: string, i: number) => (
                <span key={i}>{line}{i === 0 && <br/>}</span>
              )) : <>Building intelligent<br /> systems &amp; <em className="italic text-theme-accent">useful</em><br /> digital products.</>}
            </h1>
            
            <p className="text-[17px] text-theme-text2 max-w-[560px] leading-[1.65] mb-9 font-light fade-up delay-200 whitespace-pre-wrap">
              {siteConfig?.heroSub || "I'm Sahil Bind — a data science student at IIT Madras who builds things at the intersection of mathematics, AI, and software engineering."}
            </p>
            
            {siteConfig?.profileImage && (
              <div className="xl:hidden w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] bg-theme-bg2 border border-theme-border rounded-full shadow-theme-card overflow-hidden flex items-center justify-center relative group shrink-0 mb-8 fade-up delay-200 mx-auto">
                <img src={siteConfig.profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-full pointer-events-none"></div>
              </div>
            )}
            
            <div className="flex gap-2.5 flex-wrap mb-16 fade-up delay-300 justify-center xl:justify-start">
              <Link to="/projects" className="bg-theme-text text-theme-bg px-[22px] py-2.5 rounded-lg text-[13px] font-medium transition-transform duration-200 hover:-translate-y-px hover:opacity-85 flex items-center gap-1.5">
                View Projects <LucideIcons.ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/resources" className="bg-transparent text-theme-text px-[22px] py-2.5 rounded-lg text-[13px] font-medium border border-theme-border transition-all duration-200 hover:-translate-y-px hover:bg-theme-bg2 flex items-center gap-1.5">
                <LucideIcons.Book className="w-3.5 h-3.5" /> Browse Resources
              </Link>
              <Link to="/contact" className="bg-transparent text-theme-text px-[22px] py-2.5 rounded-lg text-[13px] font-medium border border-theme-border transition-all duration-200 hover:-translate-y-px hover:bg-theme-bg2 flex items-center gap-1.5">
                <LucideIcons.Mail className="w-3.5 h-3.5" /> Say Hello
              </Link>
            </div>
            
            <div className="flex w-full pt-8 border-t border-theme-border fade-up delay-500 max-w-[560px] justify-between sm:gap-x-8 mx-auto xl:mx-0">
              <div className="flex flex-col gap-0.5 items-center sm:items-start text-center sm:text-left">
                <span className="font-serif text-3xl text-theme-text leading-none">{allProjectsCount > 0 ? `${allProjectsCount}+` : "0"}</span>
                <span className="font-mono text-[10px] text-theme-text3 tracking-[0.08em] uppercase">Projects</span>
              </div>
              <div className="flex flex-col gap-0.5 items-center sm:items-start text-center sm:text-left">
                <span className="font-serif text-3xl text-theme-text leading-none">{allResCount > 0 ? `${allResCount}+` : "0"}</span>
                <span className="font-mono text-[10px] text-theme-text3 tracking-[0.08em] uppercase">Resources</span>
              </div>
              <div className="flex flex-col gap-0.5 items-center sm:items-start text-center sm:text-left">
                <span className="font-serif text-3xl text-theme-text leading-none">{allBlogsCount || "0"}</span>
                <span className="font-mono text-[10px] text-theme-text3 tracking-[0.08em] uppercase">Writings</span>
              </div>
              <div className="flex flex-col gap-0.5 items-center sm:items-start text-center sm:text-left">
                <span className="font-serif text-3xl text-theme-text leading-none">{siteConfig?.heroGpa || "3.8 GPA"}</span>
                <span className="font-mono text-[10px] text-theme-text3 tracking-[0.08em] uppercase">Academic</span>
              </div>
            </div>
          </div>
          
          <div className="flex xl:flex-col items-center xl:items-start gap-6 w-full xl:w-1/3 xl:pl-4 fade-up delay-500 xl:mt-16">
             {siteConfig?.profileImage && (
               <div className="hidden xl:flex w-[280px] h-[280px] bg-theme-bg2 border border-theme-border rounded-full shadow-theme-card overflow-hidden items-center justify-center relative group mx-auto xl:mx-0 shrink-0 mb-6">
                 <img src={siteConfig.profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                 <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-full pointer-events-none"></div>
               </div>
             )}
             
            {/* Playing / Now Card underneath image on desktop, side-by-side on tablet */}
            {currentlyItems.length > 0 && (
              <div className="bg-theme-card border border-theme-border rounded-3xl p-6 w-full max-w-[320px] shadow-theme-card flex-1 xl:flex-none">
                <div className="font-mono text-[9px] text-theme-text3 uppercase tracking-[0.1em] mb-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  {siteConfig?.heroCurrentlyHeading || "Now — Live"}
                </div>
                
                {currentlyItems.map((item: any, i: number) => (
                  <div key={i} className={`flex items-start gap-2.5 py-2 ${i !== currentlyItems.length - 1 ? 'border-b border-theme-border' : ''}`}>
                    <span className="mt-px flex items-center justify-center">
                      {item.icon === "🏗" || item.icon === "Building" ? <LucideIcons.Hammer size={16} className="text-theme-text mt-0.5" /> : 
                       item.icon === "📖" || item.icon === "Studying" ? <LucideIcons.BookOpen size={16} className="text-theme-text mt-0.5" /> :
                       item.icon === "🎯" || item.icon === "Location" ? <LucideIcons.MapPin size={16} className="text-theme-text mt-0.5" /> :
                         ((LucideIcons as any)[item.icon] ? 
                           (() => {
                             const IconComp = (LucideIcons as any)[item.icon];
                             return <IconComp size={16} className="text-theme-text mt-0.5" />;
                           })()
                           :
                           <span className="text-base leading-none">{item.icon}</span>)
                      }
                    </span>
                    <div className="text-xs text-theme-text2 leading-[1.4]">
                      <strong className="text-theme-text block text-[11px] font-medium">{item.title}</strong>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="flex items-baseline justify-between mb-10 pb-5 border-b border-theme-border">
          <div>
            <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">Selected Work</div>
            <h2 className="font-serif text-4xl tracking-[-0.02em] text-theme-text">Featured <em className="italic text-theme-accent">Projects</em></h2>
          </div>
          <Link to="/projects" className="text-xs text-theme-accent flex items-center gap-1 transition-all duration-200 hover:gap-2">
            View all projects <LucideIcons.ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {projects.length === 0 && <div className="col-span-full pt-8 text-theme-text2">No projects found. Check the Admin panel to add some.</div>}
          
          {projects.map((proj, i) => (
            <div key={proj.id} className={`${i === 0 ? 'col-span-1 md:col-span-2 flex-col sm:flex-row' : 'flex-col'} bg-theme-card border border-theme-border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-hover hover:border-theme-accent group flex`}>
              <div className={`${i === 0 ? 'h-48 sm:h-auto sm:w-1/2 border-b sm:border-b-0 sm:border-r' : 'h-40 border-b'} bg-theme-bg2 flex items-center justify-center text-4xl border-theme-border relative overflow-hidden shrink-0`}>
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
                  {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-[11px] px-2.5 py-1 rounded-md cursor-pointer border border-theme-border bg-theme-bg2 text-theme-text2 transition-colors duration-200 hover:border-theme-accent hover:text-theme-accent flex items-center gap-1"><LucideIcons.Github size={12}/> GitHub</a>}
                  {proj.demoLink && <a href={proj.demoLink} target="_blank" rel="noreferrer" className="text-[11px] px-2.5 py-1 rounded-md cursor-pointer border border-theme-border bg-theme-bg2 text-theme-text2 transition-colors duration-200 hover:border-theme-accent hover:text-theme-accent flex items-center gap-1"><LucideIcons.ExternalLink size={12}/> Demo</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Expertise & Skills */}
      <section className="py-20 border-t border-theme-border">
        <div className="flex items-baseline justify-between mb-10 pb-5 border-b border-theme-border">
          <div>
            <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">What I do</div>
            <h2 className="font-serif text-4xl tracking-[-0.02em] text-theme-text">Expertise & <em className="italic text-theme-accent">Skills</em></h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-theme-card border border-theme-border rounded-3xl p-8 hover:border-theme-accent transition-colors duration-300">
            <LucideIcons.Brain className="w-8 h-8 text-theme-accent mb-6" />
            <h3 className="font-serif text-xl text-theme-text mb-3">AI & Machine Learning</h3>
            <p className="text-sm text-theme-text2 mb-6 leading-relaxed">
              Building intelligent systems using deep learning, NLP, and computer vision. From predictive modeling to generative AI applications.
            </p>
            <div className="flex flex-wrap gap-2">
              {['PyTorch', 'TensorFlow', 'Scikit-Learn', 'LLMs', 'OpenCV'].map(skill => (
                <span key={skill} className="font-mono text-[9px] px-2 py-1 rounded border border-theme-border bg-theme-bg2 text-theme-text3">{skill}</span>
              ))}
            </div>
          </div>
          
          <div className="bg-theme-card border border-theme-border rounded-3xl p-8 hover:border-theme-accent transition-colors duration-300">
            <LucideIcons.Database className="w-8 h-8 text-theme-accent mb-6" />
            <h3 className="font-serif text-xl text-theme-text mb-3">Data Science</h3>
            <p className="text-sm text-theme-text2 mb-6 leading-relaxed">
              Extracting actionable insights from complex datasets. Expertise in statistical analysis, data visualization, and pipeline engineering.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Python', 'Pandas', 'SQL', 'Tableau', 'Spark'].map(skill => (
                <span key={skill} className="font-mono text-[9px] px-2 py-1 rounded border border-theme-border bg-theme-bg2 text-theme-text3">{skill}</span>
              ))}
            </div>
          </div>
          
          <div className="bg-theme-card border border-theme-border rounded-3xl p-8 hover:border-theme-accent transition-colors duration-300">
            <LucideIcons.Code2 className="w-8 h-8 text-theme-accent mb-6" />
            <h3 className="font-serif text-xl text-theme-text mb-3">Full-Stack Dev</h3>
            <p className="text-sm text-theme-text2 mb-6 leading-relaxed">
              Developing scalable web applications and robust APIs. Creating seamless user experiences combined with powerful backend architecture.
            </p>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS'].map(skill => (
                <span key={skill} className="font-mono text-[9px] px-2 py-1 rounded border border-theme-border bg-theme-bg2 text-theme-text3">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Education */}
      <section className="py-20 border-t border-theme-border">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          <div className="w-full md:w-1/2">
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-theme-border">
              <div>
                <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">Career</div>
                <h2 className="font-serif text-3xl tracking-[-0.02em] text-theme-text">Experience</h2>
              </div>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-theme-accent group-hover:scale-125 transition-transform duration-300"></div>
                  <div className="w-px h-full bg-theme-border mt-2"></div>
                </div>
                <div className="pb-2">
                  <div className="font-mono text-[10px] text-theme-accent mb-1">2023 — Present</div>
                  <h4 className="font-serif text-lg text-theme-text">Freelance Full-Stack Developer</h4>
                  <div className="text-sm text-theme-text2 mb-2">Self-employed</div>
                  <p className="text-xs text-theme-text3 leading-relaxed">
                    Building custom web applications, delivering intuitive UIs, and robust backends for various clients. Focusing on scalable architectures and AI integrations.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-theme-bg2 border border-theme-border group-hover:border-theme-accent transition-colors duration-300"></div>
                  <div className="w-px h-full bg-theme-border mt-2"></div>
                </div>
                <div className="pb-2">
                  <div className="font-mono text-[10px] text-theme-text3 mb-1">2022 — 2023</div>
                  <h4 className="font-serif text-lg text-theme-text">Data Science Intern</h4>
                  <div className="text-sm text-theme-text2 mb-2">Tech Startup</div>
                  <p className="text-xs text-theme-text3 leading-relaxed">
                    Developed predictive models and data visualization dashboards. Assisted in data cleaning, exploratory data analysis, and deploying ML models to production.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-theme-border">
              <div>
                <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">Academic</div>
                <h2 className="font-serif text-3xl tracking-[-0.02em] text-theme-text">Education</h2>
              </div>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-theme-accent group-hover:scale-125 transition-transform duration-300"></div>
                  <div className="w-px h-full bg-theme-border mt-2"></div>
                </div>
                <div className="pb-2">
                  <div className="font-mono text-[10px] text-theme-accent mb-1">2021 — 2025</div>
                  <h4 className="font-serif text-lg text-theme-text">BS in Data Science and Applications</h4>
                  <div className="text-sm text-theme-text2 mb-2">IIT Madras</div>
                  <p className="text-xs text-theme-text3 leading-relaxed">
                    Comprehensive study of Mathematics, Statistics, Machine Learning, and Software Development. Consistently maintaining a strong GPA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Writings */}
      <section className="py-20 border-t border-theme-border">
        <div className="flex items-baseline justify-between mb-10 pb-5 border-b border-theme-border">
          <div>
            <div className="font-mono text-[10px] text-theme-text3 tracking-[0.1em] uppercase">From the blog</div>
            <h2 className="font-serif text-4xl tracking-[-0.02em] text-theme-text">Latest <em className="italic text-theme-accent">Writings</em></h2>
          </div>
          <Link to="/blogs" className="text-xs text-theme-accent flex items-center gap-1 transition-all duration-200 hover:gap-2">
            All writings <LucideIcons.ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogs.length === 0 && <div className="col-span-full pt-8 text-theme-text2">No blogs found. Check the Admin panel to add some.</div>}
          
          {blogs.map((blog) => (
            <Link to={`/blogs/${blog.id}`} key={blog.id} className="bg-theme-card border border-theme-border rounded-3xl p-8 cursor-pointer transition-all duration-300 shadow-theme-card hover:-translate-y-1 hover:shadow-theme-hover hover:border-theme-accent flex flex-col md:flex-row gap-6 items-center group decoration-transparent">
              <div className="h-48 w-full md:w-1/2 bg-theme-bg2 rounded-lg border border-theme-border flex items-center justify-center text-5xl overflow-hidden">
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{blog.icon}</span>
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
                  <span className="text-[11px] text-theme-accent flex items-center gap-1 group-hover:gap-2 transition-all">Read <LucideIcons.ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
