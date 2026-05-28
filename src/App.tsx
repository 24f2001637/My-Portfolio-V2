/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Resources = lazy(() => import("./pages/Resources"));
const Writings = lazy(() => import("./pages/Writings"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));

function PageLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 flex justify-center items-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-theme-border border-t-theme-accent rounded-full animate-spin"></div>
        <div className="font-mono text-[10px] text-theme-text3 tracking-wider uppercase">Loading page...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/blogs" element={<Writings />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster theme="system" richColors position="bottom-right" />
      </Router>
    </HelmetProvider>
  );
}
