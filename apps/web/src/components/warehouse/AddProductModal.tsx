import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useToast } from '../../hooks/useToast';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
}

export default function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    price: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: Date.now(),
      code: `#PRD${Math.floor(Math.random() * 1000)}`,
      status: parseInt(formData.stock) > 0 ? 'Mavjud' : 'Tugagan',
      sales: 0,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    });
    success('Mahsulot qo\'shildi', { message: `${formData.name} muvaffaqiyatli qo\'shildi` });
    onClose();
    setFormData({ name: '', category: '', stock: '', price: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mahsulot Qo'shish">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Nomi</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Kategoriya</label>
          <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Qoldiq</label>
            <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Narx</label>
            <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        </div>
        <button type="submit" className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold">Saqlash</button>
      </form>
    </Modal>
  );
}
