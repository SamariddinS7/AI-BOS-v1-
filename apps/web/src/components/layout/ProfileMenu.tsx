import React, { memo } from 'react';
import { User, Settings, LogOut, HelpCircle } from 'lucide-react';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileMenu = memo(({ isOpen, onClose, onLogout }: ProfileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-64 glass-panel rounded-xl shadow-2xl border border-border-dark z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-border-dark bg-surface-card">
        <p className="font-bold text-text-primary text-base">Admin User</p>
        <p className="text-base text-text-muted mt-0.5">admin@ai-bos.uz</p>
      </div>
      <div className="p-2 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-base text-text-secondary hover:bg-surface-dark rounded-lg transition-colors text-left font-medium">
          <User className="w-4 h-4 text-text-muted" />
          Profil
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-base text-text-secondary hover:bg-surface-dark rounded-lg transition-colors text-left font-medium">
          <Settings className="w-4 h-4 text-text-muted" />
          Sozlamalar
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-base text-text-secondary hover:bg-surface-dark rounded-lg transition-colors text-left font-medium">
          <HelpCircle className="w-4 h-4 text-text-muted" />
          Yordam
        </button>
      </div>
      <div className="p-2 border-t border-border-dark bg-surface-card/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-base text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-left font-medium"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </div>
  );
});

ProfileMenu.displayName = 'ProfileMenu';

export default ProfileMenu;
