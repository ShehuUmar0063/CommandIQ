import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit2,
  FileText,
  Filter,
  FolderKanban,
  ListFilter,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PriorityLevel, Task, TaskStatus } from '../types';
import { extractTasksFromText } from '../services/api';

export const TaskManagement: React.FC = () => {
  const {
    tasks,
    projects,
    documents,
    addTask,
    updateTask,
    deleteTask,
    batchAddTasks,
    setIsTaskModalOpen,
    setEditingTask,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // AI Task Assistant breakdown drawer
  const [isAiBreakdownOpen, setIsAiBreakdownOpen] = useState(false);
  const [aiObjective, setAiObjective] = useState('');
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
  const [generatedBreakdownTasks, setGeneratedBreakdownTasks] = useState<any[]>([]);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      (task.assignee && task.assignee.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : task.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority =
      priorityFilter === 'all'
        ? true
        : task.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesProject =
      projectFilter === 'all' ? true : task.projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Low':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold';
      case 'To Do':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const nextStatus = (curr: TaskStatus): TaskStatus => {
    if (curr === 'To Do') return 'In Progress';
    if (curr === 'In Progress') return 'Completed';
    return 'To Do';
  };

  // Generate AI task breakdown for an objective
  const handleGenerateBreakdown = async () => {
    if (!aiObjective.trim()) return;
    setIsGeneratingBreakdown(true);
    try {
      const res = await extractTasksFromText(
        `Operational Goal/Initiative: ${aiObjective.trim()}\nBreak down this operational directive into concrete deliverables, milestones, and responsible teams.`
      );
      setGeneratedBreakdownTasks(res.tasks.map((t) => ({ ...t, selected: true })));
    } catch (err: any) {
      alert('Breakdown error: ' + (err.message || 'API error'));
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  const handleConfirmBreakdown = () => {
    const chosen = generatedBreakdownTasks.filter((t) => t.selected);
    if (chosen.length > 0) {
      batchAddTasks(
        chosen.map((t) => ({
          title: t.title,
          description: t.description,
          priority: t.priority || 'High',
          status: 'To Do',
          dueDate: t.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          assignee: t.assignee || 'Operations Team',
        }))
      );
    }
    setIsAiBreakdownOpen(false);
    setAiObjective('');
    setGeneratedBreakdownTasks([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Smart Task Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tasks.filter((t) => t.status === 'Completed').length} of {tasks.length} total tasks completed
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsAiBreakdownOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 hover:bg-teal-100 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>AI Task Breakdown</span>
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, assignee..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Project Link Filter */}
        <div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table / Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No tasks found matching your filter criteria.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const document = documents.find((d) => d.id === task.documentId);
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Checkbox + Title + Meta */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    <button
                      onClick={() => updateTask(task.id, { status: nextStatus(task.status) })}
                      className="mt-1 cursor-pointer transition-colors"
                      title={`Status: ${task.status}. Click to change.`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : task.status === 'In Progress' ? (
                        <Clock className="w-5 h-5 text-blue-500" />
                      ) : task.status === 'Overdue' ? (
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold text-slate-900 dark:text-white ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <span className={`text-[10px] px-2 py-0.5 rounded ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Association tags */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        {task.assignee && (
                          <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{task.assignee}</span>
                          </span>
                        )}

                        {task.dueDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className={task.status === 'Overdue' ? 'text-rose-500 font-bold' : ''}>
                              Due {task.dueDate}
                            </span>
                          </span>
                        )}

                        {project && (
                          <span className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400">
                            <FolderKanban className="w-3 h-3" />
                            <span>{project.name}</span>
                          </span>
                        )}

                        {document && (
                          <span className="flex items-center space-x-1 text-teal-600 dark:text-teal-400 truncate max-w-[200px]">
                            <FileText className="w-3 h-3" />
                            <span>Source: {document.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Task Breakdown Modal */}
      {isAiBreakdownOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Task Breakdown Assistant
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input an operational objective or directive to generate milestone tasks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiBreakdownOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Objective / Directive
                </label>
                <textarea
                  value={aiObjective}
                  onChange={(e) => setAiObjective(e.target.value)}
                  rows={3}
                  placeholder="e.g., Transition European logistics from TransLog to new regional suppliers before Nov 15 deadline..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <button
                onClick={handleGenerateBreakdown}
                disabled={isGeneratingBreakdown || !aiObjective.trim()}
                className="w-full py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                {isGeneratingBreakdown ? (
                  <span>Generating subtasks with Gemini...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Tasks</span>
                  </>
                )}
              </button>

              {generatedBreakdownTasks.length > 0 && (
                <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Suggested Subtasks ({generatedBreakdownTasks.length})
                  </p>
                  {generatedBreakdownTasks.map((t, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-start space-x-2.5 bg-slate-50 dark:bg-slate-800/50"
                    >
                      <input
                        type="checkbox"
                        checked={t.selected}
                        onChange={(e) =>
                          setGeneratedBreakdownTasks((prev) =>
                            prev.map((item, idx) =>
                              idx === i ? { ...item, selected: e.target.checked } : item
                            )
                          )
                        }
                        className="mt-0.5 accent-teal-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-teal-500/10 text-teal-600">
                            {t.priority}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsAiBreakdownOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>

              {generatedBreakdownTasks.length > 0 && (
                <button
                  onClick={handleConfirmBreakdown}
                  className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Add {generatedBreakdownTasks.filter((t) => t.selected).length} Tasks to Workspace
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
