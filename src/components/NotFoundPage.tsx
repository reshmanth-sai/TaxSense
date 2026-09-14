import React from 'react';
import { FileQuestion, ArrowRight, Home } from 'lucide-react';

interface NotFoundPageProps {
  onHome: () => void;
  onDashboard: () => void;
}

// Rendered by App for any path that isn't in the step<->path route table.
// Deliberately a real screen rather than a redirect so a mistyped or stale
// link tells the visitor what happened instead of silently landing on the
// marketing page.
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onHome, onDashboard }) => (
  <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-50 dark:bg-[#020202] dark:from-transparent dark:via-transparent dark:to-transparent text-slate-900 dark:text-slate-100 font-sans">
    <div className="w-full max-w-md text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <p className="text-2xs font-mono uppercase tracking-widest text-slate-500">404 &middot; Page not found</p>
        <h1 className="text-3xl font-extrabold tracking-tight">That page doesn't exist</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          The link may be old or mistyped. Nothing you entered has been lost &mdash; your workspace is still in this browser.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onDashboard}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <span>Go to dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onHome}
          className="h-11 px-5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to home</span>
        </button>
      </div>
    </div>
  </div>
);
