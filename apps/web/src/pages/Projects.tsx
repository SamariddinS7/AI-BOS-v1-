import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Clock, CheckCircle, ListTodo, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, query, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/FirebaseProvider';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  deadline: string;
  progress: number;
  client_id?: string;
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  project_id: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '', status: 'active' as const });
  const [error, setError] = useState<Error | null>(null);
  const { user, loading } = useAuth();
  const { success, error: toastError, info } = useToast();

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'projects');
      } catch (e) {
        setError(e as Error);
      }
    });
    return () => unsubscribe();
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user || !selectedProject) return;

    const q = query(collection(db, 'tasks'), where('project_id', '==', selectedProject.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setProjectTasks(tasks);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'tasks');
      } catch (e) {
        setError(e as Error);
      }
    });
    return () => unsubscribe();
  }, [selectedProject, user, loading]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        progress: 0,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', deadline: '', status: 'active' });
      success('Loyiha muvaffaqiyatli qo\'shildi');
    } catch (error) {
      toastError('Xatolik yuz berdi');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Loyihalar</h2>
          <p className="text-text-muted text-base">Joriy va yakunlangan loyihalar boshqaruvi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 font-bold text-base active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Yangi Loyiha
        </button>
      </div>

      <AIInsightCard 
        title="Loyiha Xatarlari"
        description="Ba'zi loyihalar belgilangan muddatdan kechikmoqda. Resurslarni qayta taqsimlash tavsiya etiladi."
        impact="3 kun kechikish xavfi"
        confidence={90}
        action="Resurslarni ko'rish"
        type="risk"
        onAction={() => info("Resurslarni tahlil qilish jarayoni boshlandi...")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className={`p-6 hover:shadow-xl transition-all group cursor-pointer border-border-dark ${selectedProject?.id === project.id ? 'ring-2 ring-brand-600/50 border-brand-600/50' : 'hover:border-brand-600/30'}`}
            onClick={() => {
              setSelectedProject(project);
              info(`${project.name} loyihasi tanlandi`);
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-500 transition-colors text-base">{project.name}</h3>
              <span className={`px-2.5 py-1 text-base font-black uppercase tracking-wider rounded-full border ${
                project.status === 'completed' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : project.status === 'active'
                  ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-text-secondary text-base mb-6 line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center gap-4 text-base font-bold text-text-muted mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                <span>{project.deadline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-5 h-5" />
                <span>{project.progress}% bajarildi</span>
              </div>
            </div>
            <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  project.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-500'
                }`} 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </Card>
        ))}
      </div>

      {selectedProject && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6 border-brand-600/20 bg-brand-600/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <ListTodo className="w-6 h-6 text-brand-500" />
                Vazifalar: {selectedProject.name}
              </h3>
              <button 
                onClick={() => success("Yangi vazifa qo'shish oynasi ochilmoqda")}
                className="text-base font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1"
              >
                <Plus className="w-5 h-5" />
                Vazifa qo'shish
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => info(`${task.title} vazifasi tafsilotlari`)}
                  className="p-4 rounded-xl bg-surface-card border border-border-dark flex items-center gap-3 cursor-pointer hover:border-brand-600/30 transition-all"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'done' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-sky-500' : 'bg-text-muted'
                  }`} />
                  <span className={`text-base font-medium ${task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              {projectTasks.length === 0 && (
                <div className="col-span-full py-8 text-center text-text-muted italic flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 opacity-20" />
                  Hali vazifalar yo'q
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card border border-border-dark rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-text-primary mb-6">Yangi Loyiha Qo'shish</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Loyiha Nomi</label>
                <input 
                  type="text" 
                  required
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-text-primary focus:border-brand-500 outline-none transition-all text-base"
                  placeholder="Masalan: Marketing Kampaniyasi"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Tavsif</label>
                <textarea 
                  required
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-text-primary focus:border-brand-500 outline-none transition-all h-24 resize-none text-base"
                  placeholder="Loyiha haqida qisqacha..."
                />
              </div>
              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Muddat</label>
                <input 
                  type="date" 
                  required
                  value={newProject.deadline}
                  onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                  className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-text-primary focus:border-brand-500 outline-none transition-all text-base"
                />
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
