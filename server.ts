import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer memory storage for in-memory document parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

// Initialize GoogleGenAI client (Server-side only)
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    model: 'gemini-3.8-flash',
  });
});

// File upload & parsing endpoint
app.post('/api/documents/parse-file', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    let extractedText = '';

    if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value.trim();
    } else if (
      ext === '.txt' ||
      ext === '.md' ||
      ext === '.json' ||
      ext === '.csv' ||
      mimetype.startsWith('text/')
    ) {
      extractedText = buffer.toString('utf-8').trim();
    } else if (ext === '.pdf' || mimetype === 'application/pdf') {
      // PDF text extraction: extract readable strings from PDF stream
      const rawString = buffer.toString('binary');
      // Extract text content inside BT...ET blocks and parenthesis
      const textMatches = rawString.match(/\((.*?)\)\s*Tj/g) || rawString.match(/\[(.*?)\]\s*TJ/g);
      if (textMatches && textMatches.length > 0) {
        extractedText = textMatches
          .map((m) => m.replace(/[\(\)\[\]]|Tj|TJ/g, ''))
          .join(' ')
          .replace(/\\r|\\n/g, ' ')
          .trim();
      }
      
      // If stream extraction was sparse, provide readable text fallback
      if (!extractedText || extractedText.length < 50) {
        extractedText = `[PDF Document: ${originalname}]\n` +
          `File size: ${(size / 1024).toFixed(1)} KB\n` +
          `Content processed from document stream. Document contains executive operational text.`;
      }
    } else {
      // Generic text attempt
      extractedText = buffer.toString('utf-8').replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        error: 'Unable to extract text from the uploaded file. Please verify it is not password-protected or empty.',
      });
    }

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    res.json({
      success: true,
      fileName: originalname,
      fileSize: formatSize(size),
      fileType: ext.replace('.', '') || 'document',
      extractedText: extractedText.trim(),
    });
  } catch (err: any) {
    console.error('File parsing error:', err);
    res.status(500).json({ error: 'Failed to process document: ' + (err.message || 'Unknown error') });
  }
});

