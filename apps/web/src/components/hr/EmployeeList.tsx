import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Plus, Search, Phone, Mail, FileText, Calendar, TrendingUp, UserCircle } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, addDoc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/FirebaseProvider";
import { handleFirestoreError, OperationType } from "../../lib/firestore-utils";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
}

interface Attendance {
  id: string;
  date: string;
  status: string;
}

interface KPI {
  id: string;
  metric: string;
  value: number;
  date: string;
}

export const EmployeeList = () => {
  const { success, error: toastError } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    department: "IT",
    position: "",
    status: "Faol"
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<{
    attendance: Attendance[];
    kpis: KPI[];
  }>({ attendance: [], kpis: [] });
  const [error, setError] = useState<Error | null>(null);
  const { user, loading } = useAuth();

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, "employees"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(list);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'employees');
      } catch (e) {
        setError(e as Error);
      }
    });
    return () => unsubscribe();
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user || !selectedEmployee) return;

    const attQuery = query(
      collection(db, "attendance"),
      where("employee_id", "==", selectedEmployee.id),
      orderBy("date", "desc"),
      limit(10)
    );
    const kpiQuery = query(
      collection(db, "kpi"),
      where("employee_id", "==", selectedEmployee.id),
      orderBy("date", "desc"),
      limit(5)
    );

    const unsubAtt = onSnapshot(attQuery, (snap) => {
      setEmployeeDetails(prev => ({
        ...prev,
        attendance: snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance))
      }));
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'attendance');
      } catch (e) {
        setError(e as Error);
      }
    });

    const unsubKpi = onSnapshot(kpiQuery, (snap) => {
      setEmployeeDetails(prev => ({
        ...prev,
        kpis: snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as KPI))
      }));
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'kpi');
      } catch (e) {
        setError(e as Error);
      }
    });

    return () => {
      unsubAtt();
      unsubKpi();
    };
  }, [selectedEmployee, user, loading]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "employees"), {
        ...newEmployee,
        createdAt: serverTimestamp()
      });
      setIsAddModalOpen(false);
      setNewEmployee({ name: "", email: "", phone: "", department: "IT", position: "", status: "Faol" });
      success("Xodim muvaffaqiyatli qo'shildi");
    } catch (error) {
      toastError("Xatolik yuz berdi");
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "all" || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            placeholder="Xodimlarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-card border border-border-dark rounded-xl pl-10 pr-4 py-2 text-base text-text-primary focus:border-brand-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={deptFilter} 
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-surface-card border border-border-dark rounded-xl px-4 py-2 text-base text-text-primary outline-none focus:border-brand-500"
          >
            <option value="all">Barcha bo'limlar</option>
            <option value="IT">IT</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all font-bold text-base"
          >
            <Plus className="w-5 h-5" />
            Xodim Qo'shish
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted border-b border-border-dark">
              <tr>
                <th className="px-6 py-4 font-medium">Xodim</th>
                <th className="px-6 py-4 font-medium">Bo'lim</th>
                <th className="px-6 py-4 font-medium">Lavozim</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Aloqa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id} 
                  className={`hover:bg-surface-card/50 transition-colors cursor-pointer ${selectedEmployee?.id === employee.id ? 'bg-brand-500/5' : ''}`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">{employee.name}</div>
                        <div className="text-base text-text-muted">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{employee.department}</td>
                  <td className="px-6 py-4 text-text-secondary">{employee.position}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-base font-bold uppercase tracking-wider border ${
                      employee.status === 'Faol' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-orange-900/20 text-orange-400 border-orange-900/50'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-surface-ground rounded-lg text-text-muted hover:text-brand-400 transition-all">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-surface-ground rounded-lg text-text-muted hover:text-brand-400 transition-all">
                        <Mail className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader>
              <CardTitle>
                <Calendar className="w-5 h-5 text-brand-400" />
                Oxirgi Davomat ({selectedEmployee.name})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeDetails.attendance.map((att) => (
                  <div key={att.id} className="flex justify-between items-center p-3 rounded-xl bg-surface-ground/30 border border-border-dark/50">
                    <span className="text-base font-medium text-text-primary">{att.date}</span>
                    <span className={`px-2 py-0.5 rounded text-base font-bold uppercase ${
                      att.status === 'Present' ? 'text-emerald-400 bg-emerald-900/20' : 'text-rose-400 bg-rose-900/20'
                    }`}>
                      {att.status}
                    </span>
                  </div>
                ))}
                {employeeDetails.attendance.length === 0 && (
                  <div className="text-center py-4 text-text-muted text-base italic">
                    Davomat ma'lumotlari mavjud emas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                KPI Ko'rsatkichlari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeDetails.kpis.map((kpi) => (
                  <div key={kpi.id} className="space-y-2">
                    <div className="flex justify-between text-base">
                      <span className="text-text-secondary">{kpi.metric}</span>
                      <span className="font-bold text-text-primary">{kpi.value}%</span>
                    </div>
                    <div className="w-full bg-surface-dark rounded-full h-1.5">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${kpi.value}%` }}
                      />
                    </div>
                  </div>
                ))}
                {employeeDetails.kpis.length === 0 && (
                  <div className="text-center py-4 text-text-muted text-base italic">
                    KPI ma'lumotlari mavjud emas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card border border-border-dark rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-text-primary mb-6">Yangi Xodim Qo'shish</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-1.5">F.I.SH</label>
                <input 
                  type="text" 
                  required
                  value={newEmployee.name}
                  onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-base text-text-primary focus:border-brand-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Email</label>
                  <input 
                    type="email" 
                    required
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-base text-text-primary focus:border-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Telefon</label>
                  <input 
                    type="text" 
                    required
                    value={newEmployee.phone}
                    onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-base text-text-primary focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Bo'lim</label>
                  <select 
                    value={newEmployee.department}
                    onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                    className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-base text-text-primary focus:border-brand-500 outline-none transition-all"
                  >
                    <option value="IT">IT</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-1.5">Lavozim</label>
                  <input 
                    type="text" 
                    required
                    value={newEmployee.position}
                    onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
                    className="w-full bg-surface-ground border border-border-dark rounded-xl px-4 py-2.5 text-base text-text-primary focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-surface-ground text-text-primary rounded-xl font-bold text-base hover:bg-surface-dark transition-all"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-base hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
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
};
