import { DocumentItem, OrgKnowledgeItem, OrgProfile, Project, ReportItem, Task } from '../types';

export interface ChatContextPayload {
  orgProfile: OrgProfile;
  documents: DocumentItem[];
  tasks: Task[];
  projects: Project[];
  orgKnowledge: OrgKnowledgeItem[];
}

export async function checkServerHealth(): Promise<{ status: string; geminiConfigured: boolean; model: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', geminiConfigured: false, model: 'gemini-3.8-flash' };
  }
}

export async function uploadAndParseDocument(file: File): Promise<{
  fileName: string;
  fileSize: string;
  fileType: string;
  extractedText: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/documents/parse-file', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'Failed to parse uploaded document');
  }

  return await res.json();
}

export async function sendChatMessage(
  message: string,
  history: { sender: 'user' | 'assistant'; text: string }[],
  context: ChatContextPayload
): Promise<{ text: string; hasTaskSuggestions?: boolean; timestamp: string }> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'AI request failed' }));
    throw new Error(err.error || 'Could not communicate with CommandIQ Assistant');
  }

  return await res.json();
}

export async function analyzeDocumentWithAI(
  documentTitle: string,
  documentContent: string
): Promise<{
  summary: string;
  keyPoints: string[];
  extractedTasks: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    dueDate?: string;
    assignee?: string;
  }[];
  risks: string[];
  recommendations: string[];
}> {
  const res = await fetch('/api/ai/document-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentTitle, documentContent }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || 'Document analysis failed');
  }

  return await res.json();
}

export async function extractTasksFromText(
  text: string,
  documentTitle?: string
): Promise<{
  tasks: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    dueDate?: string;
    assignee?: string;
  }[];
}> {
  const res = await fetch('/api/ai/extract-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, documentTitle }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Task extraction failed' }));
    throw new Error(err.error || 'Failed to extract tasks');
  }

  return await res.json();
}

export async function generateEnterpriseReport(
  reportType: string,
  customNotes: string,
  contextData: ChatContextPayload
): Promise<ReportItem> {
  const res = await fetch('/api/ai/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportType, customNotes, contextData }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Report generation failed' }));
    throw new Error(err.error || 'Failed to generate report');
  }

  const data = await res.json();
  return {
    id: 'rep_' + Date.now().toString(36),
    title: data.title || `${reportType}`,
    type: reportType as any,
    generatedDate: new Date().toISOString().split('T')[0],
    executiveSummary: data.executiveSummary || '',
    content: data.content || '',
    keyFindings: data.keyFindings || [],
    statistics: data.statistics || [],
    risksAndChallenges: data.risksAndChallenges || [],
    recommendations: data.recommendations || [],
    nextSteps: data.nextSteps || [],
    isDemo: false,
  };
}

export async function assessProjectHealth(
  project: Project,
  linkedTasks: Task[]
): Promise<{
  healthStatus: 'On Track' | 'At Risk' | 'Critical' | 'Completed';
  summary: string;
  risks: string[];
  priorityActions: string[];
}> {
  const res = await fetch('/api/ai/project-assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, linkedTasks }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Assessment failed' }));
    throw new Error(err.error || 'Project assessment failed');
  }

  return await res.json();
}
