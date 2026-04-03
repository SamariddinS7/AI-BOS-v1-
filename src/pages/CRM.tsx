import React, { useState, useEffect } from 'react';
import { UserCircle, Plus, Search, Phone, Mail } from 'lucide-react';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import { CustomerTable } from '../components/crm/CustomerTable';
import { SalesPipeline } from '../components/crm/SalesPipeline';
import { crmService } from '../services/crmService';
import { Customer, Deal } from '../types/crm';
import { useToast } from '../hooks/useToast';
import AddCustomerModal from '../components/crm/AddCustomerModal';

export default function CRM() {
  const { success, info } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  const fetchData = async () => {
    const customers = await crmService.getCustomers();
    const deals = await crmService.getDeals();
    setCustomers(customers as Customer[]);
    setDeals(deals as Deal[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDealMove = async (id: string, stage: string) => {
    await crmService.updateDealStage(id, stage as Deal['stage']);
    success(`Kelishuv bosqichi o'zgartirildi: ${stage}`);
    // Refresh deals
    const deals = await crmService.getDeals();
    setDeals(deals);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <AddCustomerModal 
        isOpen={isAddCustomerModalOpen} 
        onClose={() => setIsAddCustomerModalOpen(false)} 
        onAdd={fetchData}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Mijozlar (CRM)</h2>
          <p className="text-text-muted text-base">Mijozlar bazasi va aloqalar</p>
        </div>
        <button 
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 font-bold text-base"
        >
          <Plus className="w-5 h-5" />
          Mijoz Qo'shish
        </button>
      </div>

      <AIInsightCard 
        title="Mijozlar Tahlili"
        description="Mijozlar bazasi o'tgan oyga nisbatan 10% ga o'sdi. Biroq, 'Yangi' statusidagi mijozlarning 40% i bilan hali bog'lanilmagan."
        impact="+10% O'sish"
        confidence={85}
        action="Avtomatik SMS sozlash"
        type="opportunity"
        onAction={() => info("Avtomatik SMS sozlash jarayoni boshlandi...")}
      />

      <section>
        <h3 className="text-lg font-bold text-text-primary mb-4">Sales Pipeline</h3>
        <SalesPipeline deals={deals} onDealMove={handleDealMove} />
      </section>

      <section>
        <h3 className="text-lg font-bold text-text-primary mb-4">Customers</h3>
        <CustomerTable customers={customers} />
      </section>
    </div>
  );
}
