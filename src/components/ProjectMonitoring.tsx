import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Edit2,
  FolderKanban,
  FolderPlus,
  Layers,
  ListTodo,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Milestone, Project, ProjectStatus } from '../types';
import { assessProjectHealth } from '../services/api';

export const ProjectMonitoring: React.FC = () => {
  const {
    projects,
    tasks,
    deleteProject,
    toggleMilestone,
    setIsProjectModalOpen,
    setEditingProject,
    setIsTaskModalOpen,
    setEditingTask,
    prefillChatPrompt,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);

  // AI Project Assessment State
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    healthStatus: 'On Track' | 'At Risk' | 'Critical' | 'Completed';
    summary: string;
    risks: string[];
    priorityActions: string[];
  } | null>(null);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'On Hold':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Planning':
        return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300';
    }
  };

  const handleRunAssessment = async (project: Project) => {
    setIsAssessing(true);
    setAssessmentResult(null);
    try {
      const linked = tasks.filter((t) => t.projectId === project.id);
      const result = await assessProjectHealth(project, linked);
      setAssessmentResult(result);
    } catch (err: any) {
      alert('Project assessment failed: ' + (err.message || 'API error'));
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Project Monitoring & Milestones</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {projects.filter((p) => p.status === 'Active').length} active streams tracked across departments
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto text-xs">
          {['all', 'Active', 'Planning', 'On Hold', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((project) => {
          const linkedTasks = tasks.filter((t) => t.projectId === project.id);
          const totalMilestones = project.milestones.length;
          const completedMilestones = project.milestones.filter((m) => m.completed).length;
          const completedTasks = linkedTasks.filter((t) => t.status === 'Completed').length;
          const progressPercent =
            totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

          return (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {project.department}
                      </span>
                      {project.budget && (
                        <span className="text-[11px] font-mono text-slate-400">
                          • Budget: {project.budget}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {project.name}
                    </h3>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Dates & Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Timeline</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {project.startDate} → {project.targetEndDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Connected Tasks</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {completedTasks} of {linkedTasks.length} done
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Milestone Progress</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {completedMilestones}/{totalMilestones} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Checklist Preview */}
                <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Key Milestones
                  </span>
                  {project.milestones.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(project.id, m.id)}
                      className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <button className="shrink-0">
                        {m.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-400" />
                        )}
                      </button>
                      <span className={`truncate ${m.completed ? 'line-through text-slate-400' : ''}`}>
                        {m.title}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0 font-mono">
                        {m.dueDate}
                      </span>
                    </div>
                  ))}
                  {project.milestones.length > 3 && (
                    <p className="text-[11px] text-slate-400 pt-0.5">
                      +{project.milestones.length - 3} more milestones
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedProjectForDetail(project);
                      handleRunAssessment(project);
                    }}
                    className="px-2.5 py-1.5 rounded-md font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 hover:bg-teal-100 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    <span>AI Health Audit</span>
                  </button>

                  <button
                    onClick={() =>
                      prefillChatPrompt(
                        `Assess current status, dependencies, and risks for "${project.name}".`
                      )
                    }
                    className="px-2 py-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Ask Assistant
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setIsProjectModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
          <FolderKanban className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No projects found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create an operational stream or initiative to monitor milestone delivery.
          </p>
        </div>
      )}

      {/* AI Project Health Audit Drawer/Modal */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Project Health Audit
                  </h3>
                  <p className="text-xs text-slate-400">{selectedProjectForDetail.name}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAssessing ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
                <span>Analysing deliverables, milestones, and target timelines with Gemini...</span>
              </div>
            ) : assessmentResult ? (
              <div className="space-y-4 text-xs">
                {/* Health Status Indicator */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Posture:</span>
                  <span
                    className={`px-2.5 py-1 rounded-md font-bold text-xs uppercase ${
                      assessmentResult.healthStatus === 'On Track'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : assessmentResult.healthStatus === 'At Risk'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {assessmentResult.healthStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Executive Summary</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {assessmentResult.summary}
                  </p>
                </div>

                {assessmentResult.risks && assessmentResult.risks.length > 0 && (
                  <div>
                    <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Identified Bottlenecks & Risks</span>
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                      {assessmentResult.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {assessmentResult.priorityActions && assessmentResult.priorityActions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-teal-600 dark:text-teal-400 mb-1 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Recommended Next Actions</span>
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                      {assessmentResult.priorityActions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
