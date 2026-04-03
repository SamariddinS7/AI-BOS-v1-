import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Card from '../components/ui/Card';

interface AddExpenseProps {
  onBack: () => void;
}

export default function AddExpense({ onBack }: AddExpenseProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New expense:', { category, amount, date, description });
    // Handle submission logic here
    setCategory('');
    setAmount('');
    setDate('');
    setDescription('');
    onBack();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-surface-card transition-colors">
          <ArrowLeft className="w-6 h-6 text-text-primary" />
        </button>
        <h2 className="text-2xl font-bold text-text-primary">Yangi Xarajat Qo'shish</h2>
      </div>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-bold text-text-secondary mb-2">Kategoriya</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-dark border border-border-dark text-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="Masalan: Ofis ijarasi"
                required
              />
            </div>
            <div>
              <label className="block text-base font-bold text-text-secondary mb-2">Summa</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-dark border border-border-dark text-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-base font-bold text-text-secondary mb-2">Sana</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-dark border border-border-dark text-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-all [color-scheme:dark]"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-bold text-text-secondary mb-2">Tavsif</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-dark border border-border-dark text-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              rows={4}
              placeholder="Xarajat haqida qisqacha ma'lumot..."
              required
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 font-bold text-base"
            >
              <Save className="w-4 h-4" />
              Saqlash
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
