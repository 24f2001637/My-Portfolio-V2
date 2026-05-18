import { useEffect, useState, FormEvent, useMemo } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { compressImage } from "../lib/utils";
import { Helmet } from "react-helmet-async";

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setField: (v: string) => void) => {
  if (e.target.files && e.target.files[0]) {
    try {
      toast.info("Compressing and uploading image...");
      const base64 = await compressImage(e.target.files[0]);
      setField(base64);
      toast.success("Image attached! Remember to save.");
    } catch (err) {
      toast.error("Failed to process image");
    }
  }
};

function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoadingConfig(false);
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loadingConfig) return <div className="p-12 text-center text-theme-text">Loading admin portal...</div>;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 md:px-12 pt-8 pb-20">
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-theme-card text-center">
          <h2 className="font-serif text-3xl mb-4 text-theme-text">Admin Login</h2>
          <p className="text-sm text-theme-text2 mb-6">Restricted area. Please sign in to manage portfolio content.</p>
          <button 
            onClick={handleLogin}
            className="px-6 py-2.5 bg-theme-text text-theme-bg rounded-lg font-medium hover:opacity-85 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (user.email !== "the.sahilbind@gmail.com") {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 md:px-12 pt-8 pb-20">
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-theme-card text-center">
          <h2 className="font-serif text-3xl mb-4 text-theme-text text-red-500">Access Denied</h2>
          <p className="text-sm text-theme-text2 mb-6">You do not have permission to access the admin dashboard.</p>
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 bg-theme-text text-theme-bg rounded-lg font-medium hover:opacity-85 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "resources", label: "Resources" },
    { id: "blogs", label: "Writings" },
    { id: "contact", label: "Contact" },
    { id: "messages", label: "Messages" },
  ];

  // Admin Dashboard
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Sahil Bind</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 pb-20 overflow-x-hidden w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-theme-border pb-6 gap-4 w-full">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-theme-text tracking-[-0.02em]">Admin Dashboard</h1>
          <p className="text-theme-text2 text-sm mt-2">Logged in as {user.email}</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 border border-theme-border rounded-lg text-theme-text text-sm hover:bg-theme-bg2 transition">
          Sign out
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-theme-border scrollbar-hide">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-theme-text text-theme-bg" : "bg-transparent text-theme-text2 hover:bg-theme-bg2 hover:text-theme-text"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-12">
        {["home", "about"].includes(activeTab) && <ConfigAdmin activeGroup={activeTab} />}
        {activeTab === "contact" && <ConfigAdmin activeGroup={activeTab} />}
        
        {activeTab === "messages" && <MessageAdmin />}
        {activeTab === "resources" && <ResourceAdmin />}
        {activeTab === "blogs" && <BlogAdmin />}
        {activeTab === "projects" && <ProjectAdmin />}
      </div>
    </div>
    </>
  );
}

// Components will follow for managing categories

export default Admin;

