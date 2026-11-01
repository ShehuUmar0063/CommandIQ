import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FilePlus,
  FileSpreadsheet,
  FileText,
  Filter,
  HelpCircle,
  ListTodo,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentItem } from '../types';
import { analyzeDocumentWithAI, extractTasksFromText, uploadAndParseDocument } from '../services/api';

export const DocumentIntelligence: React.FC = () => {
  const {
    documents,
    addDocument,
    deleteDocument,
    updateDocument,
    batchAddTasks,
    setActiveTab,
    prefillChatPrompt,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manual note creation modal
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('Meeting Notes');
  const [noteContent, setNoteContent] = useState('');

  // Document inspection modal state
  const [activeViewingDoc, setActiveViewingDoc] = useState<DocumentItem | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'content' | 'summary' | 'keyPoints' | 'tasks' | 'risks'>('summary');

  // Task Extraction Review Modal
  const [isTaskReviewOpen, setIsTaskReviewOpen] = useState(false);
  const [extractedTasksList, setExtractedTasksList] = useState<any[]>([]);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === 'all' ? true : doc.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const parsed = await uploadAndParseDocument(file);

      // Create new document entry
      const newDoc: DocumentItem = {
        id: 'doc_' + Date.now().toString(36),
        name: parsed.fileName,
        type: parsed.fileType || 'txt',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: parsed.fileSize,
        content: parsed.extractedText,
        isDemo: false,
      };

      addDocument(newDoc);

      // Immediately run background analysis to extract summary and key insights
      analyzeDocumentWithAI(newDoc.name, newDoc.content)
        .then((aiData) => {
          updateDocument(newDoc.id, {
            summary: aiData.summary,
            keyPoints: aiData.keyPoints,
            extractedTasks: aiData.extractedTasks,
            risks: aiData.risks,
            recommendations: aiData.recommendations,
          });
        })
        .catch((err) => console.warn('Background doc analysis failed:', err));

      // Open viewing modal for this document
      setActiveViewingDoc(newDoc);
      setActiveDocTab('content');
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload and parse file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle manual note creation
  const handleSaveManualNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newDoc: DocumentItem = {
      id: 'doc_' + Date.now().toString(36),
      name: `${noteTitle.trim()} (${noteCategory})`,
      type: 'notes',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: `${(noteContent.length / 1024).toFixed(1)} KB`,
      content: noteContent.trim(),
      isDemo: false,
    };

    addDocument(newDoc);
    setIsCreateNoteOpen(false);
    setNoteTitle('');
    setNoteContent('');

    // Trigger analysis
    analyzeDocumentWithAI(newDoc.name, newDoc.content)
      .then((aiData) => {
        updateDocument(newDoc.id, {
          summary: aiData.summary,
          keyPoints: aiData.keyPoints,
          extractedTasks: aiData.extractedTasks,
          risks: aiData.risks,
          recommendations: aiData.recommendations,
        });
      })
      .catch((err) => console.warn('Note analysis error:', err));

    setActiveViewingDoc(newDoc);
    setActiveDocTab('summary');
  };

  // Run AI analysis on specific document
  const triggerDocumentAnalysis = async (doc: DocumentItem) => {
    setIsAnalyzingDoc(true);
    try {
      const result = await analyzeDocumentWithAI(doc.name, doc.content);
      updateDocument(doc.id, {
        summary: result.summary,
        keyPoints: result.keyPoints,
        extractedTasks: result.extractedTasks,
        risks: result.risks,
        recommendations: result.recommendations,
      });
      setActiveViewingDoc({
        ...doc,
        ...result,
      });
      setActiveDocTab('summary');
    } catch (err: any) {
      alert('Analysis failed: ' + (err.message || 'API error'));
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // Workflow A: Extract tasks from document and open review modal
  const handleExtractTasks = async (doc: DocumentItem) => {
    setIsExtractingTasks(true);
    try {
      const res = await extractTasksFromText(doc.content, doc.name);
      setExtractedTasksList(
        res.tasks.map((t) => ({
          ...t,
          selected: true,
          documentId: doc.id,
        }))
      );
      setIsTaskReviewOpen(true);
    } catch (err: any) {
      alert('Could not extract tasks: ' + (err.message || 'API error'));
    } finally {
      setIsExtractingTasks(false);
    }
  };

  // Confirm and batch add selected tasks
  const handleConfirmAddTasks = () => {
    const chosen = extractedTasksList.filter((t) => t.selected);
    if (chosen.length === 0) {
      setIsTaskReviewOpen(false);
      return;
    }

    const payload = chosen.map((t) => ({
      title: t.title,
      description: t.description || 'Extracted from document analysis',
      priority: t.priority || 'High',
      status: 'To Do' as const,
      dueDate: t.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignee: t.assignee || '',
      documentId: t.documentId,
    }));

    batchAddTasks(payload);
    setIsTaskReviewOpen(false);
    setActiveTab('tasks');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Document Repository & Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload enterprise documents, extract tasks, and query content using Gemini
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt,.md,.json,.csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsCreateNoteOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note / Minutes</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or text..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {['all', 'docx', 'pdf', 'txt', 'notes'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-md uppercase font-mono text-[11px] transition-colors cursor-pointer ${
                selectedType === t
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs flex flex-col justify-between transition-all"
          >
            <div>
              {/* Document Header */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-start space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="uppercase font-mono">{doc.type}</span>
                      <span>•</span>
                      <span>{doc.fileSize || 'N/A'}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                </div>

                {doc.isDemo && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    Demo
                  </span>
                )}
              </div>

              {/* Summary or Snippet */}
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {doc.summary || doc.content.slice(0, 160) + '...'}
              </p>

              {/* Extracted badges */}
              <div className="flex flex-wrap gap-1.5 mb-4 text-[10px]">
                {doc.summary && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium">
                    AI Summary Available
                  </span>
                )}
                {doc.keyPoints && doc.keyPoints.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                    {doc.keyPoints.length} Key Points
                  </span>
                )}
                {doc.extractedTasks && doc.extractedTasks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                    {doc.extractedTasks.length} Action Items
                  </span>
                )}
              </div>
            </div>

            {/* Document Action Buttons (Section 5 requirements) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setActiveViewingDoc(doc);
                    setActiveDocTab('summary');
                    if (!doc.summary) {
                      triggerDocumentAnalysis(doc);
                    }
                  }}
                  className="px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="View AI Summary"
                >
                  Summarise
                </button>

                <button
                  onClick={() => {
                    prefillChatPrompt(`Analyse the document "${doc.name}" and provide answers to my specific questions.`);
                  }}
                  className="px-2 py-1 rounded text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors cursor-pointer font-medium"
                  title="Ask CommandIQ Assistant about this document"
                >
                  Ask Questions
                </button>

                <button
                  onClick={() => handleExtractTasks(doc)}
                  disabled={isExtractingTasks}
                  className="px-2 py-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer font-medium"
                  title="Extract actionable tasks into Task Manager"
                >
                  Extract Tasks
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setActiveViewingDoc(doc);
                    setActiveDocTab('content');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Read raw text"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No documents found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload your operational reports, meeting notes, policies, or memos to begin AI-powered extraction.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
          >
            Upload File
          </button>
        </div>
      )}

      {/* Document View & AI Intelligence Modal */}
      {activeViewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {activeViewingDoc.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="uppercase font-mono">{activeViewingDoc.type}</span>
                    <span>•</span>
                    <span>Uploaded {activeViewingDoc.uploadDate}</span>
                    {activeViewingDoc.fileSize && <span>• {activeViewingDoc.fileSize}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => triggerDocumentAnalysis(activeViewingDoc)}
                  disabled={isAnalyzingDoc}
                  className="px-2.5 py-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-teal-500/30 rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAnalyzingDoc ? 'Re-analysing...' : 'Re-analyse'}</span>
                </button>

                <button
                  onClick={() => setActiveViewingDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-5 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-4 text-xs font-medium bg-white dark:bg-slate-900">
              <button
                onClick={() => setActiveDocTab('summary')}
                className={`py-3 border-b-2 cursor-pointer ${
                  activeDocTab === 'summary'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                AI Summary
              </button>

              <button
                onClick={() => setActiveDocTab('keyPoints')}
                className={`py-3 border-b-2 cursor-pointer ${
                  activeDocTab === 'keyPoints'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Key Points
              </button>

              <button
                onClick={() => setActiveDocTab('tasks')}
                className={`py-3 border-b-2 cursor-pointer ${
                  activeDocTab === 'tasks'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Actionable Tasks
              </button>

              <button
                onClick={() => setActiveDocTab('risks')}
                className={`py-3 border-b-2 cursor-pointer ${
                  activeDocTab === 'risks'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Risks & Recommendations
              </button>

              <button
                onClick={() => setActiveDocTab('content')}
                className={`py-3 border-b-2 cursor-pointer ${
                  activeDocTab === 'content'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Raw Content
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {activeDocTab === 'summary' && (
                <div className="space-y-4">
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Executive Overview</span>
                    </h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {activeViewingDoc.summary ||
                        'No executive summary generated yet. Click "Re-analyse" to generate.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveViewingDoc(null);
                        prefillChatPrompt(
                          `Please explain the primary implications of the document "${activeViewingDoc.name}".`
                        );
                      }}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Discuss with CommandIQ Assistant →</span>
                    </button>

                    <button
                      onClick={() => handleExtractTasks(activeViewingDoc)}
                      className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
                    >
                      Extract Tasks into Workspace
                    </button>
                  </div>
                </div>
              )}

              {activeDocTab === 'keyPoints' && (
                <div className="space-y-3">
                  {activeViewingDoc.keyPoints && activeViewingDoc.keyPoints.length > 0 ? (
                    activeViewingDoc.keyPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg flex items-start space-x-2.5 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">{pt}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      No key points extracted. Click "Re-analyse" to generate them.
                    </p>
                  )}
                </div>
              )}

              {activeDocTab === 'tasks' && (
                <div className="space-y-3">
                  {activeViewingDoc.extractedTasks && activeViewingDoc.extractedTasks.length > 0 ? (
                    activeViewingDoc.extractedTasks.map((t, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.description}</p>
                          <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                            {t.assignee && <span>Assignee: {t.assignee}</span>}
                            {t.dueDate && <span>Due: {t.dueDate}</span>}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
                          {t.priority}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-xs text-slate-400">No tasks extracted yet.</p>
                      <button
                        onClick={() => handleExtractTasks(activeViewingDoc)}
                        className="mt-3 px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
                      >
                        Extract Actionable Tasks
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeDocTab === 'risks' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Identified Operational Risks</span>
                    </h4>
                    {activeViewingDoc.risks && activeViewingDoc.risks.length > 0 ? (
                      <ul className="space-y-1.5 list-disc pl-5 text-slate-700 dark:text-slate-300">
                        {activeViewingDoc.risks.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400">No specific risks flagged.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-teal-600 dark:text-teal-400 mb-2 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Strategic Recommendations</span>
                    </h4>
                    {activeViewingDoc.recommendations && activeViewingDoc.recommendations.length > 0 ? (
                      <ul className="space-y-1.5 list-disc pl-5 text-slate-700 dark:text-slate-300">
                        {activeViewingDoc.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400">No recommendations available.</p>
                    )}
                  </div>
                </div>
              )}

              {activeDocTab === 'content' && (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap select-text leading-relaxed">
                  {activeViewingDoc.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workflow A: Task Review & Confirmation Modal */}
      {isTaskReviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Review Extracted Action Items
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify and select which items to add to Task Management
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTaskReviewOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {extractedTasksList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No action items identified in this document.
                </p>
              ) : (
                extractedTasksList.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={t.selected}
                      onChange={(e) =>
                        setExtractedTasksList((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, selected: e.target.checked } : item
                          )
                        )
                      }
                      className="mt-1 accent-teal-600 rounded cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">{t.description}</p>
                      <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-400">
                        {t.assignee && <span>Assignee: {t.assignee}</span>}
                        {t.dueDate && <span>Target: {t.dueDate}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsTaskReviewOpen(false)}
                className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddTasks}
                disabled={extractedTasksList.filter((t) => t.selected).length === 0}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm & Add {extractedTasksList.filter((t) => t.selected).length} Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Meeting Note / Document Creator Modal */}
      {isCreateNoteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FilePlus className="w-4 h-4 text-teal-600" />
                <span>Create Operations Note / Meeting Minutes</span>
              </h3>
              <button onClick={() => setIsCreateNoteOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Document / Note Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g., Weekly Ops Sync - Nov 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Category
                </label>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="Meeting Notes">Meeting Notes</option>
                  <option value="Operational Directive">Operational Directive</option>
                  <option value="Project Update">Project Update</option>
                  <option value="Policy Draft">Policy Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Text Content (Paste or write notes)
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={8}
                  placeholder="Paste meeting discussion, agreements, decisions, deliverables, and dates here..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 resize-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsCreateNoteOpen(false)}
                className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualNote}
                disabled={!noteTitle.trim() || !noteContent.trim()}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Save & Index Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
