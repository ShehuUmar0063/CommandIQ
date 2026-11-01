import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppSettings,
  ChatMessage,
  DocumentItem,
  OrgKnowledgeItem,
  Project,
  ReportItem,
  Task,
} from '../types';
import {
  initialDocuments,
  initialKnowledge,
  initialProjects,
  initialReports,
  initialSettings,
  initialTasks,
} from '../data/initialData';

export type NavTab =
  | 'overview'
  | 'assistant'
  | 'documents'
  | 'tasks'
  | 'projects'
  | 'reports'
  | 'knowledge'
  | 'settings';

interface AppContextType {
  // Navigation & Screen
  hasEnteredApp: boolean;
  setHasEnteredApp: (entered: boolean) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: DocumentItem) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  selectedDocForAnalysis: DocumentItem | null;
  setSelectedDocForAnalysis: (doc: DocumentItem | null) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  batchAddTasks: (newTasks: Omit<Task, 'id' | 'createdAt'>[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;

  // Reports
  reports: ReportItem[];
  addReport: (report: ReportItem) => void;
  updateReport: (id: string, updates: Partial<ReportItem>) => void;
  deleteReport: (id: string) => void;

  // Knowledge
  knowledge: OrgKnowledgeItem[];
  addKnowledgeItem: (item: Omit<OrgKnowledgeItem, 'id' | 'updatedAt'>) => void;
  updateKnowledgeItem: (id: string, updates: Partial<OrgKnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  prefillChatPrompt: (prompt: string) => void;
  pendingPrompt: string;
  setPendingPrompt: (p: string) => void;

  // Demo Data & Storage controls
  isUsingDemoData: boolean;
  clearDemoData: () => void;
  restoreDemoData: () => void;
  exportAllData: () => string;
  importAllData: (jsonData: string) => boolean;

  // Global modals
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  isProjectModalOpen: boolean;
  setIsProjectModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (t: Task | null) => void;
  editingProject: Project | null;
  setEditingProject: (p: Project | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENTERED: 'commandiq_entered_app',
  DOCUMENTS: 'commandiq_documents_v1',
  TASKS: 'commandiq_tasks_v1',
  PROJECTS: 'commandiq_projects_v1',
  REPORTS: 'commandiq_reports_v1',
  KNOWLEDGE: 'commandiq_knowledge_v1',
  SETTINGS: 'commandiq_settings_v1',
  CHAT: 'commandiq_chat_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Landing
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENTERED);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [pendingPrompt, setPendingPrompt] = useState<string>('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedDocForAnalysis, setSelectedDocForAnalysis] = useState<DocumentItem | null>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return saved ? JSON.parse(saved) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  // Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  // Reports
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : initialReports;
    } catch {
      return initialReports;
    }
  });

  // Knowledge
  const [knowledge, setKnowledge] = useState<OrgKnowledgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
      return saved ? JSON.parse(saved) : initialKnowledge;
    } catch {
      return initialKnowledge;
    }
  });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'welcome_msg',
          sender: 'assistant',
          text: `Welcome to **CommandIQ Assistant**. I am connected to your enterprise operations records, uploaded documents, active projects, and strategic policies.\n\nHow can I assist your operations today? You can ask me to summarise documents, extract action points into your task manager, assess project risks, or prepare an executive briefing.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    } catch {
      return [];
    }
  });

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTERED, String(hasEnteredApp));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [hasEnteredApp]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(knowledge));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [knowledge]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [chatMessages]);

  // Determine if demo data is present
  const isUsingDemoData =
    documents.some((d) => d.isDemo) ||
    tasks.some((t) => t.isDemo) ||
    projects.some((p) => p.isDemo);

  // Document actions
  const addDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Task actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      createdAt: new Date().toISOString().split('T')[0],
      isDemo: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const batchAddTasks = (newTasks: Omit<Task, 'id' | 'createdAt'>[]) => {
    const created: Task[] = newTasks.map((t, i) => ({
      ...t,
      id: 'task_' + Date.now().toString(36) + '_' + i,
      createdAt: new Date().toISOString().split('T')[0],
      isDemo: false,
    }));
    setTasks((prev) => [...created, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Project actions
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: 'proj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      createdAt: new Date().toISOString().split('T')[0],
      isDemo: false,
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        };
      })
    );
  };

  // Report actions
  const addReport = (report: ReportItem) => {
    setReports((prev) => [report, ...prev]);
  };

  const updateReport = (id: string, updates: Partial<ReportItem>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  // Knowledge actions
  const addKnowledgeItem = (item: Omit<OrgKnowledgeItem, 'id' | 'updatedAt'>) => {
    const newItem: OrgKnowledgeItem = {
      ...item,
      id: 'kn_' + Date.now().toString(36),
      updatedAt: new Date().toISOString().split('T')[0],
      isDemo: false,
    };
    setKnowledge((prev) => [newItem, ...prev]);
  };

  const updateKnowledgeItem = (id: string, updates: Partial<OrgKnowledgeItem>) => {
    setKnowledge((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : k
      )
    );
  };

  const deleteKnowledgeItem = (id: string) => {
    setKnowledge((prev) => prev.filter((k) => k.id !== id));
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Chat
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const fullMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, fullMsg]);
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'assistant',
        text: `Conversation cleared. I am ready for your next operations instruction or document inquiry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const prefillChatPrompt = (prompt: string) => {
    setPendingPrompt(prompt);
    setActiveTab('assistant');
  };

  // Demo data handlers
  const clearDemoData = () => {
    setDocuments((prev) => prev.filter((d) => !d.isDemo));
    setTasks((prev) => prev.filter((t) => !t.isDemo));
    setProjects((prev) => prev.filter((p) => !p.isDemo));
    setReports((prev) => prev.filter((r) => !r.isDemo));
    setKnowledge((prev) => prev.filter((k) => !k.isDemo));
  };

  const restoreDemoData = () => {
    setDocuments(initialDocuments);
    setTasks(initialTasks);
    setProjects(initialProjects);
    setReports(initialReports);
    setKnowledge(initialKnowledge);
    setSettings(initialSettings);
  };

  const exportAllData = (): string => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      documents,
      tasks,
      projects,
      reports,
      knowledge,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.documents)) setDocuments(parsed.documents);
      if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
      if (Array.isArray(parsed.reports)) setReports(parsed.reports);
      if (Array.isArray(parsed.knowledge)) setKnowledge(parsed.knowledge);
      return true;
    } catch (e) {
      console.error('Import parse error:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        hasEnteredApp,
        setHasEnteredApp,
        activeTab,
        setActiveTab,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        selectedDocForAnalysis,
        setSelectedDocForAnalysis,
        tasks,
        addTask,
        batchAddTasks,
        updateTask,
        deleteTask,
        projects,
        addProject,
        updateProject,
        deleteProject,
        toggleMilestone,
        reports,
        addReport,
        updateReport,
        deleteReport,
        knowledge,
        addKnowledgeItem,
        updateKnowledgeItem,
        deleteKnowledgeItem,
        settings,
        updateSettings,
        chatMessages,
        addChatMessage,
        clearChat,
        prefillChatPrompt,
        pendingPrompt,
        setPendingPrompt,
        isUsingDemoData,
        clearDemoData,
        restoreDemoData,
        exportAllData,
        importAllData,
        isTaskModalOpen,
        setIsTaskModalOpen,
        isProjectModalOpen,
        setIsProjectModalOpen,
        editingTask,
        setEditingTask,
        editingProject,
        setEditingProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
