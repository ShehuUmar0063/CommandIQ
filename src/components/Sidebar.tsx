import React from 'react';
import {
  BarChart3,
  BookOpen,
  Bot,
  CheckSquare,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react';
import { NavTab, useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    tasks,
    documents,
    projects,
    isUsingDemoData,
    settings,
    setHasEnteredApp,
  } = useApp();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'Active').length;

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Command Centre', icon: Bot, badge: 'AI' },
    { id: 'documents', label: 'Document Intelligence', icon: FileText, badge: documents.length },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'projects', label: 'Project Monitoring', icon: FolderKanban, badge: activeProjectsCount },
    { id: 'reports', label: 'AI Reports', icon: BarChart3 },
    { id: 'knowledge', label: 'Organisation Knowledge', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Brand & Organization Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Layers className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-white tracking-tight font-sans text-base">Command<span className="text-teal-400">IQ</span></span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                {settings.orgProfile.name}
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Badge if active */}
        {isUsingDemoData && (
          <div className="mx-3 mt-3 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-medium text-[11px]">Demonstration Mode</span>
            </span>
            <span className="text-[10px] text-teal-400/80 font-mono">Sample</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border-l-3 border-teal-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300'
                        : typeof item.badge === 'string'
                        ? 'bg-slate-800 text-teal-400 border border-teal-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Info Area */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="bg-slate-800/50 rounded-lg p-2.5 text-xs text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>Workspace Storage</span>
            <span className="text-[10px] text-emerald-400">Local Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Data saved in current browser. No login required.
          </p>
        </div>

        <button
          onClick={() => setHasEnteredApp(false)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          title="Return to welcome screen"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to Welcome Screen</span>
        </button>
      </div>
    </aside>
  );
};
