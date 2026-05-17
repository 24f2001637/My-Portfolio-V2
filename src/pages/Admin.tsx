import { useEffect, useState, FormEvent } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { compressImage } from "../lib/utils";

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

  if (user.email !== "sahilbind457@gmail.com") {
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
  ];

  // Admin Dashboard
  return (
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
        
        {activeTab === "contact" && <MessageAdmin />}
        {activeTab === "resources" && <ResourceAdmin />}
        {activeTab === "blogs" && <BlogAdmin />}
        {activeTab === "projects" && <ProjectAdmin />}
      </div>
    </div>
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
          socialsJSON: "[\n  { \"icon\": \"Mail\", \"label\": \"Email\", \"val\": \"sahilbind.iitm@gmail.com\", \"href\": \"mailto:sahilbind.iitm@gmail.com\" },\n  { \"icon\": \"Github\", \"label\": \"GitHub\", \"val\": \"github.com/24f2001637\", \"href\": \"https://github.com/24f2001637\" },\n  { \"icon\": \"Linkedin\", \"label\": \"LinkedIn\", \"val\": \"linkedin.com/in/sahilbind-24f2001637\", \"href\": \"https://www.linkedin.com/in/sahilbind-24f2001637\" },\n  { \"icon\": \"Twitter\", \"label\": \"Twitter\", \"val\": \"@SAHIL13IND\", \"href\": \"https://twitter.com/SAHIL13IND\" }\n]",
          languagesJSON: "[\n  { \"icon\": \"Code\", \"name\": \"Python\" },\n  { \"icon\": \"FileJson\", \"name\": \"JavaScript\" },\n  { \"icon\": \"Database\", \"name\": \"SQL\" }\n]",
          frameworksJSON: "[\n  { \"icon\": \"Wrench\", \"name\": \"Flask\" },\n  { \"icon\": \"LayoutTemplate\", \"name\": \"Vue.js\" },\n  { \"icon\": \"Flame\", \"name\": \"PyTorch\" }\n]",
          mathJSON: "[\n  { \"icon\": \"Calculator\", \"name\": \"Calculus\" },\n  { \"icon\": \"Grid3X3\", \"name\": \"Linear Algebra\" }\n]",
          experienceJSON: "[\n  { \"year\": \"2025\", \"role\": \"Campus Partner · Perplexity AI\", \"desc\": \"Introduced AI tools to the university community, supporting research workflows.\" },\n  { \"year\": \"2025\", \"role\": \"Subject Matter Expert · Chegg Inc.\", \"desc\": \"Helped students with subject-specific queries, teaching and explaining complex concepts.\" }\n]",
          educationJSON: "[\n  { \"year\": \"2024\", \"role\": \"IIT Madras — BS Data Science & Applications\", \"desc\": \"Concurrently pursuing BSc. Mathematics at DDU Gorakhpur University\" }\n]"
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
        languagesJSON, frameworksJSON, mathJSON, experienceJSON, educationJSON
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
          <>
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
            <label className="flex flex-col gap-1"><span className="text-sm text-theme-text2">"Now — Live" Heading</span>
              <input required value={heroCurrentlyHeading} onChange={e=>setHeroCurrentlyHeading(e.target.value)} placeholder="Now — Live" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">"Now — Live" Items (JSON Array)</span>
                <button type="button" onClick={() => setCurrentlyJSON("[\n  { \"icon\": \"Hammer\", \"title\": \"Building\", \"desc\": \"HMSCare\" },\n  { \"icon\": \"BookOpen\", \"title\": \"Studying\", \"desc\": \"Deep Learning\" },\n  { \"icon\": \"MapPin\", \"title\": \"Location\", \"desc\": \"Varanasi\" }\n]")} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={currentlyJSON} onChange={e=>setCurrentlyJSON(e.target.value)} placeholder={`[\n  { "icon": "Hammer", "title": "Building", "desc": "HMSCare" },\n  { "icon": "BookOpen", "title": "Studying", "desc": "Deep Learning" },\n  { "icon": "MapPin", "title": "Location", "desc": "Varanasi" }\n]`} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[140px] font-mono text-xs" />
            </label>
          </>
        )}

        {activeGroup === 'about' && (
          <>
            <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">About Text (HTML allowed)</span>
              <textarea required value={aboutText} onChange={e=>setAboutText(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[100px]" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">About Bio</span>
              <textarea required value={aboutBio} onChange={e=>setAboutBio(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[60px]" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">Sidebar Stats (JSON Array)</span>
                <button type="button" onClick={() => setStatsJSON('[\n  { "label": "Location", "val": "Varanasi, UP" },\n  { "label": "Timezone", "val": "IST (UTC+5:30)" }\n]')} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={statsJSON} onChange={e=>setStatsJSON(e.target.value)} placeholder="[{&quot;label&quot;: &quot;Location&quot;, &quot;val&quot;: &quot;Varanasi, UP&quot;}]" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[100px] font-mono text-xs" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">Languages (JSON Array)</span>
                <button type="button" onClick={() => setLanguagesJSON('[\n  { "icon": "Code", "name": "Python" },\n  { "icon": "FileJson", "name": "JavaScript" },\n  { "icon": "Database", "name": "SQL" }\n]')} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={languagesJSON} onChange={e=>setLanguagesJSON(e.target.value)} placeholder="[{&quot;icon&quot;: &quot;Code&quot;, &quot;name&quot;: &quot;Python&quot;}]" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[100px] font-mono text-xs" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">Frameworks & Tools (JSON Array)</span>
                <button type="button" onClick={() => setFrameworksJSON('[\n  { "icon": "Wrench", "name": "Flask" },\n  { "icon": "LayoutTemplate", "name": "Vue.js" },\n  { "icon": "Flame", "name": "PyTorch" }\n]')} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={frameworksJSON} onChange={e=>setFrameworksJSON(e.target.value)} placeholder="[{&quot;icon&quot;: &quot;Wrench&quot;, &quot;name&quot;: &quot;Flask&quot;}]" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[100px] font-mono text-xs" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">Mathematics (JSON Array)</span>
                <button type="button" onClick={() => setMathJSON('[\n  { "icon": "Calculator", "name": "Calculus" },\n  { "icon": "Grid3X3", "name": "Linear Algebra" }\n]')} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={mathJSON} onChange={e=>setMathJSON(e.target.value)} placeholder="[{&quot;icon&quot;: &quot;Calculator&quot;, &quot;name&quot;: &quot;Calculus&quot;}]" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[100px] font-mono text-xs" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">Experience (JSON Array)</span>
                <button type="button" onClick={() => setExperienceJSON('[\n  { "year": "2025", "role": "Campus Partner · Perplexity AI", "desc": "Introduced AI tools to the university community." },\n  { "year": "2025", "role": "Subject Matter Expert · Chegg", "desc": "Helped students with subject-specific queries." }\n]')} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={experienceJSON} onChange={e=>setExperienceJSON(e.target.value)} placeholder="[{&quot;year&quot;: &quot;2025&quot;, &quot;role&quot;: &quot;Campus Partner&quot;, &quot;desc&quot;: &quot;Details...&quot;}]" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[100px] font-mono text-xs" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">Education (JSON Array)</span>
                <button type="button" onClick={() => setEducationJSON('[\n  { "year": "2024", "role": "IIT Madras", "desc": "BS Data Science & Applications" }\n]')} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={educationJSON} onChange={e=>setEducationJSON(e.target.value)} placeholder="[{&quot;year&quot;: &quot;2024&quot;, &quot;role&quot;: &quot;IIT Madras&quot;, &quot;desc&quot;: &quot;BS Data Science&quot;}]" className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[100px] font-mono text-xs" />
            </label>
          </>
        )}

        {activeGroup === 'contact' && (
          <>
            <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">Contact Text</span>
              <textarea required value={contactText} onChange={e=>setContactText(e.target.value)} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[60px]" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-theme-text2">Resume Link (PDF URL)</span>
              <input value={resumeLink} onChange={e=>setResumeLink(e.target.value)} placeholder="https://..." className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-text2">Social Links (JSON Array)</span>
                <button type="button" onClick={() => setSocialsJSON('[\n  { "icon": "Mail", "label": "Email", "val": "hello@example.com", "href": "mailto:hello@example.com" },\n  { "icon": "Github", "label": "GitHub", "val": "github.com/example", "href": "https://github.com/example" },\n  { "icon": "Linkedin", "label": "LinkedIn", "val": "linkedin.com/in/example", "href": "https://linkedin.com/in/example" },\n  { "icon": "Twitter", "label": "Twitter", "val": "@example", "href": "https://twitter.com/example" }\n]')} className="text-[10px] bg-theme-bg2 border border-theme-border px-2 py-0.5 rounded text-theme-text2 hover:text-theme-text transition-colors">Load Example Data</button>
              </div>
              <textarea required value={socialsJSON} onChange={e=>setSocialsJSON(e.target.value)} placeholder={`[{"icon": "Github", "label": "GitHub", "val": "github.com/...", "href": "https://..."}]`} className="p-2 rounded border border-theme-border text-theme-text bg-theme-bg2 min-h-[140px] font-mono text-xs" />
            </label>
          </>
        )}

        <button type="submit" className="md:col-span-2 p-2 bg-theme-text text-theme-bg rounded">Save Config</button>
      </form>
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
        <input required value={icon} onChange={e=>setIcon(e.target.value)} placeholder="Icon (e.g. Mail, Github)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 w-full">
          <input value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="Cover Image URL (Optional)" className="flex-1 p-2 rounded border border-theme-border text-theme-text bg-theme-card w-full" />
          <label className="cursor-pointer px-4 py-2 bg-theme-bg border border-theme-border rounded text-sm text-theme-text flex items-center justify-center shrink-0 hover:bg-theme-bg2 transition-colors">
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setCoverImage)} />
          </label>
        </div>
        <textarea required value={content} onChange={e=>setContent(e.target.value)} placeholder="Blog Content (Markdown supported)" className="p-2 rounded border border-theme-border text-theme-text bg-theme-card md:col-span-2 min-h-[100px] w-full" />
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
