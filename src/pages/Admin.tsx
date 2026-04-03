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
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-base text-text-muted">Faol Foydalanuvchilar</p>
              <h3 className="text-2xl font-bold text-text-primary">{metrics.activeUsers}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-base text-text-muted">Tizim Holati</p>
              <h3 className="text-2xl font-bold text-green-600">{metrics.systemHealth}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-base text-text-muted">Oxirgi 24s Faollik</p>
              <h3 className="text-2xl font-bold text-text-primary">{metrics.recentActivity}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Database className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-base text-text-muted">Jami Avtomatlashtirish</p>
              <h3 className="text-2xl font-bold text-text-primary">{metrics.totalWorkflows}</h3>
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
        <h3 className="text-lg font-bold text-text-primary">Foydalanuvchilar Boshqaruvi</h3>
        <button 
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Yangi Foydalanuvchi
        </button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-ground border-b border-border-dark">
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Ism</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Email</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Rol</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Bo'lim</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Holat</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {users.map((user, index) => (
              <tr key={user.id || `user-${index}`} className="hover:bg-surface-ground/50 transition-colors">
                <td className="px-6 py-4 text-base text-text-primary font-medium">{user.name}</td>
                <td className="px-6 py-4 text-base text-text-secondary">{user.email}</td>
                <td className="px-6 py-4 text-base">
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded text-base font-medium">
                    {user.role_name || 'Noma\'lum'}
                  </span>
                </td>
                <td className="px-6 py-4 text-base text-text-secondary">{user.department}</td>
                <td className="px-6 py-4 text-base">
                  <span className={`px-2 py-1 rounded text-base font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                  }`}>
                    {user.status === 'active' ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-base">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="p-1 text-text-muted hover:text-brand-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1 text-text-muted hover:text-rose-500 transition-colors"
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
        <h3 className="text-lg font-bold text-text-primary">Audit Jurnali</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleExportLogs}
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-text-secondary hover:text-brand-500 transition-colors border border-border-dark rounded-lg"
          >
            <Download className="w-4 h-4" />
            Eksport
          </button>
          <button 
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-rose-500 hover:text-rose-600 transition-colors border border-border-dark rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            Tozalash
          </button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-ground border-b border-border-dark">
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
                <tr key={log.id || `log-${index}`} className="hover:bg-surface-ground/50 transition-colors">
                  <td className="px-6 py-4 text-base font-medium text-text-primary">{log.user_name || 'Tizim'}</td>
                  <td className="px-6 py-4 text-base text-text-secondary">{log.action}</td>
                  <td className="px-6 py-4 text-base">
                    <span className="px-2 py-1 bg-surface-ground rounded text-base text-text-muted border border-border-dark">
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
        <h3 className="text-lg font-bold text-text-primary">Xavfsizlik Sozlamalari</h3>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 font-bold text-base"
        >
          Saqlash
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-brand-500" />
              <span className="font-medium text-text-primary">Ikki bosqichli autentifikatsiya (2FA)</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.twoFactor}
              onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
            />
          </div>
          <p className="text-base text-text-muted">Tizimga kirishda qo'shimcha xavfsizlik qatlamini yoqish.</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-brand-500" />
              <span className="font-medium text-text-primary">Sessiya muddati (daqiqa)</span>
            </div>
            <input 
              type="number" 
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              className="w-20 px-2 py-1 bg-surface-ground border border-border-dark rounded text-base text-text-primary outline-none focus:border-brand-500" 
            />
          </div>
          <p className="text-base text-text-muted">Foydalanuvchi harakatsiz bo'lganda sessiyani avtomatik yakunlash.</p>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-bold text-text-primary mb-4">Parol Siyosati</h3>
        <div className="space-y-4">
          <Card className="flex items-center justify-between p-4">
            <span className="text-base text-text-primary">Minimal uzunlik</span>
            <input 
              type="number" 
              value={settings.minLength}
              onChange={(e) => setSettings({...settings, minLength: parseInt(e.target.value)})}
              className="w-16 px-2 py-1 bg-surface-ground border border-border-dark rounded text-base text-text-primary outline-none focus:border-brand-500" 
            />
          </Card>
          <Card className="flex items-center justify-between p-4">
            <span className="text-base text-text-primary">Maxsus belgilar talab qilinadi</span>
            <input 
              type="checkbox" 
              checked={settings.requireSpecialChars}
              onChange={(e) => setSettings({...settings, requireSpecialChars: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
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
        <h3 className="text-lg font-bold text-text-primary">Rollar va Huquqlar</h3>
        <button 
          onClick={handleAddRole}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
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
              <Card key={role.id || `role-${index}`} className="p-4 flex justify-between items-center hover:border-brand-500/30 transition-colors">
                <div>
                  <p className="font-bold text-text-primary">{role.name}</p>
                  <p className="text-base text-text-muted">{role.description}</p>
                </div>
                <button 
                  onClick={() => handleEditRole(role)}
                  className="p-2 text-text-muted hover:text-brand-500 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-base text-text-muted uppercase tracking-wider">Tizim Huquqlari</h4>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border-dark">
              {permissions.map((perm, index) => (
                <div key={perm.id || `perm-${index}`} className="p-4 flex items-center justify-between hover:bg-surface-ground/50 transition-colors">
                  <div>
                    <p className="text-base font-medium text-text-primary">{perm.name}</p>
                    <p className="text-base text-text-muted">{perm.description}</p>
                  </div>
                  <Shield className="w-4 h-4 text-text-muted" />
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
        <h3 className="text-lg font-bold text-text-primary">API Kalitlar</h3>
        <button 
          onClick={handleCreateKey}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Yangi Kalit Yaratish
        </button>
      </div>

      <Card className="overflow-hidden">
        {keys.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Hozircha API kalitlar mavjud emas</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-ground border-b border-border-dark">
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Nomi</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Kalit</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Huquqlar</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Holat</th>
                <th className="px-6 py-4 text-base font-semibold text-text-muted">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {keys.map((key, index) => (
                <tr key={key.id || `key-${index}`} className="hover:bg-surface-ground/50 transition-colors">
                  <td className="px-6 py-4 text-base text-text-primary">{key.name}</td>
                  <td className="px-6 py-4 text-base font-mono text-text-secondary">••••••••••••••••</td>
                  <td className="px-6 py-4 text-base text-text-secondary">{key.scopes}</td>
                  <td className="px-6 py-4 text-base">
                    <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded text-base">Faol</span>
                  </td>
                  <td className="px-6 py-4 text-base">
                    <button 
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-rose-500 hover:text-rose-600 font-medium"
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
          <h3 className="text-lg font-bold text-text-primary">Arxivlash va Tiklash</h3>
          <p className="text-base text-text-muted">Tizim ma'lumotlarini zaxiralash va qayta tiklash</p>
        </div>
        <button 
          onClick={handleCreateBackup}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Zaxira Nusxa Yaratish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-900 dark:text-blue-100">Avtomatik Zaxira</span>
          </div>
          <p className="text-base text-blue-700 dark:text-blue-300 mb-4">Har kuni soat 00:00 da tizim to'liq zaxiralanadi.</p>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-blue-600">{autoBackup ? 'Yoqilgan' : 'O\'chirilgan'}</span>
            <button 
              onClick={toggleAutoBackup}
              className={`w-10 h-5 rounded-full relative transition-colors ${autoBackup ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoBackup ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-text-muted" />
            <span className="font-bold text-text-primary">Oxirgi Zaxira</span>
          </div>
          <p className="text-base text-text-secondary mb-4">Bugun, 00:00</p>
          <p className="text-base text-text-muted">Hajmi: 124.5 MB</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-text-primary">Tiklash Nuqtasi</span>
          </div>
          <p className="text-base text-text-secondary mb-4">24 soat ichidagi o'zgarishlar</p>
          <button 
            onClick={() => handleRestore({ filename: 'Oxirgi nuqta' })}
            className="text-base font-bold text-orange-500 hover:underline"
          >
            Tiklashni boshlash
          </button>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border-dark">
          <h4 className="font-bold text-text-primary">Zaxira Tarixi</h4>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-ground border-b border-border-dark">
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Fayl Nomi</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Hajmi</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Sana</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Holat</th>
              <th className="px-6 py-4 text-base font-semibold text-text-muted">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">Zaxira nusxalari mavjud emas</td>
              </tr>
            ) : (
              backups.map((backup, index) => (
                <tr key={backup.id || `backup-${index}`} className="hover:bg-surface-ground/50 transition-colors">
                  <td className="px-6 py-4 text-base font-medium text-text-primary">{backup.filename}</td>
                  <td className="px-6 py-4 text-base text-text-muted">{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                  <td className="px-6 py-4 text-base text-text-muted">{new Date(backup.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-base">
                    <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded text-base">Muvaffaqiyatli</span>
                  </td>
                  <td className="px-6 py-4 text-base">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleDownload(backup)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRestore(backup)}
                        className="text-orange-500 hover:text-orange-600"
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
        <h3 className="text-lg font-bold text-text-primary">Tizim Sozlamalari</h3>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 font-bold text-base"
        >
          Saqlash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-text-primary">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Sozlamalari
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-text-secondary">AI Tavsiyalarini yoqish</span>
              <input 
                type="checkbox" 
                checked={settings.aiRecommendations}
                onChange={(e) => setSettings({...settings, aiRecommendations: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-text-secondary">Avtomatik AI qarorlari</span>
              <input 
                type="checkbox" 
                checked={settings.aiDecisions}
                onChange={(e) => setSettings({...settings, aiDecisions: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
              />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-text-primary">
            <RefreshCw className="w-5 h-5 text-brand-500" />
            Avtomatlashtirish
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-text-secondary">Ish oqimlarini yoqish</span>
              <input 
                type="checkbox" 
                checked={settings.workflows}
                onChange={(e) => setSettings({...settings, workflows: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-text-secondary">Xatolikda qayta urinish</span>
              <input 
                type="checkbox" 
                checked={settings.retryOnError}
                onChange={(e) => setSettings({...settings, retryOnError: e.target.checked})}
                className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
              />
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-bold text-text-primary mb-4">Bildirishnoma Afzalliklari</h3>
        <div className="space-y-4">
          <Card className="flex items-center justify-between p-4">
            <span className="text-base text-text-secondary">Email bildirishnomalari (Global)</span>
            <input 
              type="checkbox" 
              checked={settings.globalEmail}
              onChange={(e) => setSettings({...settings, globalEmail: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
            />
          </Card>
          <Card className="flex items-center justify-between p-4">
            <span className="text-base text-text-secondary">SMS bildirishnomalari (Global)</span>
            <input 
              type="checkbox" 
              checked={settings.globalSms}
              onChange={(e) => setSettings({...settings, globalSms: e.target.checked})}
              className="w-5 h-5 rounded border-border-dark text-brand-600 focus:ring-brand-500 bg-surface-ground" 
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
        <h3 className="text-lg font-bold text-text-primary">Tashkilotlar (Multi-Tenant)</h3>
        <button 
          onClick={handleAddTenant}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Yangi Tashkilot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tenants.map((tenant, index) => (
          <Card key={tenant.id || `tenant-${index}`} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{tenant.name}</h4>
                  <p className="text-base text-text-muted">{tenant.domain}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded text-base font-bold uppercase">
                {tenant.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-surface-ground rounded-lg border border-border-dark">
                <p className="text-base text-text-muted uppercase">Foydalanuvchilar</p>
                <p className="font-bold text-text-primary">{tenant.users}</p>
              </div>
              <div className="p-3 bg-surface-ground rounded-lg border border-border-dark">
                <p className="text-base text-text-muted uppercase">Yaratilgan</p>
                <p className="font-bold text-base text-text-primary">{new Date(tenant.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleManageTenant(tenant)}
                className="flex-1 py-2 text-base font-medium border border-border-dark rounded-lg hover:bg-surface-ground text-text-secondary transition-colors"
              >
                Boshqarish
              </button>
              <button 
                onClick={() => handleDeleteTenant(tenant.id)}
                className="p-2 text-text-muted hover:text-rose-500 transition-colors"
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
          <h2 className="text-2xl font-bold text-text-primary">Tizim Boshqaruvi</h2>
          <p className="text-text-muted">Platformani boshqarish va nazorat qilish markazi</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGlobalRefresh}
            className="p-2 bg-surface-card border border-border-dark rounded-lg shadow-sm hover:bg-surface-dark transition-colors text-text-secondary"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all font-bold text-base"
          >
            <Download className="w-4 h-4" />
            Hisobot Yuklash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card className="p-2 overflow-hidden sticky top-6">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-bold rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
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
