import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingDown,
  Package,
  Users,
  UserCircle,
  Calculator,
  FileText,
  FolderKanban,
  FileBarChart,
  BarChart2,
  CheckCircle,
  Sparkles,
  CreditCard,
  Settings,
  Search,
  Bot,
  Bell,
  ChevronLeft,
  Menu,
  Camera,
  Megaphone,
  Moon,
  Sun,
  X,
  LogOut,
  ChevronDown,
  Network,
  Shield,
  Download,
  Plus,
  Puzzle,
  Compass,
  Server,
  Calendar,
  Loader2
} from 'lucide-react';

// Import Components
import AIChat from './components/ai/AIChat';
import AIAssistant from './components/AIAssistant';
import BackgroundEffects from './components/BackgroundEffects';
import ToastContainer from './components/ToastContainer';
import Notifications from './components/Notifications';
import ProfileMenu from './components/ProfileMenu';
import GlobalFilterBar from './components/layout/GlobalFilterBar';
import { CommandPalette } from './components/CommandPalette';
import { FilterProvider } from './context/FilterContext';
import { useLanguage } from './contexts/LanguageContext';
import { T, NAV_GROUPS } from './constants';

import { AnimatePresence, motion } from 'motion/react';

// Lazy Load Pages
const Finance = lazy(() => import('./pages/Finance'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sales = lazy(() => import('./pages/Sales'));
const Marketing = lazy(() => import('./pages/Marketing'));
const Strategy = lazy(() => import('./pages/Strategy'));
const Warehouse = lazy(() => import('./pages/Warehouse'));
const CRM = lazy(() => import('./pages/CRM'));
const Projects = lazy(() => import('./pages/Projects'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Reports = lazy(() => import('./pages/Reports'));
const Analysis = lazy(() => import('./pages/Analysis'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Login = lazy(() => import('./pages/Login'));
const Cameras = lazy(() => import('./pages/Cameras'));
const HR = lazy(() => import('./pages/HR'));
const Workflows = lazy(() => import('./pages/Workflows'));
const Agents = lazy(() => import('./pages/Agents'));
const Deploy = lazy(() => import('./pages/Deploy'));

export default function App() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set(['dashboard']));
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode as per request
  
  // Track visited pages for KeepAlive pattern
  useEffect(() => {
    setVisitedPages(prev => {
      if (prev.has(activePage)) return prev;
      const newSet = new Set(prev);
      newSet.add(activePage);
      return newSet;
    });
  }, [activePage]);

  // Toggle dark mode class on html element
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleOpenAIAssistant = () => setAiOpen(true);
    window.addEventListener('open-ai-assistant', handleOpenAIAssistant);
    return () => window.removeEventListener('open-ai-assistant', handleOpenAIAssistant);
  }, []);

  // Top bar states
  const [aiOpen, setAiOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setProfileOpen(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'sales', icon: ShoppingCart, label: t('sales') },
    { id: 'finance', icon: Calculator, label: 'Moliya' },
    { id: 'marketing', icon: Megaphone, label: t('marketing') },
    { id: 'strategy', icon: Compass, label: 'Strategiya' },
    { id: 'warehouse', icon: Package, label: t('warehouse') },
    { id: 'hr', icon: Users, label: t('hr') },
    { id: 'cameras', icon: Camera, label: t('cameras') },
    { id: 'crm', icon: UserCircle, label: t('crm') },
    { id: 'projects', icon: FolderKanban, label: t('projects') },
    { id: 'tasks', icon: CheckCircle, label: t('tasks') },
    { id: 'reports', icon: FileBarChart, label: t('reports') },
    { id: 'analysis', icon: BarChart2, label: t('analysis') },
    { id: 'ai', icon: Sparkles, label: t('ai_recommendations') },
    { 
      id: 'automation', 
      label: 'Avtomatlashtirish', 
      isCategory: true,
      children: [
        { id: 'agents', icon: Bot, label: 'AI Agentlar' },
        { id: 'workflows', icon: Network, label: t('automation') },
        { id: 'deploy', icon: Server, label: 'Joylashtirish' },
      ]
    },
  ];

  const renderMenuItem = (item: any, isChild = false) => (
    <div 
      key={item.id}
      onClick={() => {
        setActivePage(item.id);
        setMobileMenuOpen(false);
      }}
      title={(!sidebarOpen && !mobileMenuOpen) ? item.label : undefined}
      className={`sidebar-item relative flex items-center px-6 py-2 lg:py-3 cursor-pointer transition-all duration-200 group overflow-hidden ${
        activePage === item.id
          ? (darkMode ? 'bg-brand-500/15 text-brand-400 font-semibold' : 'bg-blue-50 text-blue-600 font-semibold') 
          : (darkMode ? 'text-text-secondary hover:bg-surface-layer hover:text-text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
      } ${isChild ? 'pl-12' : ''}`}
    >
      {activePage === item.id && (
        <motion.div 
          layoutId="activeSidebar"
          className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
        />
      )}
      <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${(sidebarOpen || mobileMenuOpen) ? 'mr-3' : 'mx-auto'} ${activePage === item.id ? 'drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]' : ''}`} />
      {(sidebarOpen || mobileMenuOpen) && <span className="text-sm lg:text-base font-medium">{item.label}</span>}
    </div>
  );

  const bottomMenuItems = [
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  const pagesConfig = [
    { id: 'dashboard', component: <Dashboard /> },
    { id: 'sales', component: <Sales /> },
    { id: 'finance', component: <Finance /> },
    { id: 'marketing', component: <Marketing /> },
    { id: 'strategy', component: <Strategy /> },
    { id: 'warehouse', component: <Warehouse /> },
    { id: 'hr', component: <HR /> },
    { id: 'cameras', component: <Cameras /> },
    { id: 'crm', component: <CRM /> },
    { id: 'projects', component: <Projects /> },
    { id: 'tasks', component: <Tasks /> },
    { id: 'reports', component: <Reports /> },
    { id: 'analysis', component: <Analysis /> },
    { id: 'ai', component: <AIRecommendations /> },
    { id: 'agents', component: <Agents /> },
    { id: 'workflows', component: <Workflows /> },
    { id: 'deploy', component: <Deploy /> },
    { id: 'integrations', component: <Integrations /> },
    { id: 'settings', component: <SettingsPage /> },
    { id: 'admin', component: <Admin /> },
  ];


  return (
    <div className={`flex h-screen font-sans overflow-hidden relative transition-colors duration-500 ${darkMode ? 'dark bg-app-bg text-text-primary' : 'bg-slate-50 text-slate-900'}`}>
      <FilterProvider>
        <BackgroundEffects />
        <ToastContainer />
        <CommandPalette 
          isOpen={commandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)} 
          pages={NAV_GROUPS.flatMap(g => g.items)}
          setPage={setActivePage}
        />
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
            ${darkMode ? 'bg-sidebar-bg border-r border-sidebar-border shadow-[1px_0_20px_rgba(0,0,0,0.3)]' : 'bg-slate-50 border-r border-slate-200'} 
            transition-all duration-500 flex flex-col flex-shrink-0
          `}
        >
          {/* Logo */}
          <div className={`h-16 flex items-center px-6 border-b ${darkMode ? 'border-border-glow' : 'border-slate-200'}`}>
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 shadow-lg shadow-brand-500/20">
              <Bot className="text-white w-5 h-5" />
            </div>
            {(sidebarOpen || mobileMenuOpen) && (
              <div>
                <h1 className={`font-bold text-base lg:text-lg leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>AI-BOS</h1>
                <span className="text-[10px] lg:text-base text-text-muted font-medium tracking-wider uppercase">Business OS</span>
              </div>
            )}
          </div>

          {/* Toggle Button (Desktop Only) */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden lg:block absolute -right-3 top-20 rounded-full p-1 shadow-xl transition-colors z-50 ${darkMode ? 'bg-surface-card text-text-secondary hover:bg-surface-layer border border-border-glow' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
            {menuItems.map((item) => (
              item.isCategory ? (
                <div key={item.id}>
                  {(sidebarOpen || mobileMenuOpen) && (
                    <div className="px-6 py-1 lg:py-2 text-xs lg:text-base font-bold text-text-muted uppercase tracking-wider">
                      {item.label}
                    </div>
                  )}
                  {item.children.map((child: any) => renderMenuItem(child, true))}
                </div>
              ) : (
                renderMenuItem(item)
              )
            ))}
          </div>

          {/* Bottom Menu */}
          <div className={`py-4 border-t space-y-1 ${darkMode ? 'border-border-glow' : 'border-slate-200'}`}>
            {bottomMenuItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                title={(!sidebarOpen && !mobileMenuOpen) ? item.label : undefined}
                className={`sidebar-item relative flex items-center px-6 py-2 lg:py-3 cursor-pointer transition-all duration-200 group overflow-hidden ${
                  activePage === item.id
                    ? (darkMode ? 'bg-brand-500/15 text-brand-400 font-semibold' : 'bg-blue-50 text-blue-600 font-semibold') 
                    : (darkMode ? 'text-text-secondary hover:bg-surface-layer hover:text-text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                }`}
              >
                {activePage === item.id && (
                  <motion.div 
                    layoutId="activeSidebar"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                  />
                )}
                <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${(sidebarOpen || mobileMenuOpen) ? 'mr-3' : 'mx-auto'} ${activePage === item.id ? 'drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]' : ''}`} />
                {(sidebarOpen || mobileMenuOpen) && <span className="text-sm lg:text-base font-medium">{item.label}</span>}
              </div>
            ))}
          </div>
        </aside>

          {/* Main Content */}
        <main className={`flex-1 flex flex-col min-w-0 relative transition-colors duration-500 bg-app-bg/60 backdrop-blur-[12px] border border-white/[0.05]`}>
          {/* Top Header */}
          <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30 relative transition-colors duration-500 ${activePage === 'ai' ? 'bg-transparent border-white/10 backdrop-blur-sm' : (darkMode ? 'bg-app-bg/80 backdrop-blur-md border-border-glow' : 'bg-white border-slate-200')}`}>
            
            {/* Mobile Menu Button */}
            <button 
              className={`lg:hidden p-2 -ml-2 mr-2 rounded-lg transition-colors ${darkMode ? 'text-text-secondary hover:bg-surface-card' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="flex items-center flex-1 max-w-xl">
              <div 
                className="relative w-full hidden md:block cursor-pointer group"
                onClick={() => setCommandPaletteOpen(true)}
              >
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activePage === 'ai' ? 'text-white/50 group-hover:text-white/70' : 'text-text-muted group-hover:text-brand-500'}`}>
                  <Search className="w-5 h-5" />
                </span>
                <div 
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg text-base transition-all flex items-center justify-between ${
                    activePage === 'ai'
                      ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                      : (darkMode 
                        ? 'bg-surface-card border-border-dark text-text-muted hover:border-brand-500 hover:text-text-primary' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-500 hover:bg-white hover:text-slate-900')
                  }`}
                >
                  <span>Qidirish... (mahsulot, mijoz, xodim)</span>
                  <div className="flex items-center gap-1">
                    <kbd className={`hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-base font-mono font-medium rounded border ${activePage === 'ai' ? 'border-white/20 text-white/50 bg-white/5' : (darkMode ? 'border-border-dark text-text-muted bg-surface-ground' : 'border-slate-300 text-slate-500 bg-slate-100')}`}>
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setCommandPaletteOpen(true)}
                className={`md:hidden p-2 rounded-lg transition-colors ${activePage === 'ai' ? 'text-white/70 hover:bg-white/10' : (darkMode ? 'text-text-secondary hover:bg-surface-card' : 'text-slate-500 hover:bg-slate-100')}`}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-4 ml-4">
              <button 
                onClick={() => setActivePage('add-expense')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base font-bold transition-all duration-300 ${activePage === 'ai' ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : (darkMode ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-rose-600 text-white hover:bg-rose-700')}`}
                title="Yangi xarajat qo'shish"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Yangi Xarajat</span>
              </button>

              <button 
                onClick={() => window.location.href = '/api/system/download'}
                className={`p-2 rounded-lg transition-all duration-300 ${activePage === 'ai' ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : (darkMode ? 'bg-surface-card text-text-secondary hover:bg-surface-dark border border-border-dark' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                title="Dasturni yuklab olish"
              >
                <Download className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${activePage === 'ai' ? 'bg-white/5 text-yellow-400 hover:bg-white/10 border border-white/10' : (darkMode ? 'bg-surface-card text-yellow-400 hover:bg-surface-dark border border-border-dark' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                title={darkMode ? "Yorug' rejim" : "Qorong'u rejim"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setAiOpen(!aiOpen)}
                className={`flex items-center gap-2 px-3 py-2 lg:px-4 rounded-lg text-base font-medium transition-all duration-300 ${
                  aiOpen 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                    : (activePage === 'ai' 
                        ? 'bg-white/5 text-enterprise-teal hover:bg-white/10 border border-enterprise-teal/30' 
                        : (darkMode ? 'bg-brand-900/30 text-brand-400 hover:bg-brand-900/50 border border-brand-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'))
                }`}
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AI Yordamchi</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`relative p-1 rounded-full transition-colors ${activePage === 'ai' ? 'hover:bg-white/10' : (darkMode ? 'hover:bg-surface-card' : 'hover:bg-slate-100')}`}
                >
                  <Bell className={`w-6 h-6 ${notifOpen ? 'text-brand-500' : (activePage === 'ai' ? 'text-white/70' : (darkMode ? 'text-text-secondary' : 'text-slate-500'))}`} />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-brand-600 text-white text-base font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-surface-dark">
                    3
                  </span>
                </button>
                <Notifications isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>

              <div className={`h-8 w-px mx-1 lg:mx-2 ${activePage === 'ai' ? 'bg-white/10' : (darkMode ? 'bg-border-dark' : 'bg-slate-200')}`}></div>

              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 lg:gap-3 cursor-pointer p-1 rounded-lg transition-colors ${activePage === 'ai' ? 'hover:bg-white/10' : (darkMode ? 'hover:bg-surface-card' : 'hover:bg-slate-50')}`}
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                    AB
                  </div>
                  <div className="hidden md:block text-left">
                    <p className={`text-base font-bold leading-tight ${activePage === 'ai' ? 'text-white' : (darkMode ? 'text-text-primary' : 'text-slate-900')}`}>Admin</p>
                    <p className={`text-base ${activePage === 'ai' ? 'text-white/50' : 'text-text-muted'}`}>Bosh hisobchi</p>
                  </div>
                </button>
                <ProfileMenu 
                  isOpen={profileOpen} 
                  onClose={() => setProfileOpen(false)} 
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {pagesConfig.map(page => (
              visitedPages.has(page.id) && (
                <div
                  key={page.id}
                  className={`absolute inset-0 overflow-y-auto custom-scrollbar ${
                    activePage === page.id 
                      ? 'flex flex-col z-10' 
                      : 'hidden'
                  }`}
                >
                  <Suspense fallback={<div className="flex justify-center items-center h-full min-h-[50vh]"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>}>
                    {page.component}
                  </Suspense>
                </div>
              )
            ))}
          </div>


          {/* AI Assistant Sidebar */}
          <AIAssistant 
            isOpen={aiOpen} 
            onClose={() => setAiOpen(false)} 
            activePage={activePage}
          />

          {/* Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                aiOpen 
                  ? 'bg-brand-700 text-white scale-90' 
                  : 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-110 hover:shadow-brand-500/50'
              }`}
              title="AI Yordamchi"
            >
              <Bot className="w-6 h-6" />
            </button>
            <AIChat />
          </div>
        </main>
      </FilterProvider>
    </div>
  );
}