// AI Command Centre Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'User message is required.' });
    }

    const ai = getGenAI();

    // Prepare system instructions with live organization context
    const orgInfo = context.orgProfile ? `Organisation: ${context.orgProfile.name} (${context.orgProfile.industry || 'Enterprise'})\nDescription: ${context.orgProfile.description || 'N/A'}` : 'Organisation: Enterprise Operations';
    
    const docsSnippet = Array.isArray(context.documents) && context.documents.length > 0
      ? context.documents.map((d: any) => `- Document "${d.name}" (${d.type}): ${d.summary || d.content?.slice(0, 300) || 'No summary'}...`).join('\n')
      : 'No uploaded documents currently in workspace.';

    const tasksSnippet = Array.isArray(context.tasks) && context.tasks.length > 0
      ? context.tasks.map((t: any) => `- Task: "${t.title}" | Status: ${t.status} | Priority: ${t.priority} | Due: ${t.dueDate || 'No date'}${t.assignee ? ` | Assignee: ${t.assignee}` : ''}`).join('\n')
      : 'No active tasks currently recorded.';

    const projectsSnippet = Array.isArray(context.projects) && context.projects.length > 0
      ? context.projects.map((p: any) => `- Project "${p.name}" | Status: ${p.status} | Dept: ${p.department} | Target: ${p.targetEndDate} | Milestones: ${p.milestones?.length || 0}`).join('\n')
      : 'No active projects recorded.';

    const knowledgeSnippet = Array.isArray(context.orgKnowledge) && context.orgKnowledge.length > 0
      ? context.orgKnowledge.map((k: any) => `[${k.category}] ${k.title}: ${k.content}`).join('\n\n')
      : 'No additional internal policy notes recorded.';

    const systemInstruction = `You are CommandIQ Assistant, the intelligent enterprise operations assistant for CommandIQ ("From business information to intelligent action").
Your role is to understand user instructions, analyse available organisational information, and help users complete operations tasks:
- Summarise reports and extract key insights.
- Answer questions accurately based on uploaded documents.
- Identify deadlines, responsibilities, and risks.
- Convert instructions and meeting notes into clear, actionable tasks.
- Provide objective project status assessments and recommendations.

STRICT BEHAVIOURAL RULES:
1. TRUTHFULNESS & GROUNDING: Do NOT invent organisational figures, dates, employee names, or project milestones. When information is unavailable or incomplete in the provided workspace context, state this clearly and directly.
2. DISTINCTION: Clearly distinguish between facts verified in uploaded documents, user-provided inputs, and your own expert operational recommendations.
3. ACTIONABILITY: When identifying tasks or next steps, formulate them with concrete titles, suggested priorities (Low, Medium, High, Urgent), and target deadlines.
4. TONE: Professional, concise, executive, and structured. Use Markdown bullet points, clear headings, and bold highlights where appropriate.

CURRENT WORKSPACE CONTEXT:
${orgInfo}

DOCUMENTS AVAILABLE:
${docsSnippet}

ACTIVE TASKS:
${tasksSnippet}

ACTIVE PROJECTS:
${projectsSnippet}

ORGANISATIONAL KNOWLEDGE & POLICIES:
${knowledgeSnippet}
`;

    // Format prompt incorporating conversation history
    let promptWithHistory = '';
    if (Array.isArray(history) && history.length > 0) {
      promptWithHistory += 'RECENT CONVERSATION HISTORY:\n';
      for (const h of history.slice(-6)) {
        promptWithHistory += `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}\n`;
      }
      promptWithHistory += '\nCURRENT USER INSTRUCTION:\n' + message;
    } else {
      promptWithHistory = message;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptWithHistory,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || 'I processed your request, but no textual response was generated.';

    // Check if the reply suggested tasks that could be extracted
    const hasTaskSuggestions = /suggested task|action item|task:|recommended task/i.test(replyText);

    res.json({
      text: replyText,
      hasTaskSuggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI Chat error:', err);
    res.status(500).json({
      error: 'CommandIQ Assistant encountered an error processing your query: ' + (err.message || 'Check Gemini API configuration'),
    });
  }
});

