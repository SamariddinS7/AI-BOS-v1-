import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Globe, Eye, Server, Link as LinkIcon, Activity, Database, Users, Shield, Building2, LayoutGrid, Webhook, Book, ArrowRightLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../hooks/useToast';

import ProfileSettings from './settings/ProfileSettings';
import GeneralSettings from './settings/GeneralSettings';
import NotificationSettings from './settings/NotificationSettings';
import SecuritySettings from './settings/SecuritySettings';
import SessionManagement from './settings/SessionManagement';
import IntegrationSettings from './settings/IntegrationSettings';
import AuditLogs from './settings/AuditLogs';
import BackupSettings from './settings/BackupSettings';
import TelegramBotSettings from './settings/TelegramBotSettings';
import UserAndRolesManagement from './settings/UserAndRolesManagement';

// Imported from Integrations pages for merging
import { Marketplace, Webhooks, GatewayMonitoring, DataMapping, ApiDocumentation } from './Integrations';
import { Send } from 'lucide-react';

export default function Settings() {
  const { t } = useLanguage();
  const { info } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'general', label: t('general'), icon: SettingsIcon },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Lock },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'marketplace', label: t('marketplace'), icon: LayoutGrid },
    { id: 'integrations', label: t('api_keys'), icon: LinkIcon },
    { id: 'telegram', label: 'Telegram Bot', icon: Send },
    { id: 'webhooks', label: t('webhooks'), icon: Webhook },
    { id: 'gateway', label: t('api_gateway'), icon: Shield },
    { id: 'mapping', label: t('data_mapping'), icon: ArrowRightLeft },
    { id: 'docs', label: t('api_docs'), icon: Book },
    { id: 'sessions', label: t('sessions'), icon: Server },
    { id: 'backup', label: t('backup'), icon: Database },
    { id: 'audit', label: t('audit_logs'), icon: Activity },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'general': return <GeneralSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'security': return <SecuritySettings />;
      case 'users': return <UserAndRolesManagement />;
      case 'marketplace': return <Marketplace />;
      case 'integrations': return <IntegrationSettings />;
      case 'telegram': return <TelegramBotSettings />;
      case 'webhooks': return <Webhooks />;
      case 'gateway': return <GatewayMonitoring />;
      case 'mapping': return <DataMapping />;
      case 'docs': return <ApiDocumentation />;
      case 'sessions': return <SessionManagement />;
      case 'backup': return <BackupSettings />;
      case 'audit': return <AuditLogs />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{t('settings')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card className="p-2 overflow-hidden sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-bold rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-text-secondary hover:bg-surface-dark hover:text-text-primary'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-text-muted group-hover:text-text-primary'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <Card className="p-6 md:p-8 min-h-[600px]">
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
}
