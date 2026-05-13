import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, Clock, MoreHorizontal, AlertCircle, ArrowDown, ArrowRight, ArrowUp, MessageSquare, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, addDoc, serverTimestamp, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import Comments from '../components/tasks/Comments';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/FirebaseProvider';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  project_id?: string;
  project_name?: string;
  createdAt: any;
}

interface Project {
  id: string;
  name: string;
}

const priorityConfig = {
  low: { color: 'text-text-muted', bg: 'bg-surface-ground', border: 'border-border-dark', icon: ArrowDown, label: 'Low', weight: 1 },
  medium: { color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20', icon: ArrowRight, label: 'Medium', weight: 2 },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: ArrowUp, label: 'High', weight: 3 },
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: AlertCircle, label: 'Critical', weight: 4 },
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'medium' as const, project_id: '' });
  const [error, setError] = useState<Error | null>(null);
  const { user, loading } = useAuth();
  const { success, error: toastError, info } = useToast();

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'tasks');
      } catch (e) {
        setError(e as Error);
      }
    });
    return () => unsubscribe();
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projList = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Project));
      setProjects(projList);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'projects');
      } catch (e) {
        setError(e as Error);
      }
    });
    return () => unsubscribe();
  }, [user, loading]);

  const toggleTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed
      });
    } catch (error) {
      toastError('Xatolik yuz berdi');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProject = projects.find(p => p.id === newTask.project_id);
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        completed: false,
        project_name: selectedProject?.name || '',
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewTask({ title: '', dueDate: '', priority: 'medium', project_id: '' });
      success('Vazifa muvaffaqiyatli qo\'shildi');
    } catch (error) {
      toastError('Xatolik yuz berdi');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' ? task.completed : !task.completed);
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    return matchesPriority && matchesStatus && matchesProject;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Vazifalar</h2>
          <p className="text-text-muted text-base">Jamoangizning ustuvor vazifalari va muddatlarini boshqaring</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsModalOpen(true);
              info("Yangi vazifa qo'shish oynasi ochilmoqda...");
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-lg shadow-brand-600/20 active:scale-95 font-bold text-base"
          >
            <Plus size={20} />
            <span className="font-medium">Yangi Vazifa</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-surface-card rounded-xl border border-border-dark">
        <div className="flex items-center gap-2 text-text-muted mr-2">
          <Filter size={18} />
          <span className="text-base font-bold uppercase tracking-wider">Filtrlar:</span>
        </div>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-surface-ground border border-border-dark rounded-lg px-3 py-2 text-base text-text-primary outline-none focus:border-brand-500">
          <option value="all">Barcha ustuvorliklar</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface-ground border border-border-dark rounded-lg px-3 py-2 text-base text-text-primary outline-none focus:border-brand-500">
          <option value="all">Barcha holatlar</option>
          <option value="completed">Bajarilgan</option>
          <option value="incomplete">Bajarilmagan</option>
        </select>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="bg-surface-ground border border-border-dark rounded-lg px-3 py-2 text-base text-text-primary outline-none focus:border-brand-500">
          <option value="all">Barcha loyihalar</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <AIInsightCard 
        title="Vazifalar Tahlili"
        description="Jamoa yuklamasi tahlil qilinmoqda. Ba'zi vazifalar muddati yaqinlashmoqda."
        impact="Muddati o'tish xavfi"
        confidence={92}
        action="Tahlilni ko'rish"
        type="warning"
        onAction={() => info("Vazifalar tahlili jarayoni boshlandi...")}
      />

      {/* Task List */}
      <div className="space-y-3 max-w-5xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => {
            const PriorityIcon = priorityConfig[task.priority].icon;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ 
                  opacity: task.completed ? 0.6 : 1, 
                  y: 0, 
                  scale: task.completed ? [1, 0.98, 1] : 1 
                }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.01, y: -2, zIndex: 10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`
                  group relative p-4 transition-all duration-300 border-border-dark
                  ${task.completed 
                    ? 'bg-surface-ground/50' 
                    : 'bg-surface-card hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5'
                  }
                `}>
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => {
                        toggleTask(task);
                        success(task.completed ? 'Vazifa tugallanmagan deb belgilandi' : 'Vazifa bajarildi!');
                      }}
                      className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                        ${task.completed 
                          ? 'bg-brand-500 border-brand-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.4)]' 
                          : 'border-text-muted/30 group-hover:border-brand-400 bg-transparent hover:bg-brand-500/10'
                        }
                      `}
                    >
                      <motion.div
                        initial={false}
                        animate={{ 
                          scale: task.completed ? 1 : 0,
                          rotate: task.completed ? 0 : -45
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Check size={16} strokeWidth={3} />
                      </motion.div>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-base font-bold truncate transition-colors ${task.completed ? 'text-text-muted line-through decoration-text-muted/50' : 'text-text-primary'}`}>
                          {task.title}
                        </h3>
                        {task.project_name && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-base font-black bg-surface-ground border border-border-dark text-text-muted uppercase tracking-wide">
                            {task.project_name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1.5">
                        <div className={`flex items-center gap-1.5 text-base font-medium ${task.completed ? 'text-text-muted' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`}>
                          <Calendar size={14} />
                          <span>{task.dueDate}</span>
                        </div>
                        {task.priority === 'critical' && !task.completed && (
                          <div className="flex items-center gap-1.5 text-base font-bold text-rose-400 animate-pulse">
                            <Clock size={14} />
                            <span>Due soon</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Priority Tag */}
                    <div className={`
                      hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-base font-black uppercase tracking-wider backdrop-blur-sm
                      ${priorityConfig[task.priority].bg}
                      ${priorityConfig[task.priority].color}
                      ${priorityConfig[task.priority].border}
                    `}>
                      <PriorityIcon size={14} />
                      <span className="capitalize">{priorityConfig[task.priority].label}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        className="p-2 text-text-muted hover:text-brand-400 hover:bg-surface-ground rounded-lg transition-all duration-200"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-ground rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200" onClick={() => info("Qo'shimcha amallar menyusi")}>
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {expandedTaskId === task.id && (
                    <Comments taskId={task.id} />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Empty State / Add New Placeholder */}
        <motion.button
          onClick={() => {
            setIsModalOpen(true);
            info("Yangi vazifa qo'shish oynasi ochilmoqda...");
          }}
          whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 border-2 border-dashed border-border-dark rounded-xl flex items-center justify-center gap-2 text-text-muted hover:text-text-primary hover:border-brand-500/30 transition-all group bg-surface-ground/30"
        >
          <Plus size={20} className="group-hover:text-brand-400 transition-colors" />
          <span className="text-base font-bold">Yangi vazifa qo'shish</span>
        </motion.button>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card border border-border-dark rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-text-primary mb-6">Yangi Vazifa Qo'shish</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Vazifa Nomi</label>
                <input 
                  type="text" 
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-text-primary focus:border-brand-500 outline-none transition-all text-base"
                  placeholder="Masalan: Hisobotni tayyorlash"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Muddat</label>
                  <input 
                    type="date" 
                    required
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-text-primary focus:border-brand-500 outline-none transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Ustuvorlik</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-text-primary focus:border-brand-500 outline-none transition-all text-base"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Loyiha</label>
                <select 
                  value={newTask.project_id}
                  onChange={e => setNewTask({...newTask, project_id: e.target.value})}
                  className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-text-primary focus:border-brand-500 outline-none transition-all text-base"
                >
                  <option value="">Loyihasiz</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-surface-ground text-text-primary rounded-xl font-bold text-base hover:bg-surface-dark transition-all"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-base hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