function ConfigAdmin({ activeGroup }: { activeGroup: string }) {
  const [config, setConfig] = useState<any>(null);
  const [profileImage, setProfileImage] = useState("");
  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroTags, setHeroTags] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroTitleHighlight, setHeroTitleHighlight] = useState("");
  const [heroSub, setHeroSub] = useState("");
  const [heroGpa, setHeroGpa] = useState("");
  const [heroCurrentlyHeading, setHeroCurrentlyHeading] = useState("");
  const [currentlyJSON, setCurrentlyJSON] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [aboutBio, setAboutBio] = useState("");
  const [statsJSON, setStatsJSON] = useState("");
  const [contactText, setContactText] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [socialsJSON, setSocialsJSON] = useState("");
  const [languagesJSON, setLanguagesJSON] = useState("");
  const [frameworksJSON, setFrameworksJSON] = useState("");
  const [mathJSON, setMathJSON] = useState("");
  const [experienceJSON, setExperienceJSON] = useState("");
  const [educationJSON, setEducationJSON] = useState("");
  const [expertiseJSON, setExpertiseJSON] = useState("");
  const [sidebarName, setSidebarName] = useState("");
  const [sidebarSubtitle, setSidebarSubtitle] = useState("");
  const [certificationsJSON, setCertificationsJSON] = useState("");

  const loadConfig = async () => {
    try {
      const qs = await getDocs(collection(db, "config"));
      if (!qs.empty) {
        const c = qs.docs[0].data();
        setConfig({ id: qs.docs[0].id, ...c });
        setProfileImage(c.profileImage || "");
        setHeroEyebrow(c.heroEyebrow || "");
        setHeroTags(c.heroTags || "");
        setHeroTitle(c.heroTitle || "");
        setHeroTitleHighlight(c.heroTitleHighlight || "");
        setHeroSub(c.heroSub || "");
        setHeroGpa(c.heroGpa || "3.8 GPA");
        setHeroCurrentlyHeading(c.heroCurrentlyHeading || "Now — Live");
        setCurrentlyJSON(c.currentlyJSON || "");
        setAboutText(c.aboutText || "");
        setAboutBio(c.aboutBio || "");
        setStatsJSON(c.statsJSON || "");
        setContactText(c.contactText || "");
        setResumeLink(c.resumeLink || "");
        setSocialsJSON(c.socialsJSON || "");
        setLanguagesJSON(c.languagesJSON || "");
        setFrameworksJSON(c.frameworksJSON || "");
        setMathJSON(c.mathJSON || "");
        setExperienceJSON(c.experienceJSON || "");
        setEducationJSON(c.educationJSON || "");
        setExpertiseJSON(c.expertiseJSON || "");
        setSidebarName(c.sidebarName || "");
        setSidebarSubtitle(c.sidebarSubtitle || "");
        setCertificationsJSON(c.certificationsJSON || "");
      } else {
        // Defaults
        const def = {
          heroEyebrow: "Available for opportunities",
          heroTags: "IIT Madras'28, INSPIRE SHE Scholar, BSc Mathematics, Open to Internships",
          heroTitle: "Sahil Bind —\n& Developer.",
          heroTitleHighlight: "Data Scientist",
          heroSub: "I'm Sahil Bind — a data science student at IIT Madras who builds things at the intersection of mathematics, AI, and software engineering.",
          heroGpa: "3.8 GPA",
          heroCurrentlyHeading: "Now — Live",
          currentlyJSON: "[\n  { \"icon\": \"Hammer\", \"title\": \"Building\", \"desc\": \"HMSCare — Hospital Mgmt System\" },\n  { \"icon\": \"BookOpen\", \"title\": \"Studying\", \"desc\": \"GenAI & Deep Learning @ IITM\" },\n  { \"icon\": \"MapPin\", \"title\": \"Location\", \"desc\": \"Varanasi, India\" }\n]",
          aboutText: "",
          aboutBio: "Data Scientist & Developer building at the intersection of AI, mathematics, and clean code. INSPIRE SHE Scholar. Passionate about making complex ideas accessible.",
          statsJSON: "[]",
          profileImage: "",
          contactText: "I'm always open to interesting conversations, collaboration opportunities, internships, or just a good chat about math and AI. Don't hesitate to reach out.",
          resumeLink: "",
          socialsJSON: "[\n  { \"icon\": \"Mail\", \"label\": \"Email\", \"val\": \"sahilbind.iitm@gmail.com\", \"href\": \"mailto:sahilbind.iitm@gmail.com\" },\n  { \"icon\": \"Github\", \"label\": \"GitHub\", \"val\": \"github.com/24f2001637\", \"href\": \"https://github.com/24f2001637\" },\n  { \"icon\": \"Linkedin\", \"label\": \"LinkedIn\", \"val\": \"linkedin.com/in/sahilbind-24f2001637\", \"href\": \"https://www.linkedin.com/in/sahilbind-24f2001637\" },\n  { \"icon\": \"Twitter\", \"label\": \"Twitter\", \"val\": \"@SAHIL13IND\", \"href\": \"https://twitter.com/SAHIL13IND\" },\n  { \"icon\": \"Instagram\", \"label\": \"Instagram\", \"val\": \"@sahilb.ind\", \"href\": \"https://www.instagram.com/sahilb.ind/\" }\n]",
          languagesJSON: "[\n  { \"icon\": \"Code\", \"name\": \"Python\" },\n  { \"icon\": \"FileJson\", \"name\": \"JavaScript\" },\n  { \"icon\": \"Database\", \"name\": \"SQL\" }\n]",
          frameworksJSON: "[\n  { \"icon\": \"Wrench\", \"name\": \"Flask\" },\n  { \"icon\": \"LayoutTemplate\", \"name\": \"Vue.js\" },\n  { \"icon\": \"Flame\", \"name\": \"PyTorch\" }\n]",
          mathJSON: "[\n  { \"icon\": \"Calculator\", \"name\": \"Calculus\" },\n  { \"icon\": \"Grid3X3\", \"name\": \"Linear Algebra\" }\n]",
          experienceJSON: "[\n  { \"year\": \"2025\", \"role\": \"Campus Partner · Perplexity AI\", \"desc\": \"Introduced AI tools to the university community, supporting research workflows.\" },\n  { \"year\": \"2025\", \"role\": \"Subject Matter Expert · Chegg Inc.\", \"desc\": \"Helped students with subject-specific queries, teaching and explaining complex concepts.\" }\n]",
          educationJSON: "[\n  { \"year\": \"2024\", \"role\": \"IIT Madras — BS Data Science & Applications\", \"desc\": \"Concurrently pursuing BSc. Mathematics at DDU Gorakhpur University\" }\n]",
          expertiseJSON: "[\n  { \"icon\": \"Brain\", \"title\": \"AI & Machine Learning\", \"desc\": \"Building intelligent systems using deep learning, NLP, and computer vision. From predictive modeling to generative AI applications.\", \"skills\": [\"PyTorch\", \"TensorFlow\", \"Scikit-Learn\", \"LLMs\", \"OpenCV\"] },\n  { \"icon\": \"Database\", \"title\": \"Data Science\", \"desc\": \"Extracting actionable insights from complex datasets. Expertise in statistical analysis, data visualization, and pipeline engineering.\", \"skills\": [\"Python\", \"Pandas\", \"SQL\", \"Tableau\", \"Spark\"] },\n  { \"icon\": \"Code2\", \"title\": \"Full-Stack Dev\", \"desc\": \"Developing scalable web applications and robust APIs. Creating seamless user experiences combined with powerful backend architecture.\", \"skills\": [\"React\", \"TypeScript\", \"Node.js\", \"Next.js\", \"Tailwind CSS\"] }\n]",
          sidebarName: "Sahil",
          sidebarSubtitle: "@sahilbind · IIT Madras'28",
          certificationsJSON: "[\n  { \"year\": \"2023\", \"role\": \"DeepLearning.AI\", \"desc\": \"Neural Networks and Deep Learning\" }\n]"
        };
        setConfig(def);
        setProfileImage(def.profileImage);
        setHeroEyebrow(def.heroEyebrow);
        setHeroTags(def.heroTags);
        setHeroTitle(def.heroTitle);
        setHeroTitleHighlight(def.heroTitleHighlight);
        setHeroSub(def.heroSub);
        setHeroGpa(def.heroGpa);
        setHeroCurrentlyHeading(def.heroCurrentlyHeading);
        setCurrentlyJSON(def.currentlyJSON);
        setAboutText(def.aboutText);
        setAboutBio(def.aboutBio);
        setStatsJSON(def.statsJSON);
        setContactText(def.contactText);
        setResumeLink(def.resumeLink);
        setSocialsJSON(def.socialsJSON);
        setLanguagesJSON(def.languagesJSON);
        setFrameworksJSON(def.frameworksJSON);
        setMathJSON(def.mathJSON);
        setExperienceJSON(def.experienceJSON);
        setEducationJSON(def.educationJSON);
        setExpertiseJSON(def.expertiseJSON);
        setSidebarName(def.sidebarName);
        setSidebarSubtitle(def.sidebarSubtitle);
        setCertificationsJSON(def.certificationsJSON);
      }
    } catch(err) {
      handleFirestoreError(err, OperationType.LIST, "config");
    }
  };

  useEffect(() => { loadConfig(); }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        profileImage, heroEyebrow, heroTags, heroTitle, heroTitleHighlight, heroSub, heroGpa, heroCurrentlyHeading, currentlyJSON, aboutText, aboutBio, statsJSON, contactText, resumeLink, socialsJSON,
        languagesJSON, frameworksJSON, mathJSON, experienceJSON, educationJSON, expertiseJSON, sidebarName, sidebarSubtitle, certificationsJSON
      };
      if (config?.id) {
        await setDoc(doc(db, "config", config.id), data);
      } else {
        await setDoc(doc(db, "config", "main"), data);
      }
      toast.success("Config saved!");
    } catch(err) {
      toast.error("Error saving config");
      handleFirestoreError(err, OperationType.WRITE, "config/main");
    }
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-4 sm:p-8 overflow-hidden w-full mb-8">
      <h2 className="font-serif text-2xl text-theme-text mb-6">
        {activeGroup === 'home' && "Home Page Configuration"}
        {activeGroup === 'about' && "About Page Configuration"}
        {activeGroup === 'contact' && "Contact Page Configuration"}
      </h2>
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeGroup === 'about' && (
          <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">Profile Image URL</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={profileImage} onChange={e=>setProfileImage(e.target.value)} placeholder="Profile Image URL" className="flex-1 p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              <label className="cursor-pointer px-4 py-2 bg-theme-bg border border-theme-border rounded text-sm text-theme-text flex items-center justify-center shrink-0 hover:bg-theme-bg2 transition-colors">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setProfileImage)} />
              </label>
            </div>
          </label>
        )}
        
        {activeGroup === 'home' && (
          <div className="flex flex-col gap-2 md:col-span-2">
            <Accordion title="Profile & Resume" defaultOpen>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Profile Image URL</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input value={profileImage} onChange={e=>setProfileImage(e.target.value)} placeholder="Profile Image URL" className="flex-1 p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
                  <label className="cursor-pointer px-4 py-2 bg-theme-bg border border-theme-border rounded text-sm text-theme-text flex items-center justify-center shrink-0 hover:bg-theme-bg2 transition-colors">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setProfileImage)} />
                  </label>
                </div>
              </label>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Resume Link (PDF URL)</span>
                <input value={resumeLink} onChange={e=>setResumeLink(e.target.value)} placeholder="https://..." className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
            </Accordion>

            <Accordion title="Hero Section Basic Info">
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Hero Eyebrow</span>
                <input required value={heroEyebrow} onChange={e=>setHeroEyebrow(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Hero Tags (comma separated)</span>
                <input required value={heroTags} onChange={e=>setHeroTags(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Hero Title</span>
                <input required value={heroTitle} onChange={e=>setHeroTitle(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Hero Title Highlight</span>
                <input required value={heroTitleHighlight} onChange={e=>setHeroTitleHighlight(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">Hero Subtitle</span>
                <textarea required value={heroSub} onChange={e=>setHeroSub(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[60px]" />
              </label>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">GPA Text</span>
                <input required value={heroGpa} onChange={e=>setHeroGpa(e.target.value)} placeholder="3.8 GPA" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
            </Accordion>

            <Accordion title='"Now — Live" Status'>
              <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">"Now — Live" Heading</span>
                <input required value={heroCurrentlyHeading} onChange={e=>setHeroCurrentlyHeading(e.target.value)} placeholder="Now — Live" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
              <div className="md:col-span-2 mt-2">
                <JSONListBuilder
                  title='"Now — Live" Items'
                  jsonStr={currentlyJSON}
                  onChange={setCurrentlyJSON}
                  defaultNewItem={{ icon: "", title: "", desc: "" }}
                  fields={[
                    { key: 'icon', label: 'Icon (e.g. Hammer, BookOpen)' },
                    { key: 'title', label: 'Title (e.g. Building)' },
                    { key: 'desc', label: 'Description', type: 'textarea' }
                  ]}
                />
              </div>
            </Accordion>

            <Accordion title="Expertise & Skills">
              <div className="md:col-span-2">
                <JSONListBuilder
                  title='Expertise & Skills Cards'
                  jsonStr={expertiseJSON}
                  onChange={setExpertiseJSON}
                  defaultNewItem={{ icon: "", title: "", desc: "", skills: [] }}
                  fields={[
                    { key: 'icon', label: 'Icon (e.g. Brain, Code2)' },
                    { key: 'title', label: 'Title (e.g. AI & Machine Learning)' },
                    { key: 'skills', label: 'Skills (comma separated, e.g. Python, SQL)', isList: true },
                    { key: 'desc', label: 'Description', type: 'textarea' }
                  ]}
                />
              </div>
            </Accordion>

          </div>
        )}

        {activeGroup === 'about' && (
          <div className="flex flex-col gap-2 md:col-span-2">
            <Accordion title="Sidebar Profile" defaultOpen>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Sidebar Name</span>
                <input required value={sidebarName} onChange={e=>setSidebarName(e.target.value)} placeholder="e.g. Sahil" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
              <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">Sidebar Subtitle</span>
                <input required value={sidebarSubtitle} onChange={e=>setSidebarSubtitle(e.target.value)} placeholder="e.g. @sahilbind · IIT Madras'28" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
              <div className="md:col-span-2 mt-2">
                <JSONListBuilder
                  title='Sidebar Stats'
                  jsonStr={statsJSON}
                  onChange={setStatsJSON}
                  defaultNewItem={{ label: "", val: "" }}
                  fields={[
                    { key: 'label', label: 'Label (e.g. Location)' },
                    { key: 'val', label: 'Value (e.g. Varanasi, UP)' }
                  ]}
                />
              </div>
            </Accordion>

            <Accordion title="About Text & Bio">
              <label className="flex flex-col gap-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text2">About Text (Markdown supported)</span>
                </div>
                <MarkdownToolbar value={aboutText} onChange={setAboutText} />
                <textarea required value={aboutText} onChange={e=>setAboutText(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[160px]" />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2 mt-4">
                <span className="text-sm text-theme-text2">About Bio</span>
                <MarkdownToolbar value={aboutBio} onChange={setAboutBio} />
                <textarea required value={aboutBio} onChange={e=>setAboutBio(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[80px]" />
              </label>
            </Accordion>

            <Accordion title="Skills & Tools">
              <div className="md:col-span-2 flex flex-col gap-4">
                <JSONListBuilder
                  title='Languages'
                  jsonStr={languagesJSON}
                  onChange={setLanguagesJSON}
                  defaultNewItem={{ icon: "", name: "" }}
                  fields={[
                    { key: 'icon', label: 'Icon (e.g. Code, Database)' },
                    { key: 'name', label: 'Name (e.g. Python, SQL)' }
                  ]}
                />
                <JSONListBuilder
                  title='Frameworks & Tools'
                  jsonStr={frameworksJSON}
                  onChange={setFrameworksJSON}
                  defaultNewItem={{ icon: "", name: "" }}
                  fields={[
                    { key: 'icon', label: 'Icon (e.g. Wrench, Flame)' },
                    { key: 'name', label: 'Name (e.g. PyTorch, React)' }
                  ]}
                />
                <JSONListBuilder
                  title='Mathematics'
                  jsonStr={mathJSON}
                  onChange={setMathJSON}
                  defaultNewItem={{ icon: "", name: "" }}
                  fields={[
                    { key: 'icon', label: 'Icon (e.g. Calculator)' },
                    { key: 'name', label: 'Name (e.g. Linear Algebra)' }
                  ]}
                />
              </div>
            </Accordion>

            <Accordion title="Career & Education">
              <div className="md:col-span-2 flex flex-col gap-4">
                <JSONListBuilder
                  title='Experience'
                  jsonStr={experienceJSON}
                  onChange={setExperienceJSON}
                  defaultNewItem={{ year: "", role: "", company: "", desc: "" }}
                  fields={[
                    { key: 'year', label: 'Year (e.g. 2023 - Present)' },
                    { key: 'role', label: 'Role (e.g. Data Science Intern)' },
                    { key: 'company', label: 'Company (optional)' },
                    { key: 'desc', label: 'Description', type: 'textarea' }
                  ]}
                />
                <JSONListBuilder
                  title='Education'
                  jsonStr={educationJSON}
                  onChange={setEducationJSON}
                  defaultNewItem={{ year: "", role: "", institution: "", desc: "" }}
                  fields={[
                    { key: 'year', label: 'Year (e.g. 2021 - 2025)' },
                    { key: 'role', label: 'Degree (e.g. BS Data Science)' },
                    { key: 'institution', label: 'Institution (optional)' },
                    { key: 'desc', label: 'Description', type: 'textarea' }
                  ]}
                />
                <JSONListBuilder
                  title='Certifications & Awards'
                  jsonStr={certificationsJSON}
                  onChange={setCertificationsJSON}
                  defaultNewItem={{ year: "", role: "", desc: "" }}
                  fields={[
                    { key: 'year', label: 'Year (e.g. 2023)' },
                    { key: 'role', label: 'Award/Cert Name (e.g. DeepLearning.AI)' },
                    { key: 'desc', label: 'Description', type: 'textarea' }
                  ]}
                />
              </div>
            </Accordion>
          </div>
        )}

        {activeGroup === 'contact' && (
          <div className="flex flex-col gap-2 md:col-span-2">
            <Accordion title="Contact Information" defaultOpen>
              <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">Contact Text</span>
                <textarea required value={contactText} onChange={e=>setContactText(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[60px]" />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">Resume Link (PDF URL)</span>
                <input value={resumeLink} onChange={e=>setResumeLink(e.target.value)} placeholder="https://..." className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
              </label>
            </Accordion>

            <Accordion title="Social Links">
              <div className="md:col-span-2">
                <JSONListBuilder
                  title='Social Links'
                  jsonStr={socialsJSON}
                  onChange={setSocialsJSON}
                  defaultNewItem={{ icon: "", label: "", val: "", href: "" }}
                  fields={[
                    { key: 'icon', label: 'Icon (e.g. Github, Linkedin, Mail)' },
                    { key: 'label', label: 'Platform (e.g. GitHub)' },
                    { key: 'val', label: 'Display Value (e.g. @sahilbind)' },
                    { key: 'href', label: 'Link URL (e.g. https://...)' }
                  ]}
                />
              </div>
            </Accordion>
          </div>
        )}

        <button type="submit" className="md:col-span-2 p-2 bg-theme-text text-theme-bg rounded">Save Config</button>
      </form>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  return (
    <details className="group border border-theme-border rounded-lg bg-theme-bg/30 mb-4" open={defaultOpen}>
      <summary className="p-4 font-serif text-lg text-theme-text cursor-pointer select-none outline-none group-open:border-b border-theme-border flex justify-between items-center hover:bg-theme-bg2 transition-colors rounded-lg group-open:rounded-b-none">
        {title}
        <span className="text-sm font-mono text-theme-text3 group-open:rotate-180 transition-transform duration-300">▼</span>
      </summary>
      <div className="p-4 flex flex-col gap-4">
        {children}
      </div>
    </details>
  );
}

function MarkdownToolbar({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const insert = (syntax: string) => {
    onChange(value + (value.length > 0 && !value.endsWith('\n') ? '\n' : '') + syntax);
  };
  return (
    <div className="flex gap-1 mb-1.5 bg-theme-bg/50 border border-theme-border rounded border-b-2 border-b-theme-border p-1 w-max">
      <button type="button" onClick={()=>insert('**Bold**')} className="px-2 py-0.5 text-[11px] font-bold text-theme-text hover:bg-theme-bg2 rounded transition-colors" title="Bold">B</button>
      <button type="button" onClick={()=>insert('*Italic*')} className="px-2 py-0.5 text-[11px] italic text-theme-text hover:bg-theme-bg2 rounded transition-colors" title="Italic">I</button>
      <button type="button" onClick={()=>insert('## Heading')} className="px-2 py-0.5 text-[11px] text-theme-text hover:bg-theme-bg2 rounded transition-colors" title="Heading">H2</button>
      <button type="button" onClick={()=>insert('[Link Text](https://)')} className="px-2 py-0.5 text-[11px] text-theme-text hover:bg-theme-bg2 rounded transition-colors" title="Link">Link</button>
      <button type="button" onClick={()=>insert('- List Item')} className="px-2 py-0.5 text-[11px] text-theme-text hover:bg-theme-bg2 rounded transition-colors" title="Bullet List">• List</button>
      <button type="button" onClick={()=>insert('```\nCode Block\n```')} className="px-2 py-0.5 text-[11px] font-mono text-theme-text hover:bg-theme-bg2 rounded transition-colors" title="Code Block">Code</button>
      <button type="button" onClick={()=>insert('> Blockquote')} className="px-2 py-0.5 text-[11px] text-theme-text hover:bg-theme-bg2 rounded transition-colors" title="Quote">Quote</button>
    </div>
  );
}

import * as LucideIcons from "lucide-react";

const COMMON_ICONS = [
  // Existing
  "Brain", "Database", "Code2", "Hammer", "BookOpen", "MapPin", "Award", "Calculator", "Grid3X3",
  "Code", "FileJson", "LayoutTemplate", "Flame", "Wrench", "Mail", "Github", "Linkedin", "Twitter",
  "ArrowRight", "ExternalLink", "Quote", "MessageSquareQuote", "Terminal", "Cpu", "Globe", "Briefcase", "User",
  "Rocket", "Heart", "Star", "Zap", "Shield", "Palette", "Camera", "Music", "Monitor", "Smartphone",
  "Server", "Cloud", "Lock", "Eye", "Pen", "FileText", "Folder", "Download", "Upload", "RefreshCw",
  
  // UI Additions
  "Search", "Home", "Settings", "Tool", "PenTool", "Laptop", "Tablet", "Coffee", "Compass", "Map",
  "Navigation", "Flag", "Check", "CheckCircle", "XCircle", "AlertCircle", "Info", "HelpCircle",
  "Phone", "MessageCircle", "Send", "Inbox", "Book", "Bookmark", "Tag", "Archive", "UserPlus", "Users",
  "Calendar", "Clock", "ThumbsUp", "TrendingUp", "Activity", "Target", "Crosshair", "Wifi", "Battery",
  "Sun", "Moon", "CloudLightning", "Droplet", "Wind", "Umbrella", "Layers", "Box", "Grid", "List",
  "Link", "Link2", "File", "Files", "FolderPlus", "FolderMinus", "Save", "Trash", "Trash2", "Edit",
  "Edit2", "Edit3", "Scissors", "Copy", "Clipboard", "Paperclip", "Maximize", "Minimize", "ZoomIn",
  "ZoomOut", "Plus", "Minus", "ArrowUp", "ArrowDown", "ArrowLeft", "ChevronUp", "ChevronDown",
  "ChevronLeft", "ChevronRight", "Menu", "MoreHorizontal", "MoreVertical", "HardDrive", "Mouse",
  "Keyboard", "Printer", "Tv", "Watch", "Bluetooth", "Speaker", "Image", "Video", "Mic", "Play",
  
  // Tech, Social, & Developer specific
  "Instagram", "Youtube", "Twitch", "Figma", "Framer", "Slack", "Trello", "Codepen", "Gitlab", "Bitbucket", 
  "Chrome", "Safari", "Apple", "Android", "Command", "Binary", "CircuitBoard", "Network", "Webhook", 
  "Blocks", "Brackets", "Bug", "FileCode", "Router", "Usb", "Key", "Unlock", "Fingerprint", "Scan", "QrCode", 
  "Bot", "Microscope", "Beaker", "FlaskConical", "Magnet", "Atom", "BrainCircuit", "Regex", "Variable"
];

function IconPicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const filtered = COMMON_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()));
  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 text-xs flex items-center gap-2 hover:bg-theme-bg transition-colors"
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon size={14} className="text-theme-accent shrink-0" />
            <span>{value}</span>
          </>
        ) : (
          <span className="text-theme-text3">Pick an icon...</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-[280px] max-h-[260px] bg-theme-card border border-theme-border rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="p-2 border-b border-theme-border">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="w-full p-1.5 rounded border border-theme-border text-theme-text bg-theme-bg2 text-xs placeholder:text-theme-text3/50 outline-none"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-6 gap-1 p-2 overflow-y-auto">
            {filtered.map(name => {
              const Icon = (LucideIcons as any)[name];
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                  className={`w-full aspect-square rounded flex items-center justify-center transition-colors ${value === name ? 'bg-theme-accent text-theme-bg' : 'hover:bg-theme-bg2 text-theme-text2 hover:text-theme-text'}`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
            {filtered.length === 0 && <div className="col-span-6 text-xs text-theme-text3 text-center py-2">No icons found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

type FieldDef = { key: string; label: string; placeholder?: string; type?: 'textarea'; isList?: boolean };

function JSONListBuilder({
  title,
  jsonStr,
  onChange,
  fields,
  defaultNewItem
}: {
  title: string;
  jsonStr: string;
  onChange: (val: string) => void;
  fields: FieldDef[];
  defaultNewItem: any;
}) {
  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [jsonStr]);

  const [newItem, setNewItem] = useState<any>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    const itemToEdit = items[index];
    const formattedItem = { ...itemToEdit };
    for (const f of fields) {
      if (f.isList && Array.isArray(formattedItem[f.key])) {
        formattedItem[f.key] = formattedItem[f.key].join(", ");
      }
    }
    setNewItem(formattedItem);
    setEditingIndex(index);
  };

  const handleAdd = () => {
    const parsedItem = { ...defaultNewItem };
    for (const f of fields) {
      if (f.isList) {
         parsedItem[f.key] = (newItem[f.key] || "").split(',').map((s:string) => s.trim()).filter(Boolean);
      } else {
         parsedItem[f.key] = newItem[f.key] || "";
      }
    }
    let updated;
    if (editingIndex !== null) {
      updated = [...items];
      updated[editingIndex] = parsedItem;
      setEditingIndex(null);
    } else {
      updated = [...items, parsedItem];
    }
    onChange(JSON.stringify(updated, null, 2));
    setNewItem({});
  };

  const handleCancelEdit = () => {
    setNewItem({});
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(JSON.stringify(updated, null, 2));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(JSON.stringify(updated, null, 2));
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(JSON.stringify(updated, null, 2));
  };

  return (
    <div className="flex flex-col gap-3 border border-theme-border rounded-lg p-4 bg-theme-bg/50 md:col-span-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-theme-text">{title}</span>
        <span className="text-xs text-theme-text3">{items.length} items</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {items.map((item: any, idx: number) => {
          const ItemIcon = item.icon ? (LucideIcons as any)[item.icon] : null;
          return (
            <div key={idx} className="flex items-start justify-between gap-2 p-3 rounded border border-theme-border bg-theme-bg2 text-xs">
              <div className="flex gap-2 flex-1 overflow-hidden items-start">
                {ItemIcon && <ItemIcon size={16} className="text-theme-accent shrink-0 mt-0.5" />}
                <div className="flex-1 overflow-hidden">
                  <div className="text-theme-text text-[11px] font-medium">{item.title || item.name || item.role || item.label || Object.values(item)[0] as string}</div>
                  {(item.desc || item.text || item.val) && <div className="text-theme-text3 text-[10px] mt-0.5 truncate">{item.desc || item.text || item.val}</div>}
                </div>
              </div>
              <div className="flex flex-col gap-1 items-stretch shrink-0">
                <div className="flex gap-1 h-6">
                  <button type="button" onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="flex-1 px-1 border border-theme-border rounded bg-theme-bg hover:bg-theme-bg2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[10px]">↑</button>
                  <button type="button" onClick={() => handleMoveDown(idx)} disabled={idx === items.length - 1} className="flex-1 px-1 border border-theme-border rounded bg-theme-bg hover:bg-theme-bg2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[10px]">↓</button>
                </div>
                <div className="flex gap-1 h-6">
                  <button type="button" onClick={() => handleEdit(idx)} className="flex-1 text-theme-accent hover:text-theme-text font-medium px-2 border border-theme-accent/20 rounded bg-theme-accent/10 hover:bg-theme-accent/20 transition-colors text-[10px]">Edit</button>
                  <button type="button" onClick={() => handleRemove(idx)} className="flex-1 text-red-500 hover:text-red-400 font-medium px-2 border border-red-500/20 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors text-[10px]">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="text-xs text-theme-text3 italic">No items added yet.</div>}
      </div>

      <div className={`flex flex-col gap-3 border-t border-theme-border pt-4 mt-2 ${editingIndex !== null ? 'bg-theme-bg/50 p-3 rounded -mx-3 border-x border-b' : ''}`}>
        <span className="text-xs text-theme-text2 font-medium">{editingIndex !== null ? 'Edit Item' : 'Add New Item'}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.key} className={f.type === 'textarea' ? "sm:col-span-2" : ""}>
              {f.key === 'icon' ? (
                <IconPicker 
                  value={newItem[f.key] || ""} 
                  onChange={v => setNewItem({...newItem, [f.key]: v})} 
                />
              ) : f.type === 'textarea' ? (
                <textarea 
                  value={newItem[f.key] || ""} 
                  onChange={e => setNewItem({...newItem, [f.key]: e.target.value})} 
                  placeholder={f.placeholder || f.label}
                  className="w-full p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[60px] text-xs placeholder:text-theme-text3/50"
                />
              ) : (
                <input 
                  type="text"
                  value={newItem[f.key] || ""} 
                  onChange={e => setNewItem({...newItem, [f.key]: e.target.value})} 
                  placeholder={f.placeholder || f.label}
                  className="w-full p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 text-xs placeholder:text-theme-text3/50"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center mt-1">
          <button type="button" onClick={handleAdd} className="px-4 py-2 bg-theme-text text-theme-bg rounded text-xs hover:opacity-85 transition-opacity font-medium">
            {editingIndex !== null ? 'Update Item' : '+ Add Item'}
          </button>
          {editingIndex !== null && (
            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border border-theme-border text-theme-text rounded text-xs hover:bg-theme-bg2 transition-colors font-medium">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("");
  const [badge, setBadge] = useState("");
  const [icon, setIcon] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [actionText, setActionText] = useState("");
  const [actionLink, setActionLink] = useState("");

  const loadItems = async () => {
    const colRef = collection(db, "resources");
    try {
      const qs = await getDocs(colRef);
      setItems(qs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch(err) {
      handleFirestoreError(err, OperationType.LIST, "resources");
    }
  }

  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setName(""); setDesc(""); setType(""); setBadge(""); setIcon(""); setCoverImage(""); setActionText(""); setActionLink("");
    setEditingId(null);
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const resRef = doc(db, "resources", editingId);
        await updateDoc(resRef, {
          name, description: desc, type, badge, icon, coverImage, actionText, actionLink
        });
        toast.success("Resource updated");
      } else {
        const id = Date.now().toString(); // simple ID gen
        await setDoc(doc(db, "resources", id), {
          name, description: desc, type, badge, icon, coverImage, actionText, actionLink,
          createdAt: new Date().toISOString()
        });
        toast.success("Resource added");
      }
      resetForm();
      loadItems();
    } catch(err) {
      toast.error(editingId ? "Error updating resource" : "Error adding resource");
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "resources");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setDesc(item.description);
    setType(item.type);
    setBadge(item.badge);
    setIcon(item.icon);
    setCoverImage(item.coverImage || "");
    setActionText(item.actionText);
    setActionLink(item.actionLink);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDel = async (id: string) => {
    try {
      await deleteDoc(doc(db, "resources", id));
      toast.success("Resource deleted");
      loadItems();
    } catch(err) {
      toast.error("Error deleting resource");
      handleFirestoreError(err, OperationType.DELETE, `resources/${id}`);
    }
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-4 sm:p-8 overflow-hidden w-full">
      <h2 className="font-serif text-2xl text-theme-text mb-6">Manage Resources</h2>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 md:p-6 bg-theme-bg2 rounded-2xl w-full">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={type} onChange={e=>setType(e.target.value)} placeholder="Type (e.g. Notes • PDF)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={badge} onChange={e=>setBadge(e.target.value)} placeholder="Badge (e.g. Intermediate)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input value={icon} onChange={e=>setIcon(e.target.value)} placeholder="Icon (e.g. Book, FileText)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full md:col-span-1" />
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="Cover Image URL" className="flex-1 p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
          <label className="cursor-pointer px-4 py-2 bg-theme-bg border border-theme-border rounded text-sm text-theme-text flex items-center justify-center shrink-0 hover:bg-theme-bg2 transition-colors">
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setCoverImage)} />
          </label>
        </div>
        <input required value={actionText} onChange={e=>setActionText(e.target.value)} placeholder="Action Text (e.g. ↓ Download)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={actionLink} onChange={e=>setActionLink(e.target.value)} placeholder="Action Link (URL)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 w-full">
          <button type="submit" className="flex-1 p-2 bg-theme-text text-theme-bg rounded">{editingId ? "Save Changes" : "Add Resource"}</button>
          {editingId && <button type="button" onClick={resetForm} className="p-2 px-6 border border-theme-border rounded text-theme-text w-full sm:w-auto">Cancel</button>}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-theme-text">
          <thead>
            <tr className="border-b border-theme-border"><th className="pb-2">Name</th><th className="pb-2 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b border-theme-border/50">
                <td className="py-2">{i.name}</td>
                <td className="py-2 text-right">
                  <button onClick={()=>handleEdit(i)} className="text-theme-accent mr-4 hover:underline">Edit</button>
                  <button onClick={()=>handleDel(i.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BlogAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("");
  const [readTime, setReadTime] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [icon, setIcon] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");

  const loadItems = async () => {
    const colRef = collection(db, "blogs");
    try {
      const qs = await getDocs(colRef);
      setItems(qs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch(err) {
      handleFirestoreError(err, OperationType.LIST, "blogs");
    }
  }

  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setTitle(""); setCat(""); setReadTime(""); setExcerpt(""); setTags(""); setIcon(""); setCoverImage(""); setContent("");
    setEditingId(null);
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const blogRef = doc(db, "blogs", editingId);
        await updateDoc(blogRef, {
          title, category: cat, readTime, excerpt, tags: tags.split(',').map(t=>t.trim()), icon, content, coverImage
        });
        toast.success("Blog updated");
      } else {
        const id = Date.now().toString(); // simple ID gen
        await setDoc(doc(db, "blogs", id), {
          title, category: cat, readTime, excerpt, tags: tags.split(',').map(t=>t.trim()), icon, content, coverImage,
          createdAt: new Date().toISOString()
        });
        toast.success("Blog added");
      }
      resetForm();
      loadItems();
    } catch(err) {
      toast.error(editingId ? "Error updating blog" : "Error adding blog");
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "blogs");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCat(item.category);
    setReadTime(item.readTime);
    setExcerpt(item.excerpt);
    setTags(item.tags ? item.tags.join(", ") : "");
    setIcon(item.icon);
    setCoverImage(item.coverImage || "");
    setContent(item.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDel = async (id: string) => {
    try {
      await deleteDoc(doc(db, "blogs", id));
      toast.success("Blog deleted");
      loadItems();
    } catch(err) {
      toast.error("Error deleting blog");
      handleFirestoreError(err, OperationType.DELETE, `blogs/${id}`);
    }
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-4 sm:p-8 overflow-hidden w-full">
      <h2 className="font-serif text-2xl text-theme-text mb-6">Manage Blogs</h2>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 md:p-6 bg-theme-bg2 rounded-2xl w-full">
        <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={cat} onChange={e=>setCat(e.target.value)} placeholder="Category (e.g. ML / AI)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={readTime} onChange={e=>setReadTime(e.target.value)} placeholder="Read Time (e.g. 5 min read)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={excerpt} onChange={e=>setExcerpt(e.target.value)} placeholder="Excerpt" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full md:col-span-2" />
        <input required value={tags} onChange={e=>setTags(e.target.value)} placeholder="Comma-separated Tags" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full md:col-span-2" />
        <IconPicker value={icon} onChange={setIcon} />
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 w-full">
          <input value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="Cover Image URL (Optional)" className="flex-1 p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
          <label className="cursor-pointer px-4 py-2 bg-theme-bg border border-theme-border rounded text-sm text-theme-text flex items-center justify-center shrink-0 hover:bg-theme-bg2 transition-colors">
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setCoverImage)} />
          </label>
        </div>
        <div className="md:col-span-2 flex flex-col gap-1 w-full">
          <MarkdownToolbar value={content} onChange={setContent} />
          <textarea required value={content} onChange={e=>setContent(e.target.value)} placeholder="Blog Content (Markdown supported)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card min-h-[150px] w-full" />
        </div>
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 w-full">
          <button type="submit" className="flex-1 p-2 bg-theme-text text-theme-bg rounded w-full">{editingId ? "Save Changes" : "Add Blog"}</button>
          {editingId && <button type="button" onClick={resetForm} className="p-2 px-6 border border-theme-border rounded text-theme-text w-full sm:w-auto">Cancel</button>}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-theme-text">
          <thead>
            <tr className="border-b border-theme-border"><th className="pb-2">Title</th><th className="pb-2 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b border-theme-border/50">
                <td className="py-2">{i.title}</td>
                <td className="py-2 text-right">
                  <button onClick={()=>handleEdit(i)} className="text-theme-accent mr-4 hover:underline">Edit</button>
                  <button onClick={()=>handleDel(i.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [cat, setCat] = useState("");
  const [desc, setDesc] = useState("");
  const [stack, setStack] = useState("");
  const [status, setStatus] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const loadItems = async () => {
    const colRef = collection(db, "projects");
    try {
      const qs = await getDocs(colRef);
      setItems(qs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch(err) {
      handleFirestoreError(err, OperationType.LIST, "projects");
    }
  }

  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setName(""); setCat(""); setDesc(""); setStack(""); setStatus(""); setGithubLink(""); setDemoLink(""); setCoverImage("");
    setEditingId(null);
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const projRef = doc(db, "projects", editingId);
        await updateDoc(projRef, {
          name, category: cat, description: desc, stack: stack.split(',').map(s=>s.trim()), status, githubLink, demoLink, coverImage
        });
        toast.success("Project updated");
      } else {
        const id = Date.now().toString(); // simple ID gen
        await setDoc(doc(db, "projects", id), {
          name, category: cat, description: desc, stack: stack.split(',').map(s=>s.trim()), status, githubLink, demoLink, coverImage,
          createdAt: new Date().toISOString()
        });
        toast.success("Project added");
      }
      resetForm();
      loadItems();
    } catch(err) {
      toast.error(editingId ? "Error updating project" : "Error adding project");
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "projects");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setCat(item.category);
    setDesc(item.description);
    setStack(item.stack ? item.stack.join(", ") : "");
    setStatus(item.status);
    setGithubLink(item.githubLink);
    setDemoLink(item.demoLink);
    setCoverImage(item.coverImage || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDel = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.success("Project deleted");
      loadItems();
    } catch(err) {
      toast.error("Error deleting project");
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-4 sm:p-8 overflow-hidden w-full">
      <h2 className="font-serif text-2xl text-theme-text mb-6">Manage Projects</h2>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 md:p-6 bg-theme-bg2 rounded-2xl w-full">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Project Name" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={cat} onChange={e=>setCat(e.target.value)} placeholder="Category (e.g. Web App)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <input required value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full md:col-span-2" />
        <input required value={stack} onChange={e=>setStack(e.target.value)} placeholder="Comma-separated Tech Stack" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full md:col-span-2" />
        <input required value={status} onChange={e=>setStatus(e.target.value)} placeholder="Status (Live / In Development)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="Cover Image URL (e.g. Drive Link)" className="flex-1 p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
          <label className="cursor-pointer px-4 py-2 bg-theme-bg border border-theme-border rounded text-sm text-theme-text flex items-center justify-center shrink-0 hover:bg-theme-bg2 transition-colors">
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setCoverImage)} />
          </label>
        </div>
        <input required value={githubLink} onChange={e=>setGithubLink(e.target.value)} placeholder="GitHub Link (https://... or empty string)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full md:col-span-1" />
        <input required value={demoLink} onChange={e=>setDemoLink(e.target.value)} placeholder="Demo Link (https://... or empty string)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full md:col-span-1" />
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 w-full">
          <button type="submit" className="flex-1 p-2 bg-theme-text text-theme-bg rounded w-full">{editingId ? "Save Changes" : "Add Project"}</button>
          {editingId && <button type="button" onClick={resetForm} className="p-2 px-6 border border-theme-border rounded text-theme-text w-full sm:w-auto">Cancel</button>}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-theme-text">
          <thead>
            <tr className="border-b border-theme-border"><th className="pb-2">Name</th><th className="pb-2 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b border-theme-border/50">
                <td className="py-2">{i.name}</td>
                <td className="py-2 text-right">
                  <button onClick={()=>handleEdit(i)} className="text-theme-accent mr-4 hover:underline">Edit</button>
                  <button onClick={()=>handleDel(i.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessageAdmin() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "messages"), (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      msgs.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setItems(msgs);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, "messages");
    });
    return unsub;
  }, []);

  const handleDel = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
      toast.success("Message deleted");
    } catch(err) {
      toast.error("Error deleting message");
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    }
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-4 sm:p-8 overflow-hidden w-full">
      <h2 className="font-serif text-2xl text-theme-text mb-6">Messages Received</h2>
      {items.length === 0 ? <p className="text-sm text-theme-text2">No messages found.</p> : (
        <div className="flex flex-col gap-4">
          {items.map(m => (
            <div key={m.id} className="p-4 border border-theme-border rounded-xl bg-theme-bg2 relative">
              <button 
                onClick={() => handleDel(m.id)} 
                className="absolute top-4 right-4 text-xs text-red-500 hover:opacity-80"
              >
                Delete
              </button>
              <div className="text-sm font-semibold text-theme-text mb-1">{m.name} <span className="text-theme-text3 font-normal">&lt;{m.email}&gt;</span></div>
              {m.subject && <div className="text-xs text-theme-accent mb-2">{m.subject}</div>}
              <div className="text-sm text-theme-text2 whitespace-pre-wrap mt-2">{m.message}</div>
              {m.createdAt && <div className="text-[10px] text-theme-text3 mt-4">{new Date(m.createdAt).toLocaleString()}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
