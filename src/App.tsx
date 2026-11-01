import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Overview } from './components/Overview';
import { CommandCentre } from './components/CommandCentre';
import { DocumentIntelligence } from './components/DocumentIntelligence';
import { TaskManagement } from './components/TaskManagement';
import { ProjectMonitoring } from './components/ProjectMonitoring';
import { ReportGenerator } from './components/ReportGenerator';
import { OrganisationKnowledge } from './components/OrganisationKnowledge';
import { Settings } from './components/Settings';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { hasEnteredApp, setHasEnteredApp, activeTab, settings } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If user has not clicked Enter CommandIQ, display Welcome Screen
  if (!hasEnteredApp) {
    return <WelcomeScreen onEnter={() => setHasEnteredApp(true)} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'assistant':
        return <CommandCentre />;
      case 'documents':
        return <DocumentIntelligence />;
      case 'tasks':
        return <TaskManagement />;
      case 'projects':
        return <ProjectMonitoring />;
      case 'reports':
        return <ReportGenerator />;
      case 'knowledge':
        return <OrganisationKnowledge />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 flex flex-col w-64 bg-slate-900 h-full shadow-2xl">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <TaskModal />
      <ProjectModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
