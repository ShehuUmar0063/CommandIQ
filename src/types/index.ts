export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed' | 'Overdue';
export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';
export type ReportType = 
  | 'Weekly Activity Report'
  | 'Project Progress Report'
  | 'Management Summary'
  | 'Task Performance Report'
  | 'Document Analysis Report'
  | 'Organisational Overview';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  dueDate: string;
  status: TaskStatus;
  projectId?: string;
  documentId?: string;
  assignee?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  department: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  milestones: Milestone[];
  budget?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string; // 'pdf' | 'docx' | 'txt' | 'notes' | 'policy'
  uploadDate: string;
  fileSize?: string;
  content: string;
  summary?: string;
  keyPoints?: string[];
  extractedTasks?: {
    title: string;
    description: string;
    priority: PriorityLevel;
    dueDate?: string;
    assignee?: string;
  }[];
  risks?: string[];
  recommendations?: string[];
  isDemo?: boolean;
}

export interface ReportItem {
  id: string;
  title: string;
  type: ReportType;
  generatedDate: string;
  executiveSummary: string;
  content: string;
  keyFindings: string[];
  statistics: { label: string; value: string; change?: string }[];
  risksAndChallenges: string[];
  recommendations: string[];
  nextSteps: string[];
  selectedProjectIds?: string[];
  selectedDocumentIds?: string[];
  isDemo?: boolean;
}

export interface OrgKnowledgeItem {
  id: string;
  title: string;
  category: 'Overview' | 'Department' | 'Objective' | 'Policy' | 'Instruction' | 'FAQ' | 'Internal Note';
  content: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface OrgProfile {
  name: string;
  tagline: string;
  industry: string;
  description: string;
  founded?: string;
  headquarters?: string;
}

export interface AppSettings {
  orgProfile: OrgProfile;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  referencedDocuments?: string[];
  referencedProjects?: string[];
  actionSuggestions?: {
    type: 'create_task' | 'view_project' | 'view_report';
    data: any;
    label: string;
  }[];
}
