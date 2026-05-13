import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../ui/Card';
import { Search } from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseProvider';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';

interface Employee {
  id: string;
  name: string;
  department: string;
  checkIn?: string;
  checkOut?: string;
  confidence?: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}

export const HRAttendance = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { user, loading } = useAuth();

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, 'employees'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: Math.random() > 0.8 ? 'LATE' : 'PRESENT' // Mock status
      })) as Employee[];
      setEmployees(data);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'employees');
      } catch (e) {
        setError(e as Error);
      }
    });
    return () => unsubscribe();
  }, [user, loading]);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-[#111827] border-border-dark">
          <p className="text-text-muted text-base">TOTAL PRESENT</p>
          <h3 className="text-3xl font-bold text-text-primary">7</h3>
        </Card>
        <Card className="p-6 bg-[#111827] border-border-dark">
          <p className="text-text-muted text-base">TOTAL ABSENT</p>
          <h3 className="text-3xl font-bold text-text-primary">1</h3>
        </Card>
        <Card className="p-6 bg-[#111827] border-border-dark">
          <p className="text-text-muted text-base">LATE ARRIVALS</p>
          <h3 className="text-3xl font-bold text-text-primary">2</h3>
        </Card>
        <Card className="p-6 bg-[#111827] border-border-dark">
          <p className="text-text-muted text-base">EARLY DEPARTURES</p>
          <h3 className="text-3xl font-bold text-text-primary">0</h3>
        </Card>
      </div>

      {/* Records Table */}
      <Card className="p-6 bg-[#111827] border-border-dark">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-primary">DAVOMAT HISOBOTI</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Qidirish..." className="bg-[#0B1120] border border-border-dark rounded-lg pl-10 pr-4 py-2 text-base text-text-primary" />
            </div>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-text-muted text-base uppercase border-b border-border-dark">
              <th className="pb-4">Xodim</th>
              <th className="pb-4">Check-in</th>
              <th className="pb-4">Check-out</th>
              <th className="pb-4">Ishonch</th>
              <th className="pb-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-b border-border-dark">
                <td className="py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white">{emp.name[0]}</div>
                  <div>
                    <p className="font-bold text-text-primary">{emp.name}</p>
                    <p className="text-base text-text-muted">{emp.department}</p>
                  </div>
                </td>
                <td className="py-4 text-text-primary">08:00</td>
                <td className="py-4 text-text-primary">--:--</td>
                <td className="py-4">
                  <div className="w-24 h-2 bg-surface-ground rounded-full">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-base text-text-muted">90%</span>
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-base font-bold ${emp.status === 'PRESENT' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-amber-900/20 text-amber-400'}`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
