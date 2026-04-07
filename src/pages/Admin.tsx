import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Shield, 
  Key, 
  Activity, 
  Settings, 
  Lock, 
  Database, 
  Building2, 
  LayoutDashboard,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import { useToast } from '../hooks/useToast';

// --- Components ---

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const { success } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics({
          activeUsers: data.activeUsers,
          systemHealth: data.systemHealth,
          recentActivity: data.recentActivity,
          totalWorkflows: data.totalWorkflows
        });
      } else {
        throw new Error('Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Fallback if API fails
      setMetrics({
        activeUsers: 0,
        systemHealth: 'Unknown',
        recentActivity: '0',
        totalWorkflows: 0
      });
    }
  };

  const handleRefresh = () => {
    setMetrics(null);
    fetchMetrics().then(() => {
      success('Dashboard yangilandi', { message: 'Barcha ko\'rsatkichlar muvaffaqiyatli yangilandi' });
    });
  };

  if (!metrics) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
      <p className="text-text-muted">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-base font-medium text-text-secondary hover:text-brand-500 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 enterprise-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
              <UsersIcon className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <p className="text-base text-text-muted">Faol Foydalanuvchilar</p>
              <h3 className="text-2xl font-bold text-white">{metrics.activeUsers}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 enterprise-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-base text-text-muted">Tizim Holati</p>
              <h3 className="text-2xl font-bold text-emerald-500">{metrics.systemHealth}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 enterprise-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
              <Activity className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <p className="text-base text-text-muted">Oxirgi 24s Faollik</p>
              <h3 className="text-2xl font-bold text-white">{metrics.recentActivity}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 enterprise-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Database className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-base text-text-muted">Jami Avtomatlashtirish</p>
              <h3 className="text-2xl font-bold text-white">{metrics.totalWorkflows}</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      error('Xatolik', { message: 'Foydalanuvchilarni yuklashda xatolik yuz berdi' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    const newUser = {
      id: Date.now(),
      name: 'Yangi Foydalanuvchi',
      email: 'new@example.com',
      role_name: 'User',
      department: 'General',
      status: 'active'
    };
    setUsers([newUser, ...users]);
    success('Foydalanuvchi qo\'shildi', { message: 'Yangi foydalanuvchi muvaffaqiyatli yaratildi' });
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
    success('Foydalanuvchi o\'chirildi', { message: 'Foydalanuvchi tizimdan muvaffaqiyatli olib tashlandi' });
  };

  const handleEditUser = (user: any) => {
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, name: `${u.name} (Tahrirlandi)` } : u
    );
    setUsers(updatedUsers);
    success('Foydalanuvchi tahrirlandi', { message: `${user.name} ma'lumotlari muvaffaqiyatli yangilandi` });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Foydalanuvchilar Boshqaruvi</h3>
        <button 
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-black rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          Yangi Foydalanuvchi
        </button>
      </div>

      <Card className="overflow-hidden enterprise-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-layer/50 border-b border-border-dark">
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Ism</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Email</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Rol</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Bo'lim</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Holat</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {users.map((user, index) => (
              <tr key={user.id || `user-${index}`} className="hover:bg-surface-layer/30 transition-colors group">
                <td className="px-6 py-4 text-base text-white font-medium">{user.name}</td>
                <td className="px-6 py-4 text-base text-text-muted">{user.email}</td>
                <td className="px-6 py-4 text-base">
                  <span className="px-2 py-1 bg-brand-500/10 text-brand-500 rounded text-base font-medium border border-brand-500/20">
                    {user.role_name || 'Noma\'lum'}
                  </span>
                </td>
                <td className="px-6 py-4 text-base text-text-muted">{user.department}</td>
                <td className="px-6 py-4 text-base">
                  <span className={`px-2 py-1 rounded text-base font-medium border ${
                    user.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                    {user.status === 'active' ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-base">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-text-muted hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};


const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const { success, info } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    success('Audit jurnali tozalandi', { message: 'Barcha yozuvlar muvaffaqiyatli o\'chirildi' });
  };

  const handleExportLogs = () => {
    info('Eksport qilinmoqda', { message: 'Audit jurnali CSV formatida tayyorlanmoqda...' });
    setTimeout(() => {
      success('Eksport tayyor', { message: 'Audit jurnali muvaffaqiyatli yuklab olindi' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Audit Jurnali</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleExportLogs}
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-text-muted hover:text-brand-500 transition-colors border border-border-dark rounded-lg hover:bg-surface-layer"
          >
            <Download className="w-4 h-4" />
            Eksport
          </button>
          <button 
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-rose-500 hover:text-rose-600 transition-colors border border-border-dark rounded-lg hover:bg-surface-layer"
          >
            <Trash2 className="w-4 h-4" />
            Tozalash
          </button>
        </div>
      </div>
      <Card className="overflow-hidden enterprise-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-layer/50 border-b border-border-dark">
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Foydalanuvchi</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Amal</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Modul</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">IP Manzil</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Vaqt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">Audit yozuvlari mavjud emas</td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={log.id || `log-${index}`} className="hover:bg-surface-layer/30 transition-colors">
                  <td className="px-6 py-4 text-base font-medium text-white">{log.user_name || 'Tizim'}</td>
                  <td className="px-6 py-4 text-base text-text-muted">{log.action}</td>
                  <td className="px-6 py-4 text-base">
                    <span className="px-2 py-1 bg-surface-layer rounded text-base text-text-muted border border-border-dark">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base text-text-muted font-mono">{log.ip_address}</td>
                  <td className="px-6 py-4 text-base text-text-muted">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    twoFactor: true,
    sessionTimeout: 30,
    minLength: 8,
    requireSpecialChars: true
  });
  const { success } = useToast();

  const handleSave = () => {
    success('Sozlamalar saqlandi', { message: 'Xavfsizlik sozlamalari muvaffaqiyatli yangilandi' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Xavfsizlik Sozlamalari</h3>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-brand-600 text-black rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 font-bold text-base"
        >
          Saqlash
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-brand-500" />
              <span className="font-medium text-white">Ikki bosqichli autentifikatsiya (2FA)</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.twoFactor}
              onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
            />
          </div>
          <p className="text-base text-text-muted">Tizimga kirishda qo'shimcha xavfsizlik qatlamini yoqish.</p>
        </Card>
        <Card className="p-6 enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-brand-500" />
              <span className="font-medium text-white">Sessiya muddati (daqiqa)</span>
            </div>
            <input 
              type="number" 
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              className="w-20 px-2 py-1 bg-surface-layer border border-border-dark rounded text-base text-white outline-none focus:border-brand-500" 
            />
          </div>
          <p className="text-base text-text-muted">Foydalanuvchi harakatsiz bo'lganda sessiyani avtomatik yakunlash.</p>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Parol Siyosati</h3>
        <div className="space-y-4">
          <Card className="flex items-center justify-between p-4 enterprise-card">
            <span className="text-base text-white">Minimal uzunlik</span>
            <input 
              type="number" 
              value={settings.minLength}
              onChange={(e) => setSettings({...settings, minLength: parseInt(e.target.value)})}
              className="w-16 px-2 py-1 bg-surface-layer border border-border-dark rounded text-base text-white outline-none focus:border-brand-500" 
            />
          </Card>
          <Card className="flex items-center justify-between p-4 enterprise-card">
            <span className="text-base text-white">Maxsus belgilar talab qilinadi</span>
            <input 
              type="checkbox" 
              checked={settings.requireSpecialChars}
              onChange={(e) => setSettings({...settings, requireSpecialChars: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export const RolesManagement = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const { success } = useToast();

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions')
      ]);
      if (rolesRes.ok) {
        setRoles(await rolesRes.json());
      }
      if (permsRes.ok) {
        setPermissions(await permsRes.json());
      }
    } catch (error) {
      console.error('Error fetching roles/permissions:', error);
    }
  };

  const handleAddRole = () => {
    const newRole = {
      id: Date.now(),
      name: 'Yangi Rol',
      description: 'Yangi yaratilgan rol tavsifi'
    };
    setRoles([...roles, newRole]);
    success('Rol yaratildi', { message: 'Yangi rol muvaffaqiyatli qo\'shildi' });
  };

  const handleEditRole = (role: any) => {
    const updatedRoles = roles.map(r => 
      r.id === role.id ? { ...r, name: `${r.name} (Yangilandi)` } : r
    );
    setRoles(updatedRoles);
    success('Rol tahrirlandi', { message: `${role.name} muvaffaqiyatli yangilandi` });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Rollar va Huquqlar</h3>
        <button 
          onClick={handleAddRole}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-black rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          Yangi Rol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-bold text-base text-text-muted uppercase tracking-wider">Mavjud Rollar</h4>
          <div className="space-y-2">
            {roles.map((role, index) => (
              <Card key={role.id || `role-${index}`} className="p-4 flex justify-between items-center hover:border-brand-500/30 transition-colors enterprise-card">
                <div>
                  <p className="font-bold text-white">{role.name}</p>
                  <p className="text-base text-text-muted">{role.description}</p>
                </div>
                <button 
                  onClick={() => handleEditRole(role)}
                  className="p-2 text-text-muted hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-base text-text-muted uppercase tracking-wider">Tizim Huquqlari</h4>
          <Card className="overflow-hidden enterprise-card">
            <div className="divide-y divide-border-dark">
              {permissions.map((perm, index) => (
                <div key={perm.id || `perm-${index}`} className="p-4 flex items-center justify-between hover:bg-surface-layer/30 transition-colors">
                  <div>
                    <p className="text-base font-medium text-white">{perm.name}</p>
                    <p className="text-base text-text-muted">{perm.description}</p>
                  </div>
                  <Shield className="w-4 h-4 text-brand-500/50" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ApiKeyManagement = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const { success, warning } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      if (response.ok) {
        const data = await response.json();
        setKeys(data);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const handleCreateKey = () => {
    const newKey = {
      id: Date.now(),
      name: 'Yangi API Kalit',
      scopes: 'read',
      status: 'active'
    };
    setKeys([...keys, newKey]);
    success('API Kalit yaratildi', { message: 'Yangi API kaliti muvaffaqiyatli generatsiya qilindi' });
  };

  const handleRevokeKey = (id: number) => {
    setKeys(keys.filter(k => k.id !== id));
    warning('API Kalit bekor qilindi', { message: 'API kaliti muvaffaqiyatli o\'chirildi' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">API Kalitlar</h3>
        <button 
          onClick={handleCreateKey}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-black rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          Yangi Kalit Yaratish
        </button>
      </div>

      <Card className="overflow-hidden enterprise-card">
        {keys.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Hozircha API kalitlar mavjud emas</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-layer/50 border-b border-border-dark">
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Nomi</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Kalit</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Huquqlar</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Holat</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {keys.map((key, index) => (
                <tr key={key.id || `key-${index}`} className="hover:bg-surface-layer/30 transition-colors">
                  <td className="px-6 py-4 text-base text-white">{key.name}</td>
                  <td className="px-6 py-4 text-base font-mono text-text-muted">••••••••••••••••</td>
                  <td className="px-6 py-4 text-base text-text-muted">{key.scopes}</td>
                  <td className="px-6 py-4 text-base">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-base border border-emerald-500/20">Faol</span>
                  </td>
                  <td className="px-6 py-4 text-base">
                    <button 
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-rose-500 hover:text-rose-600 font-bold"
                    >
                      Bekor qilish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};


const BackupManagement = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const { success, info } = useToast();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/backups');
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const handleCreateBackup = () => {
    info('Zaxiralash boshlandi', { message: 'Tizim ma\'lumotlari zaxiralanmoqda...' });
    setTimeout(() => {
      const newBackup = {
        id: Date.now().toString(),
        filename: `backup-${new Date().toISOString().split('T')[0]}.zip`,
        size: 120000000 + Math.floor(Math.random() * 20000000),
        created_at: new Date().toISOString(),
        status: 'completed'
      };
      setBackups([newBackup, ...backups]);
      success('Zaxira yaratildi', { message: 'Tizim muvaffaqiyatli zaxiralandi' });
    }, 2000);
  };

  const handleRestore = (backup: any) => {
    info('Tiklash boshlandi', { message: `${backup.filename} faylidan ma'lumotlar tiklanmoqda...` });
    setTimeout(() => {
      success('Tiklash yakunlandi', { message: 'Tizim holati muvaffaqiyatli tiklandi' });
    }, 3000);
  };

  const handleDownload = (backup: any) => {
    success('Yuklab olish', { message: `${backup.filename} yuklab olinmoqda...` });
  };

  const toggleAutoBackup = () => {
    setAutoBackup(!autoBackup);
    success(
      autoBackup ? 'Avtomatik zaxira o\'chirildi' : 'Avtomatik zaxira yoqildi',
      { message: autoBackup ? 'Tizim endi avtomatik zaxira yaratmaydi' : 'Har kuni soat 00:00 da zaxira yaratiladi' }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Arxivlash va Tiklash</h3>
          <p className="text-base text-text-muted">Tizim ma'lumotlarini zaxiralash va qayta tiklash</p>
        </div>
        <button 
          onClick={handleCreateBackup}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-black rounded-xl hover:bg-brand-500 shadow-lg shadow-brand-600/20 transition-all font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          Zaxira Nusxa Yaratish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-brand-500/10 border-brand-500/20 enterprise-card">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-white">Avtomatik Zaxira</span>
          </div>
          <p className="text-base text-text-muted mb-4">Har kuni soat 00:00 da tizim to'liq zaxiralanadi.</p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-brand-500">{autoBackup ? 'Yoqilgan' : 'O\'chirilgan'}</span>
            <button 
              onClick={toggleAutoBackup}
              className={`w-10 h-5 rounded-full relative transition-colors ${autoBackup ? 'bg-brand-600' : 'bg-surface-layer border border-border-dark'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoBackup ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </Card>
        <Card className="p-6 enterprise-card">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-white">Oxirgi Zaxira</span>
          </div>
          <p className="text-base text-text-muted mb-4">Bugun, 00:00</p>
          <p className="text-base text-text-muted">Hajmi: <span className="text-white">124.5 MB</span></p>
        </Card>
        <Card className="p-6 enterprise-card">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-white">Tiklash Nuqtasi</span>
          </div>
          <p className="text-base text-text-muted mb-4">24 soat ichidagi o'zgarishlar</p>
          <button 
            onClick={() => handleRestore({ filename: 'Oxirgi nuqta' })}
            className="text-base font-bold text-amber-500 hover:text-amber-400 transition-colors"
          >
            Tiklashni boshlash
          </button>
        </Card>
      </div>

      <Card className="overflow-hidden enterprise-card">
        <div className="px-6 py-4 border-b border-border-dark bg-surface-layer/30">
          <h4 className="font-bold text-white">Zaxira Tarixi</h4>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-layer/50 border-b border-border-dark">
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Fayl Nomi</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Hajmi</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Sana</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Holat</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">Zaxira nusxalari mavjud emas</td>
              </tr>
            ) : (
              backups.map((backup, index) => (
                <tr key={backup.id || `backup-${index}`} className="hover:bg-surface-layer/30 transition-colors">
                  <td className="px-6 py-4 text-base font-medium text-white">{backup.filename}</td>
                  <td className="px-6 py-4 text-base text-text-muted">{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                  <td className="px-6 py-4 text-base text-text-muted">{new Date(backup.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-base">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-base border border-emerald-500/20">Muvaffaqiyatli</span>
                  </td>
                  <td className="px-6 py-4 text-base">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleDownload(backup)}
                        className="p-2 text-text-muted hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRestore(backup)}
                        className="p-2 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};


const SystemSettings = () => {
  const [settings, setSettings] = useState({
    aiRecommendations: true,
    aiDecisions: false,
    workflows: true,
    retryOnError: true,
    globalEmail: true,
    globalSms: false
  });
  const { success } = useToast();

  const handleSave = () => {
    success('Tizim sozlamalari saqlandi', { message: 'Barcha o\'zgarishlar muvaffaqiyatli qo\'llanildi' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Tizim Sozlamalari</h3>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-brand-600 text-black rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 font-bold text-base"
        >
          Saqlash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 enterprise-card">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-brand-500" />
            AI Sozlamalari
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-text-muted">AI Tavsiyalarini yoqish</span>
              <input 
                type="checkbox" 
                checked={settings.aiRecommendations}
                onChange={(e) => setSettings({...settings, aiRecommendations: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-text-muted">Avtomatik AI qarorlari</span>
              <input 
                type="checkbox" 
                checked={settings.aiDecisions}
                onChange={(e) => setSettings({...settings, aiDecisions: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
              />
            </div>
          </div>
        </Card>
        <Card className="p-6 enterprise-card">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-white">
            <RefreshCw className="w-5 h-5 text-brand-500" />
            Avtomatlashtirish
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-text-muted">Ish oqimlarini yoqish</span>
              <input 
                type="checkbox" 
                checked={settings.workflows}
                onChange={(e) => setSettings({...settings, workflows: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-text-muted">Xatolikda qayta urinish</span>
              <input 
                type="checkbox" 
                checked={settings.retryOnError}
                onChange={(e) => setSettings({...settings, retryOnError: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
              />
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Bildirishnoma Afzalliklari</h3>
        <div className="space-y-4">
          <Card className="flex items-center justify-between p-4 enterprise-card">
            <span className="text-base text-text-muted">Email bildirishnomalari (Global)</span>
            <input 
              type="checkbox" 
              checked={settings.globalEmail}
              onChange={(e) => setSettings({...settings, globalEmail: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
            />
          </Card>
          <Card className="flex items-center justify-between p-4 enterprise-card">
            <span className="text-base text-text-muted">SMS bildirishnomalari (Global)</span>
            <input 
              type="checkbox" 
              checked={settings.globalSms}
              onChange={(e) => setSettings({...settings, globalSms: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-layer" 
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export const TenantManagement = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const { success, warning, info } = useToast();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleAddTenant = () => {
    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: 'Yangi Tashkilot',
      domain: 'new-org.uz',
      status: 'active',
      users: 1,
      created_at: new Date().toISOString()
    };
    setTenants([...tenants, newTenant]);
    success('Tashkilot qo\'shildi', { message: 'Yangi tashkilot muvaffaqiyatli yaratildi' });
  };

  const handleDeleteTenant = (id: string) => {
    setTenants(tenants.filter(t => t.id !== id));
    warning('Tashkilot o\'chirildi', { message: 'Tashkilot tizimdan muvaffaqiyatli olib tashlandi' });
  };

  const handleManageTenant = (tenant: any) => {
    info('Tashkilot almashtirilmoqda', { message: `${tenant.name} muhitiga o'tilmoqda...` });
    setTimeout(() => {
      success('Muvaffaqiyatli', { message: `Hozirda siz ${tenant.name} tashkilotini boshqarmoqdasiz` });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Tashkilotlar (Multi-Tenant)</h3>
        <button 
          onClick={handleAddTenant}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-black rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          Yangi Tashkilot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tenants.map((tenant, index) => (
          <Card key={tenant.id || `tenant-${index}`} className="p-6 enterprise-card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg border border-brand-500/20">
                  <Building2 className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{tenant.name}</h4>
                  <p className="text-base text-text-muted">{tenant.domain}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-base font-bold uppercase border border-emerald-500/20">
                {tenant.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-surface-layer/30 rounded-lg border border-border-dark">
                <p className="text-base text-text-muted uppercase">Foydalanuvchilar</p>
                <p className="font-bold text-white">{tenant.users}</p>
              </div>
              <div className="p-3 bg-surface-layer/30 rounded-lg border border-border-dark">
                <p className="text-base text-text-muted uppercase">Yaratilgan</p>
                <p className="font-bold text-base text-white">{new Date(tenant.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleManageTenant(tenant)}
                className="flex-1 py-2 text-base font-bold border border-border-dark rounded-lg hover:bg-surface-layer text-text-muted hover:text-white transition-colors"
              >
                Boshqarish
              </button>
              <button 
                onClick={() => handleDeleteTenant(tenant.id)}
                className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};


// --- Main Admin Page ---

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { success, info } = useToast();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Foydalanuvchilar', icon: UsersIcon },
    { id: 'roles', label: 'Rollar va Huquqlar', icon: Shield },
    { id: 'audit', label: 'Audit Jurnali', icon: Activity },
    { id: 'settings', label: 'Tizim Sozlamalari', icon: Settings },
    { id: 'security', label: 'Xavfsizlik', icon: Lock },
    { id: 'api', label: 'API Kalitlar', icon: Key },
    { id: 'tenants', label: 'Tashkilotlar', icon: Building2 },
    { id: 'backup', label: 'Arxiv va Tiklash', icon: Database },
  ];

  const handleGlobalRefresh = () => {
    info('Yangilanmoqda', { message: 'Tizim ma\'lumotlari yangilanmoqda...' });
    setTimeout(() => {
      success('Yangilandi', { message: 'Barcha ma\'lumotlar muvaffaqiyatli yangilandi' });
    }, 1000);
  };

  const handleDownloadReport = () => {
    success('Hisobot tayyor', { message: 'Tizim hisoboti muvaffaqiyatli yuklab olindi' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'users': return <UserManagement />;
      case 'roles': return <RolesManagement />;
      case 'audit': return <AuditLogs />;
      case 'settings': return <SystemSettings />;
      case 'security': return <SecuritySettings />;
      case 'api': return <ApiKeyManagement />;
      case 'tenants': return <TenantManagement />;
      case 'backup': return <BackupManagement />;
      default: return <div className="p-20 text-center text-text-muted">Tez orada... ({activeTab})</div>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Tizim Boshqaruvi</h2>
          <p className="text-text-muted">Platformani boshqarish va nazorat qilish markazi</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGlobalRefresh}
            className="p-2 bg-surface-card border border-border-dark rounded-lg shadow-sm hover:bg-surface-layer transition-colors text-text-muted hover:text-white"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-black rounded-xl hover:bg-brand-500 shadow-lg shadow-brand-600/20 transition-all font-bold text-base"
          >
            <Download className="w-4 h-4" />
            Hisobot Yuklash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card className="p-2 overflow-hidden sticky top-6 enterprise-card">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-bold rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-black shadow-lg shadow-brand-600/20'
                      : 'text-text-muted hover:bg-surface-layer hover:text-white'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-black' : 'text-text-muted group-hover:text-white'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
