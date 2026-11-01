import React from 'react';
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Layers,
  Lock,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Layers className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">Command<span className="text-teal-400">IQ</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Enterprise v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Enterprise Operations</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
            No registration required
          </span>
          <button
            onClick={onEnter}
            className="px-4 py-2 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <span>Enter App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        {/* Category Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Enterprise AI Operations Platform</span>
          <span className="text-slate-600">•</span>
          <span className="text-teal-400">Gemini 3.8 Intelligence</span>
        </div>

        {/* Main Logo & Headline */}
        <div className="mb-6 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0.5 border border-teal-500/30 shadow-2xl shadow-teal-500/10 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <Brain className="w-10 h-10 text-teal-400" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          From business information to{' '}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            intelligent action.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          CommandIQ transforms organizational documents, meeting minutes, and project updates into actionable insights, automated tasks, executive briefings, and verifiable decisions.
        </p>

        {/* Action Button */}
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-950 bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-400 rounded-xl shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer font-sans"
          >
            <span className="flex items-center space-x-2">
              <span>Enter CommandIQ</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <p className="mt-4 text-xs text-slate-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Your intelligent workspace. No registration required.</span>
          </p>
        </div>

        {/* Value proposition pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full max-w-4xl">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3.5">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Document Intelligence</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Upload PDF, DOCX, and notes. Extract tasks, identify risks, and query complex business reports with verifiable grounding.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3.5">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">AI Command Centre</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              A context-aware enterprise co-pilot that answers operational questions, flags bottlenecks, and drafts executive decisions.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3.5">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Operations & Reporting</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Track multi-department projects, automate task generation from meetings, and export audit-ready PDF reports in seconds.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CommandIQ Enterprise Operations. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>Client-side local persistence</span>
            <span>•</span>
            <span>Server-side Gemini AI</span>
            <span>•</span>
            <button onClick={onEnter} className="text-teal-400 hover:underline">
              Launch Workspace →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
