import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useToast } from '../../hooks/useToast';
import { crmService } from '../../services/crmService';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export default function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    region: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crmService.addCustomer({
      ...formData,
      account_value: 0,
      status: 'Lead',
    });
    success('Mijoz qo\'shildi', { message: `${formData.name} muvaffaqiyatli qo\'shildi` });
    onAdd();
    onClose();
    setFormData({ name: '', email: '', phone: '', company: '', industry: '', region: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mijoz Qo'shish">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Ism</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Telefon</label>
          <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Kompaniya</label>
          <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Sanoat</label>
          <input type="text" required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Hudud</label>
          <input type="text" required value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <button type="submit" className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold">Saqlash</button>
      </form>
    </Modal>
  );
}
