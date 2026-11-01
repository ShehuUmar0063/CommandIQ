import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  FilePlus,
  FileText,
  FolderKanban,
  Lightbulb,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Overview: React.FC = () => {
  const {
    documents,
    tasks,
    projects,
    reports,
    knowledge,
    setActiveTab,
    setIsTaskModalOpen,
    setIsProjectModalOpen,
    setEditingTask,
    updateTask,
    prefillChatPrompt,
    isUsingDemoData,
    settings,
  } = useApp();

  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Metrics
  const totalDocs = documents.length;
  const activeTasks = tasks.filter((t) => t.status !== 'Completed').length;
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const totalReports = reports.length;
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue');
  const urgentTasks = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed');

  // Pending tasks list
  const pendingTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .filter((t) => (filterPriority === 'all' ? true : t.priority.toLowerCase() === filterPriority))
    .slice(0, 6);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  // Dynamic recommendations computed from current context
  const dynamicRecommendations = [
    {
      id: 'rec_1',
      title: 'European Logistics Contract Tender',
      impact: 'High Impact',
      category: 'Operations',
      text: 'TransLog contract expires Nov 15. Marcus Vance has a pending evaluation task due Nov 10 to prevent delivery disruption.',
      actionText: 'Review Task in TransLog Tender',
      action: () => setActiveTab('tasks'),
    },
    {
      id: 'rec_2',
      title: 'ISO 27001 Compliance Audit Freeze',
      impact: 'Critical Compliance',
      category: 'Governance',
      text: 'Surveillance audit on Nov 25 requires closing 3 vendor risk assessments before the Nov 20 code freeze.',
      actionText: 'Check ISO 27001 Project',
      action: () => setActiveTab('projects'),
    },
    {
      id: 'rec_3',
      title: 'Database Sharding Latency Tuning',
      impact: 'Engineering Quality',
      category: 'Project Nexus',
      text: '$120k tooling budget was approved in the latest committee minutes to resolve database API latency.',
      actionText: 'Ask CommandIQ about Nexus',
      action: () => prefillChatPrompt('Explain the current bottleneck and budget allocation for Project Nexus.'),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enterprise Operations Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to CommandIQ.
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Your intelligent operations platform that synthesizes corporate records, tracks cross-functional deliverables, and assists executive decision-making through verifiable AI intelligence.
            </p>
          </div>

          {/* Quick Actions Grid inside Banner */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('documents')}
              className="px-3.5 py-2 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <FilePlus className="w-4 h-4 text-teal-600" />
              <span>Analyse Document</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className="px-3.5 py-2 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask CommandIQ</span>
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-400" />
              <span>Create Task</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div
          onClick={() => setActiveTab('documents')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">{totalDocs}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Indexed</span>
          </div>
          <div className="mt-2 text-xs text-teal-600 dark:text-teal-400 flex items-center">
            <span>Queryable in Command Centre</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

        {/* Active Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">{activeTasks}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Pending</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center">
            {overdueTasks.length > 0 ? (
              <span>{overdueTasks.length} overdue item(s)</span>
            ) : (
              <span>All items on schedule</span>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div
          onClick={() => setActiveTab('projects')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">{activeProjects}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">In flight</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <span>{projects.length} total portfolios</span>
          </div>
        </div>

        {/* Reports Generated */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Reports Generated</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">{totalReports}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Available</span>
          </div>
          <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 flex items-center">
            <span>Exportable to PDF</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Overview + Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Progress Overview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-indigo-500" />
                  <span>Project Progress Overview</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Milestone execution and target timelines
                </p>
              </div>

              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {projects.map((project) => {
                const totalM = project.milestones.length;
                const completedM = project.milestones.filter((m) => m.completed).length;
                const percent = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {project.name}
                        </h4>
                        <div className="flex items-center space-x-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {project.department}
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Target: {project.targetEndDate}</span>
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          project.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : project.status === 'Completed'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 dark:text-slate-400">
                          {completedM} of {totalM} milestones reached
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendations Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 text-white shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">CommandIQ Operations Recommendations</h3>
                  <p className="text-xs text-slate-400">Grounded in uploaded records & active deliverables</p>
                </div>
              </div>

              <button
                onClick={() => prefillChatPrompt('Give me a full operational breakdown of all risks and recommended actions.')}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center space-x-1 font-medium"
              >
                <span>Ask Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {dynamicRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">{rec.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {rec.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{rec.text}</p>
                  </div>

                  <button
                    onClick={rec.action}
                    className="shrink-0 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>{rec.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Tasks & Recent Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pending Tasks Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                  <span>Pending Tasks</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tasks.filter((t) => t.status !== 'Completed').length} items awaiting completion
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Priority Filter */}
            <div className="flex items-center space-x-1.5 mt-3 text-xs">
              {['all', 'urgent', 'high', 'medium'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2 py-1 rounded-md text-[11px] capitalize font-medium transition-colors cursor-pointer ${
                    filterPriority === p
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Tasks list */}
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No pending tasks matching this filter.
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div key={task.id} className="py-3 flex items-start justify-between gap-3 group">
                    <div className="flex items-start space-x-2.5">
                      <button
                        onClick={() =>
                          updateTask(task.id, {
                            status: task.status === 'Completed' ? 'In Progress' : 'Completed',
                          })
                        }
                        className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                          {task.assignee && (
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {task.assignee}
                            </span>
                          )}
                          {task.assignee && <span>•</span>}
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.dueDate || 'No date'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 space-y-1">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>Manage all {tasks.length} tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Operations Activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <span>Recent Operational Activity</span>
            </h3>

            <div className="mt-3 space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    Document indexed: <span className="text-teal-600 dark:text-teal-400">Q3 Operations Review</span>
                  </p>
                  <p className="text-[11px] text-slate-400">2 actionable tasks extracted by Gemini</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    Milestone completed in <span className="font-semibold">ISO 27001 Certification</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Hardware MFA tokens distributed to key leads</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    Executive Briefing generated
                  </p>
                  <p className="text-[11px] text-slate-400">Management summary compiled from active records</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    Deadline alert: European freight tender due
                  </p>
                  <p className="text-[11px] text-slate-400">Assigned to Marcus Vance, due Nov 10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
