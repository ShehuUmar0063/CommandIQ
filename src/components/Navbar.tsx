import React, { useState } from 'react';
import {
  BarChart3,
  Bot,
  CheckSquare,
  FilePlus,
  FileText,
  FolderPlus,
  HelpCircle,
  Menu,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import { NavTab, useApp } from '../context/AppContext';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    activeTab,
    setActiveTab,
    setIsTaskModalOpen,
    setIsProjectModalOpen,
    setEditingTask,
    setEditingProject,
    prefillChatPrompt,
    isUsingDemoData,
    clearDemoData,
    settings,
    updateSettings,
  } = useApp();

  const [showQuickActions, setShowQuickActions] = useState(false);

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Operations Overview', desc: 'Real-time operational metrics, priorities and active workflows' };
      case 'assistant':
        return { title: 'AI Command Centre', desc: 'Intelligent enterprise co-pilot powered by Gemini 3.8' };
      case 'documents':
        return { title: 'Document Intelligence', desc: 'Upload, query and extract tasks from business records' };
      case 'tasks':
        return { title: 'Task Management', desc: 'Track operational deliverables, assignments and deadlines' };
      case 'projects':
        return { title: 'Project Monitoring', desc: 'Multi-stream project tracking and milestone status' };
      case 'reports':
        return { title: 'AI Report Generator', desc: 'Generate executive briefings and audit-ready reports' };
      case 'knowledge':
        return { title: 'Organisation Knowledge', desc: 'Central enterprise memory, policies and operational rules' };
      case 'settings':
        return { title: 'Platform Settings', desc: 'Configure workspace preferences and local data management' };
    }
  };

  const current = getTabTitle(activeTab);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-10 transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center space-x-2">
            <span>{current.title}</span>
            {isUsingDemoData && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-medium">
                Demo Data Active
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {current.desc}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Buttons & Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Demo Data Warning/Clear */}
        {isUsingDemoData && (
          <button
            onClick={clearDemoData}
            title="Clear sample demo data to start fresh"
            className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border border-dashed border-slate-300 dark:border-slate-700"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
            <span>Clear Demo Data</span>
          </button>
        )}

        {/* Global Action Buttons */}
        <div className="hidden sm:flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('documents')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Upload and analyse a document"
          >
            <FilePlus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Analyse Document</span>
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Create a new task"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Create Task</span>
          </button>

          <button
            onClick={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Create a new project"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>New Project</span>
          </button>
        </div>

        {/* Main Ask CommandIQ CTA Button */}
        <button
          onClick={() => setActiveTab('assistant')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-lg shadow-sm shadow-teal-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden xs:inline">Ask</span> CommandIQ
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
