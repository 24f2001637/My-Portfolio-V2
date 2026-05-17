import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { formatDate } from "../lib/utils";
import { Helmet } from "react-helmet-async";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      const windowHeight = scrollHeight - clientHeight;
      const scroll = windowHeight > 0 ? scrollTop / windowHeight : 0;
      setScrollProgress(scroll);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "blogs", id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBlog({ id: snap.id, ...data });
      } else {
        setBlog(null);
      }
      setLoading(false);
    }, err => {
      handleFirestoreError(err, OperationType.GET, `blogs/${id}`);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-20 fade-in text-center text-theme-text2">
        Loading...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-20 fade-in text-center text-theme-text2">
        <Helmet>
          <title>Blog Not Found | Portfolio</title>
        </Helmet>
        Blog not found.
        <div className="mt-4">
          <Link to="/blogs" className="text-theme-accent hover:underline">← Back to writings</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} | Sahil</title>
        <meta name="description" content={blog.excerpt || blog.title} />
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || blog.title} />
        {blog.coverImage && <meta property="og:image" content={blog.coverImage} />}
        <meta property="og:type" content="article" />
      </Helmet>
      <div 
        className="fixed top-[60px] left-0 h-[2px] bg-theme-accent z-[99] transition-all duration-150"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-20 fade-in">
        <div className="flex items-center justify-between mb-8">
          <Link to="/blogs" className="inline-flex items-center gap-1 text-xs text-theme-text3 hover:text-theme-accent transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <button onClick={handleShare} className="inline-flex items-center gap-1.5 text-xs text-theme-text3 hover:text-theme-text transition-colors bg-theme-bg2 px-3 py-1.5 rounded-full border border-theme-border">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="font-mono text-[10px] text-theme-accent uppercase tracking-[0.08em]">{blog.category}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-theme-text3"></span>
          <span className="font-mono text-[10px] text-theme-text3">{blog.createdAt ? formatDate(blog.createdAt) : blog.readTime}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-theme-text3"></span>
          <span className="font-mono text-[10px] text-theme-text3">{blog.readTime || "5 min read"}</span>
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl text-theme-text mb-6 leading-tight tracking-tight">
          {blog.title}
        </h1>
        
        <div className="h-64 sm:h-80 w-full bg-theme-bg2 rounded-xl border border-theme-border flex items-center justify-center text-6xl sm:text-7xl mb-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent from-60% to-theme-accent-glow pointer-events-none z-10"></div>
          {blog.coverImage ? (
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span>{blog.icon}</span>
          )}
        </div>
        
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:text-theme-text2 prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-theme-text prose-a:text-theme-accent hover:prose-a:underline font-sans prose-img:rounded-xl">
          <Markdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code(props: any) {
                const {children, className, node, ref, ...rest} = props
                const match = /language-(\w+)/.exec(className || '')
                const text = String(children).replace(/\n$/, '')
                return match ? (
                  <div className="relative group">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(text);
                        toast.success("Copied code to clipboard!");
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded bg-[#2D2D2D] hover:bg-[#3D3D3D] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Copy code"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <SyntaxHighlighter
                      {...rest}
                      PreTag="div"
                      children={text}
                      language={match[1]}
                      style={vscDarkPlus}
                      className="rounded-lg !my-4 !bg-[#1E1E1E] text-sm !pt-10"
                    />
                    <div className="absolute top-0 left-0 w-full px-4 py-2 bg-[#2D2D2D] rounded-t-lg text-xs font-mono text-gray-400 border-b border-[#3D3D3D]">
                      {match[1]}
                    </div>
                  </div>
                ) : (
                  <code {...rest} ref={ref} className="bg-theme-bg2 px-1.5 py-0.5 rounded text-theme-accent font-mono text-[0.875em]">
                    {children}
                  </code>
                )
              }
            }}
          >
            {blog.content}
          </Markdown>
        </div>
        
        <div className="flex gap-2 flex-wrap mt-12 pt-6 border-t border-theme-border">
          {blog.tags?.map((tag: string) => (
            <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded bg-theme-bg2 text-theme-text3 border border-theme-border">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
