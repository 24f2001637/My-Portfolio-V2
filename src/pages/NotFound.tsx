import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 text-center fade-in">
      <Helmet>
        <title>404 Not Found | Sahil</title>
      </Helmet>
      
      <div className="font-mono text-theme-accent mb-4">Error 404</div>
      <h1 className="font-serif text-4xl sm:text-6xl text-theme-text mb-6">Page not found</h1>
      <p className="text-theme-text2 max-w-sm mx-auto mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-theme-text text-theme-bg rounded-lg font-medium hover:-translate-y-px transition-transform duration-200">
        <MoveLeft className="w-4 h-4" /> Go back home
      </Link>
    </div>
  );
}
