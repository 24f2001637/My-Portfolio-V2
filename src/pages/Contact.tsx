import { ArrowRight, ArrowDown, Mail, Github, Linkedin, Twitter, FileText, MessageCircle, Globe, Youtube, Monitor, Link as LinkIcon, Instagram, Facebook } from "lucide-react";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const IconMap: Record<string, React.ElementType> = {
  Mail, Github, Linkedin, Twitter, MessageCircle, Globe, Youtube, Monitor, Link: LinkIcon, Instagram, Facebook
};

export default function Contact() {
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

  const [form, setForm] = useState({ name: "", email: "", message: "", subject: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      await addDoc(collection(db, 'messages'), {
        ...form,
        createdAt: new Date().toISOString()
      });
      setStatus("success");
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "", subject: "" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error("Failed to send message. Please try again.");
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    }
  };

  let socials: any[] = [];
  try {
    if (siteConfig?.socialsJSON) {
      socials = JSON.parse(siteConfig.socialsJSON);
    } else {
      socials = [
        { icon: "Mail", label: "Email", val: "sahilbind.iitm@gmail.com", href: "mailto:sahilbind.iitm@gmail.com" },
        { icon: "Github", label: "GitHub", val: "github.com/24f2001637", href: "https://github.com/24f2001637" },
        { icon: "Linkedin", label: "LinkedIn", val: "linkedin.com/in/sahilbind-24f2001637", href: "https://www.linkedin.com/in/sahilbind-24f2001637" },
        { icon: "Twitter", label: "Twitter", val: "@SAHIL13IND", href: "https://twitter.com/SAHIL13IND" },
      ];
    }
  } catch (e) {
    console.error("Error parsing socials JSON", e);
  }

  return (
    <>
      <Helmet>
        <title>Contact | Sahil Bind</title>
        <meta name="description" content="Get in touch with Sahil Bind." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20 fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="font-serif text-[40px] leading-[1.1] text-theme-text mb-5 tracking-[-0.02em]">
            Let's build<br />something <em className="italic text-theme-accent">useful</em><br />together.
          </h2>
          <p className="text-[14px] text-theme-text2 leading-[1.7] mb-7">
            {siteConfig?.contactText || "I'm always open to interesting conversations, collaboration opportunities, or just a good chat about math and AI. Don't hesitate to reach out."}
          </p>
          <div className="flex flex-col gap-2.5">
            {socials.map((link, i) => {
              const IconComponent = IconMap[link.icon] || LinkIcon;
              return (
                <a href={link.href} target="_blank" rel="noreferrer" key={i} className="flex items-center gap-3 p-3.5 bg-theme-card border border-theme-border rounded-lg cursor-pointer transition-all duration-200 shadow-theme-card hover:border-theme-accent hover:translate-x-1 group">
                  <div className="w-8 h-8 rounded-md bg-theme-accent-bg flex items-center justify-center text-[15px] text-theme-text">
                    <IconComponent size={16}/>
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-theme-text">{link.label}</div>
                    <div className="font-mono text-[10px] text-theme-text3">{link.val}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-theme-text3 transition-all duration-200 group-hover:text-theme-accent group-hover:translate-x-0.5" />
                </a>
              );
            })}
            
            <a href={siteConfig?.resumeLink || "#"} target={siteConfig?.resumeLink ? "_blank" : "_self"} rel="noreferrer" className="flex items-center gap-3 p-3.5 bg-theme-accent-bg border border-theme-accent rounded-lg cursor-pointer transition-all duration-200 shadow-theme-card hover:translate-x-1 group">
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-theme-accent"><FileText size={16}/></div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold text-theme-accent">Resume</div>
                <div className="font-mono text-[10px] text-theme-text3">Download PDF</div>
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-theme-accent animate-bounce" />
            </a>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-theme-card border border-theme-border rounded-3xl p-8 shadow-theme-card">
          <div className="font-serif text-xl mb-5 text-theme-text">Send a message</div>
          
          <div className="mb-4">
            <label className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.08em] block mb-1.5">Name</label>
            <input 
              required
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Your name" 
              className="w-full px-3.5 py-2.5 bg-theme-bg2 border border-theme-border rounded-md text-theme-text font-sans text-[13px] transition-colors focus:bg-theme-card focus:border-theme-accent outline-none"
            />
          </div>
          
          <div className="mb-4">
            <label className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.08em] block mb-1.5">Email</label>
            <input 
              required
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="your@email.com" 
              className="w-full px-3.5 py-2.5 bg-theme-bg2 border border-theme-border rounded-md text-theme-text font-sans text-[13px] transition-colors focus:bg-theme-card focus:border-theme-accent outline-none"
            />
          </div>
          
          <div className="mb-4">
            <label className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.08em] block mb-1.5">Subject</label>
            <input 
              value={form.subject}
              onChange={e => setForm({...form, subject: e.target.value})}
              placeholder="What's this about?" 
              className="w-full px-3.5 py-2.5 bg-theme-bg2 border border-theme-border rounded-md text-theme-text font-sans text-[13px] transition-colors focus:bg-theme-card focus:border-theme-accent outline-none"
            />
          </div>
          
          <div className="mb-4">
            <label className="font-mono text-[10px] text-theme-text3 uppercase tracking-[0.08em] block mb-1.5">Message</label>
            <textarea 
              required
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              placeholder="Hey Sahil, I wanted to..." 
              className="w-full px-3.5 py-2.5 bg-theme-bg2 border border-theme-border rounded-md text-theme-text font-sans text-[13px] transition-colors focus:bg-theme-card focus:border-theme-accent outline-none min-h-[100px] resize-y"
            ></textarea>
          </div>
          
          <button type="submit" disabled={status === "sending"} className="w-full py-3 bg-theme-text text-theme-bg border-none rounded-md font-sans text-[13px] font-semibold cursor-pointer transition-all hover:opacity-85 hover:-translate-y-px disabled:opacity-50">
            {status === "sending" ? "Sending..." : status === "success" ? "Sent!" : "Send Message →"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
