
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MyReports } from './pages/MyReports';
import { SubmissionEditor } from './pages/SubmissionEditor';
import { Approvals } from './pages/Approvals';
import { AggregateView } from './pages/AggregateView';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { auth } from './services/auth';
import { Departments } from './pages/Departments';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Router State
  const [currentView, setCurrentView] = useState('dashboard');
  const [editorState, setEditorState] = useState<{ submissionId: string | null; defId: string } | null>(null);

  useEffect(() => {
    // Check session on load
    const isAuth = auth.isAuthenticated();
    setIsAuthenticated(isAuth);
    setIsLoadingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    auth.logout();
    // auth.logout reloads page, but if logic changes:
    setIsAuthenticated(false);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setEditorState(null); // Reset editor when changing main views
  };

  const handleOpenEditor = (submissionId: string | null, defId: string) => {
    setEditorState({ submissionId, defId });
    setCurrentView('editor');
  };

  const renderContent = () => {
    if (currentView === 'editor' && editorState) {
      return (
        <SubmissionEditor
          submissionId={editorState.submissionId}
          reportDefinitionId={editorState.defId}
          onBack={() => setCurrentView('my-reports')}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'my-reports':
        return <MyReports onSelectReport={handleOpenEditor} />;
      case 'approvals':
        return <Approvals />;
      case 'aggregate':
        return <AggregateView />;
      case 'departments':
        return <Departments />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoadingAuth) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
