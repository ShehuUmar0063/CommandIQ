import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building,
  Check,
  CheckCircle,
  Database,
  Download,
  Info,
  Moon,
  RefreshCw,
  Save,
  Server,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { checkServerHealth } from '../services/api';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    clearDemoData,
    restoreDemoData,
    exportAllData,
    importAllData,
    isUsingDemoData,
    documents,
    tasks,
    projects,
    reports,
    knowledge,
  } = useApp();

  // Local form state for Org Profile
  const [name, setName] = useState(settings.orgProfile.name);
  const [tagline, setTagline] = useState(settings.orgProfile.tagline);
  const [industry, setIndustry] = useState(settings.orgProfile.industry);
  const [description, setDescription] = useState(settings.orgProfile.description);
  const [headquarters, setHeadquarters] = useState(settings.orgProfile.headquarters || '');
  const [currency, setCurrency] = useState(settings.currency);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Health check state
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    geminiConfigured: boolean;
    model: string;
  } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setIsCheckingHealth(true);
    const result = await checkServerHealth();
    setHealthStatus(result);
    setIsCheckingHealth(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      orgProfile: {
        name: name.trim(),
        tagline: tagline.trim(),
        industry: industry.trim(),
        description: description.trim(),
        headquarters: headquarters.trim(),
      },
      currency,
      dateFormat,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandiq-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        alert('Workspace records restored successfully.');
      } else {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <span>Platform Settings & Workspace Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage organizational profile, visual themes, AI connectivity, and local persistence
        </p>
      </div>

      {/* System & AI Connectivity Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              System Architecture & Gemini Connectivity
            </h3>
          </div>

          <button
            onClick={runHealthCheck}
            disabled={isCheckingHealth}
            className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            <span>Check Connectivity</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block">Express Backend</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Node.js / Express on Port 3000</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block">AI Model Architecture</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>{healthStatus?.model || 'gemini-3.8-flash'}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block">Server-Side API Key</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
              {healthStatus?.geminiConfigured ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Configured in Server</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600">Pending GEMINI_API_KEY</span>
                </>
              )}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          Security architecture note: The Gemini API key is strictly maintained on the server-side environment (`process.env.GEMINI_API_KEY`) and is never leaked or accessed in the client bundle.
        </p>
      </div>

      {/* Organisation Profile Settings */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Organisation Profile
            </h3>
          </div>

          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved successfully</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Organisation Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Industry Domain
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Headquarters / Operating Regions
            </label>
            <input
              type="text"
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Executive Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Currency & Date Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency Format
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
              <option value="JPY (¥)">JPY (¥)</option>
              <option value="CAD ($)">CAD ($)</option>
              <option value="AUD ($)">AUD ($)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Update Organisation Profile
          </button>
        </div>
      </form>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose between Light enterprise mode and Dark operations room aesthetic.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm text-xs">
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-3 rounded-lg border flex items-center space-x-2.5 transition-colors cursor-pointer ${
              settings.theme === 'light'
                ? 'border-teal-500 bg-teal-500/10 font-bold text-slate-900'
                : 'border-slate-200 dark:border-slate-800 text-slate-600'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-3 rounded-lg border flex items-center space-x-2.5 transition-colors cursor-pointer ${
              settings.theme === 'dark'
                ? 'border-teal-500 bg-teal-500/10 font-bold text-white'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            <Moon className="w-4 h-4 text-slate-400" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Data Management & Persistence Disclosure */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Workspace Data Management & Export
          </h3>
        </div>

        {/* Persistence Disclosure requirement from prompt */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Local Browser Storage Notice</span>
          </div>
          <p>
            Because this application operates without compulsory login or external accounts, your workspace records (documents, tasks, projects, reports, and knowledge base) are stored locally inside this current browser.
          </p>
          <p>
            They are not automatically synchronized between multiple devices or external teammates. Use the Export / Import features below to back up or migrate your records.
          </p>
        </div>

        {/* Current storage counters */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Current records: {documents.length} docs • {tasks.length} tasks • {projects.length} projects • {reports.length} reports • {knowledge.length} knowledge items</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={importFileRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => importFileRef.current?.click()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
          </button>

          {isUsingDemoData ? (
            <button
              onClick={clearDemoData}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Sample Demo Data</span>
            </button>
          ) : (
            <button
              onClick={restoreDemoData}
              className="px-3.5 py-2 text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 rounded-lg border border-teal-200 dark:border-teal-900 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Sample Demonstration Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