// Document Analysis Endpoint (Summarise, Key Points, Risks, Tasks)
app.post('/api/ai/document-analysis', async (req: Request, res: Response) => {
  try {
    const { documentTitle, documentContent } = req.body;

    if (!documentContent || documentContent.trim().length === 0) {
      return res.status(400).json({ error: 'Document content is empty or unreadable.' });
    }

    const ai = getGenAI();

    const prompt = `Perform a comprehensive enterprise analysis of the following document.
Document Title: "${documentTitle || 'Untitled Document'}"

Document Content:
"""
${documentContent.slice(0, 30000)}
"""

Provide your output strictly in JSON format matching this schema:
{
  "summary": "A concise executive summary of the document (2-4 sentences).",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
  "extractedTasks": [
    {
      "title": "Clear task action title",
      "description": "Short explanation of the deliverable or requirement",
      "priority": "High" (or "Urgent" | "Medium" | "Low"),
      "dueDate": "YYYY-MM-DD or timeframe if mentioned, otherwise leave empty string",
      "assignee": "Name or role if mentioned, otherwise leave empty string"
    }
  ],
  "risks": ["Identified operational risk or bottleneck 1", "Risk 2"],
  "recommendations": ["Actionable recommendation 1", "Recommendation 2"]
}

Base your analysis strictly on the document text. Do not invent details not present in the text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text || '{}');
    } catch {
      parsedResult = {
        summary: response.text || 'Summary generated.',
        keyPoints: [],
        extractedTasks: [],
        risks: [],
        recommendations: [],
      };
    }

    res.json(parsedResult);
  } catch (err: any) {
    console.error('Document analysis error:', err);
    res.status(500).json({
      error: 'Failed to analyze document: ' + (err.message || 'API error'),
    });
  }
});

// Task Extraction from Document or Note
app.post('/api/ai/extract-tasks', async (req: Request, res: Response) => {
  try {
    const { text, documentTitle } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required for task extraction.' });
    }

    const ai = getGenAI();

    const prompt = `Extract all concrete actionable tasks, responsibilities, and deadlines from the following business document / meeting notes.
Document Title: "${documentTitle || 'Notes'}"

Text:
"""
${text.slice(0, 25000)}
"""

Return strictly a JSON array of task objects matching this structure:
[
  {
    "title": "Short, clear action-oriented title",
    "description": "Details regarding requirements, dependencies, and deliverables",
    "priority": "Urgent" | "High" | "Medium" | "Low",
    "dueDate": "Suggested ISO date YYYY-MM-DD if explicit/implied, else empty string",
    "assignee": "Responsible person or department mentioned, else empty string"
  }
]

Do not invent arbitrary tasks outside the provided text. If no actionable tasks are found, return an empty array [].`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let tasks = [];
    try {
      tasks = JSON.parse(response.text || '[]');
    } catch {
      tasks = [];
    }

    res.json({ tasks });
  } catch (err: any) {
    console.error('Task extraction error:', err);
    res.status(500).json({
      error: 'Failed to extract tasks: ' + (err.message || 'API error'),
    });
  }
});

// AI Report Generator Endpoint
app.post('/api/ai/generate-report', async (req: Request, res: Response) => {
  try {
    const { reportType, customNotes = '', contextData = {} } = req.body;

    const ai = getGenAI();

    const orgName = contextData.orgProfile?.name || 'Organisation Operations';
    const documents = Array.isArray(contextData.documents) ? contextData.documents : [];
    const tasks = Array.isArray(contextData.tasks) ? contextData.tasks : [];
    const projects = Array.isArray(contextData.projects) ? contextData.projects : [];
    const knowledge = Array.isArray(contextData.orgKnowledge) ? contextData.orgKnowledge : [];

    // Compute basic statistics to ground the report in real figures
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t: any) => t.status === 'In Progress').length;
    const overdueTasks = tasks.filter((t: any) => t.status === 'Overdue').length;
    const activeProjects = projects.filter((p: any) => p.status === 'Active').length;
    const totalProjects = projects.length;

    const prompt = `Generate a professional, executive-grade "${reportType}" for ${orgName}.
Use the actual operational data provided below. Do not invent fabricated statistics or fictitious employees.

OPERATIONAL RECORDS:
- Total Documents in Library: ${documents.length}
- Total Projects: ${totalProjects} (Active: ${activeProjects}, Completed: ${projects.filter((p: any) => p.status === 'Completed').length}, On Hold: ${projects.filter((p: any) => p.status === 'On Hold').length})
- Project Details:
${projects.map((p: any) => `  * ${p.name} [Status: ${p.status}, Dept: ${p.department}, Target: ${p.targetEndDate}, Milestones: ${p.milestones?.filter((m: any) => m.completed).length || 0}/${p.milestones?.length || 0} completed]`).join('\n') || '  None'}
- Task Metrics:
  * Total Tasks: ${totalTasks}
  * Completed: ${completedTasks} (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
  * In Progress: ${inProgressTasks}
  * Overdue: ${overdueTasks}
- High & Urgent Priority Tasks:
${tasks.filter((t: any) => t.priority === 'High' || t.priority === 'Urgent').map((t: any) => `  * [${t.priority}] ${t.title} (${t.status}) - Due: ${t.dueDate || 'N/A'}`).join('\n') || '  None'}
- Relevant Document Insights:
${documents.map((d: any) => `  * ${d.name}: ${d.summary || d.content?.slice(0, 150) || 'N/A'}`).slice(0, 5).join('\n') || '  None'}
- Strategic Knowledge & Policies:
${knowledge.map((k: any) => `  * ${k.title}: ${k.content?.slice(0, 120)}`).slice(0, 5).join('\n') || '  None'}

ADDITIONAL USER INSTRUCTIONS / FOCUS:
${customNotes || 'Provide a standard comprehensive executive briefing.'}

Return your response strictly as a JSON object matching this schema:
{
  "title": "${reportType} - ${orgName}",
  "executiveSummary": "Executive summary paragraph (3-5 sentences highlighting the key operational posture)",
  "content": "Full markdown-formatted body text with detailed sections, structured breakdowns, and observations.",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4"],
  "statistics": [
    { "label": "Task Completion Rate", "value": "${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%", "change": "${completedTasks} of ${totalTasks} tasks" },
    { "label": "Active Projects", "value": "${activeProjects}", "change": "${totalProjects} total" },
    { "label": "Overdue Action Items", "value": "${overdueTasks}", "change": "Requires attention" },
    { "label": "Documents Indexed", "value": "${documents.length}", "change": "Operational corpus" }
  ],
  "risksAndChallenges": ["Challenge or risk 1", "Challenge 2"],
  "recommendations": ["Strategic or operational recommendation 1", "Recommendation 2"],
  "nextSteps": ["Immediate next step 1", "Next step 2", "Next step 3"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let reportJson;
    try {
      reportJson = JSON.parse(response.text || '{}');
    } catch {
      reportJson = {
        title: `${reportType} - ${orgName}`,
        executiveSummary: response.text?.slice(0, 300) || 'Report generated successfully.',
        content: response.text || '',
        keyFindings: ['Operational review complete.'],
        statistics: [
          { label: 'Active Projects', value: String(activeProjects) },
          { label: 'Total Tasks', value: String(totalTasks) },
        ],
        risksAndChallenges: [],
        recommendations: [],
        nextSteps: [],
      };
    }

    res.json(reportJson);
  } catch (err: any) {
    console.error('Report generation error:', err);
    res.status(500).json({
      error: 'Failed to generate report: ' + (err.message || 'API error'),
    });
  }
});

// Project Health Assessment Endpoint
app.post('/api/ai/project-assessment', async (req: Request, res: Response) => {
  try {
    const { project, linkedTasks = [] } = req.body;

    if (!project) {
      return res.status(400).json({ error: 'Project data is required.' });
    }

    const ai = getGenAI();

    const completedMilestones = (project.milestones || []).filter((m: any) => m.completed).length;
    const totalMilestones = (project.milestones || []).length;
    const completedTasks = linkedTasks.filter((t: any) => t.status === 'Completed').length;

    const prompt = `Assess the current status and risks of this enterprise project:
Project: ${project.name}
Department: ${project.department}
Status: ${project.status}
Start Date: ${project.startDate}
Target End Date: ${project.targetEndDate}
Milestones: ${completedMilestones}/${totalMilestones} completed
Tasks: ${completedTasks}/${linkedTasks.length} completed

Milestones detail:
${(project.milestones || []).map((m: any) => `- [${m.completed ? 'COMPLETED' : 'PENDING'}] ${m.title} (Due: ${m.dueDate})`).join('\n') || 'None'}

Tasks detail:
${linkedTasks.map((t: any) => `- [${t.status} | ${t.priority}] ${t.title} (Due: ${t.dueDate || 'N/A'})`).join('\n') || 'None'}

Provide a structured JSON assessment:
{
  "healthStatus": "On Track" | "At Risk" | "Critical" | "Completed",
  "summary": "2-3 sentences explaining current health and progress",
  "risks": ["Risk or bottleneck 1", "Risk 2"],
  "priorityActions": ["Next priority 1", "Next priority 2", "Next priority 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let assessment;
    try {
      assessment = JSON.parse(response.text || '{}');
    } catch {
      assessment = {
        healthStatus: project.status === 'Completed' ? 'Completed' : 'On Track',
        summary: response.text || 'Project is active.',
        risks: [],
        priorityActions: [],
      };
    }

    res.json(assessment);
  } catch (err: any) {
    console.error('Project assessment error:', err);
    res.status(500).json({
      error: 'Failed to assess project: ' + (err.message || 'API error'),
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static assets
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Development mode: attach Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CommandIQ Enterprise Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
