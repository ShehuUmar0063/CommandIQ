import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle,
  Copy,
  CornerDownLeft,
  FileText,
  FolderKanban,
  HelpCircle,
  Layers,
  Lightbulb,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendChatMessage } from '../services/api';

export const CommandCentre: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    pendingPrompt,
    setPendingPrompt,
    documents,
    tasks,
    projects,
    knowledge,
    settings,
    addTask,
    setIsTaskModalOpen,
    setActiveTab,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quickCreatedTask, setQuickCreatedTask] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt);
      setPendingPrompt('');
    }
  }, [pendingPrompt, setPendingPrompt]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInput('');

    // Add user message to UI
    addChatMessage({
      sender: 'user',
      text,
    });

    setIsLoading(true);

    try {
      // Build context payload
      const historyPayload = chatMessages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const contextPayload = {
        orgProfile: settings.orgProfile,
        documents,
        tasks,
        projects,
        orgKnowledge: knowledge,
      };

      const response = await sendChatMessage(text, historyPayload, contextPayload);

      addChatMessage({
        sender: 'assistant',
        text: response.text,
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      const msg = err.message || 'Unable to connect to CommandIQ Assistant.';
      setErrorMessage(msg);
      addChatMessage({
        sender: 'assistant',
        text: `⚠️ **Operational Alert:** ${msg}\n\nPlease check your system connection or make sure the Gemini API service is available in your workspace.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedPrompts = [
    'Summarise my latest report.',
    'What tasks are currently overdue?',
    'Extract action points from this meeting note.',
    'What are the major risks in this project?',
    'Give me an overview of our current operations.',
    'Draft a weekly management report.',
  ];

  // Helper to extract possible task action from assistant message text
  const extractQuickTask = (text: string) => {
    // Look for lines starting with "- Task:" or bullet points with actions
    const lines = text.split('\n');
    for (const line of lines) {
      if (/^[-*]\s*(?:task|action|urgent|high priority):\s*(.+)/i.test(line) || /^[-*]\s*(.+)/.test(line)) {
        const clean = line.replace(/^[-*]\s*(?:task|action|urgent|high priority):\s*/i, '').replace(/^[*-]\s*/, '').trim();
        if (clean.length > 10 && clean.length < 90) {
          return clean;
        }
      }
    }
    return null;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-6 gap-6">
      {/* Main Chat Interface */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">CommandIQ Assistant</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-slate-500 font-mono">Gemini 3.8 Flash</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to {documents.length} docs, {tasks.length} tasks, and {projects.length} projects
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {chatMessages.map((msg) => {
            const isAssistant = msg.sender === 'assistant';
            const suggestedQuickTask = isAssistant ? extractQuickTask(msg.text) : null;

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isAssistant ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                    isAssistant
                      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                      : 'bg-teal-600 text-white shadow-sm'
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div
                    className={`flex items-center justify-between mb-1.5 text-[11px] ${
                      isAssistant ? 'text-slate-400' : 'text-teal-100'
                    }`}
                  >
                    <span className="font-semibold font-sans">
                      {isAssistant ? 'CommandIQ Assistant' : 'You'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Body Text */}
                  <div className="whitespace-pre-wrap break-words font-sans space-y-1">
                    {msg.text}
                  </div>

                  {/* Assistant Footer: Copy & Quick Task Action */}
                  {isAssistant && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Copy response"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Quick Task Creation button if assistant suggested actionable task */}
                      {suggestedQuickTask && (
                        <button
                          onClick={() => {
                            addTask({
                              title: suggestedQuickTask,
                              description: 'Extracted directly from CommandIQ Assistant recommendation.',
                              priority: 'High',
                              status: 'To Do',
                              dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                            });
                            setQuickCreatedTask(suggestedQuickTask);
                            setTimeout(() => setQuickCreatedTask(null), 3000);
                          }}
                          className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium flex items-center space-x-1 text-xs cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>
                            {quickCreatedTask === suggestedQuickTask
                              ? 'Task Added!'
                              : 'Add to Tasks'}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-500" />
                <span>Analysing workspace records and compiling response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 overflow-x-auto flex items-center space-x-2 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-teal-500" />
            <span>Suggested:</span>
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 focus-within:border-teal-500 dark:focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all bg-white dark:bg-slate-950">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CommandIQ Assistant about your documents, tasks, projects, or draft an operational report..."
              rows={2}
              className="w-full resize-none px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 bg-transparent placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />

            <div className="px-3 py-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Shift+Enter</kbd> for newline
              </span>

              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context & Source Reference Panel (Right side on desktop) */}
      <div className="w-full lg:w-80 shrink-0 space-y-4 flex flex-col">
        {/* Workspace Memory Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-teal-500" />
            <span>Active Knowledge Grounding</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            CommandIQ Assistant references your actual operational documents, active deliverables, and policies. It will not fabricate figures.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-500" />
                <span>Documents Indexed:</span>
              </span>
              <span className="font-semibold">{documents.length}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Active Deliverables:</span>
              </span>
              <span className="font-semibold">{tasks.length}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                <span>Monitored Projects:</span>
              </span>
              <span className="font-semibold">{projects.length}</span>
            </div>
          </div>
        </div>

        {/* Quick Grounded Documents Picker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Referenced Documents
            </h3>
            <button
              onClick={() => setActiveTab('documents')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60 flex-1 pr-1">
            {documents.length === 0 ? (
              <p className="text-xs text-slate-400">No documents in library.</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSend(`Summarise the document "${doc.name}" and identify all responsibilities.`)}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-teal-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  title="Click to query this document"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate max-w-[200px]">
                      {doc.name}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{doc.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {doc.summary || doc.content.slice(0, 60)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('documents')}
              className="w-full py-2 text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg border border-teal-500/30 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload New Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
