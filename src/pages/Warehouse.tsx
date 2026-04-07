import React, { useState } from 'react';
import { Package, Plus, Search, ArrowDownWideNarrow, Download, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import DrillDownModal from '../components/analytics/DrillDownModal';
import AddProductModal from '../components/warehouse/AddProductModal';

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'Mavjud' | 'Kam qolgan' | 'Tugagan';
  sales: number;
}

const initialProducts: Product[] = [
  { id: 1, code: '#PRD1', name: 'Mahsulot 1', category: 'Elektronika', stock: 100, price: 150000, status: 'Mavjud', sales: 450 },
  { id: 2, code: '#PRD2', name: 'Mahsulot 2', category: 'Kiyim-kechak', stock: 200, price: 85000, status: 'Mavjud', sales: 120 },
  { id: 3, code: '#PRD3', name: 'Mahsulot 3', category: 'Elektronika', stock: 15, price: 2100000, status: 'Kam qolgan', sales: 890 },
  { id: 4, code: '#PRD4', name: 'Mahsulot 4', category: 'Oziq-ovqat', stock: 500, price: 12000, status: 'Mavjud', sales: 3400 },
  { id: 5, code: '#PRD5', name: 'Mahsulot 5', category: 'Maishiy texnika', stock: 0, price: 450000, status: 'Tugagan', sales: 67 },
];

export default function Warehouse() {
  const { success, info } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isSorted, setIsSorted] = useState(false);
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const { formatCurrency } = useCurrencyFormatter();

  // Mock data for sparklines
  const sparklineData = [
    { value: 100 }, { value: 120 }, { value: 110 }, { value: 130 },
    { value: 125 }, { value: 140 }, { value: 135 }
  ];

  const handleSortBySales = () => {
    if (isSorted) {
      setProducts(initialProducts); // Reset to default
      setIsSorted(false);
    } else {
      const sorted = [...products].sort((a, b) => b.sales - a.sales);
      setProducts(sorted);
      setIsSorted(true);
    }
  };

  const handleAddProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const exportToCSV = () => {
    // Define CSV headers
    const headers = ['ID,Nomi,Kategoriya,Qoldiq,Narx,Sotuv hajmi,Holat'];
    
    // Map product data to CSV rows
    const rows = products.map(product => 
      `${product.code},"${product.name}",${product.category},${product.stock},${product.price},${product.sales},${product.status}`
    );

    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ombor_mahsulotlari.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="warehouse"
        initialLevel="month"
      />
      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setIsAddProductModalOpen(false)} 
        onAdd={handleAddProduct}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Ombor</h2>
          <p className="text-text-muted text-base">Mahsulotlar qoldig'i va harakati</p>
        </div>
        <button 
          onClick={() => setIsAddProductModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 font-bold text-base"
        >
          <Plus className="w-5 h-5" />
          Mahsulot Qo'shish
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          title="Jami Mahsulotlar" 
          value="1,245" 
          change="+5.00%" 
          trend="up" 
          icon={Package} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Jami Mahsulotlar Tahlili', metric: 'total_products'})}
        />
        <KPICard 
          title="Ombor Qiymati" 
          value={formatCurrency(450000000)} 
          change="+12.00%" 
          trend="up" 
          icon={DollarSign} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Ombor Qiymati Tahlili', metric: 'inventory_value'})}
        />
        <KPICard 
          title="Kam Qolganlar" 
          value="15" 
          change="-2" 
          trend="down" 
          icon={AlertTriangle} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Kam Qolganlar Tahlili', metric: 'low_stock'})}
        />
      </div>

      <AIInsightCard 
        title="Zaxira Tahlili"
        description="'Mahsulot 3' zaxirasi kritik darajada kam (15 dona), lekin talab yuqori (890 dona sotilgan). 'Mahsulot 5' esa umuman qolmagan."
        impact="Potentsial yo'qotish: 15mln so'm"
        confidence={92}
        action="Avtomatik buyurtma yaratish"
        onAction={() => info("Avtomatik buyurtma yaratish jarayoni boshlandi")}
        type="risk"
      />

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Mahsulot qidirish..." 
              onChange={() => info("Qidiruv natijalari yangilanmoqda...", { id: 'search-warehouse' })}
              className="w-full pl-10 pr-4 py-2 bg-surface-card border-none rounded-xl text-base text-text-primary placeholder-text-muted focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                handleSortBySales();
                info(isSorted ? "Saralash bekor qilindi" : "Sotuv bo'yicha saralandi");
              }}
              className={`flex items-center gap-2 px-4 py-2 text-base font-bold rounded-xl transition-all ${
                isSorted 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                  : 'text-text-secondary bg-surface-card hover:bg-surface-dark border border-border-dark'
              }`}
            >
              <ArrowDownWideNarrow className="w-5 h-5" />
              <span className="hidden sm:inline">{isSorted ? 'Sotuv bo\'yicha saralangan' : 'Sotuv bo\'yicha saralash'}</span>
              <span className="sm:hidden">Saralash</span>
            </button>
            <button 
              onClick={() => {
                exportToCSV();
                success("Ma'lumotlar CSV formatida yuklab olinmoqda");
              }}
              className="flex items-center gap-2 px-4 py-2 text-base font-bold text-text-secondary bg-surface-card rounded-xl hover:bg-surface-dark transition-all border border-border-dark"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Eksport</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-base font-black">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nomi</th>
                <th className="px-6 py-4">Kategoriya</th>
                <th className="px-6 py-4">Qoldiq</th>
                <th className="px-6 py-4">Narx</th>
                <th className="px-6 py-4">Sotuv hajmi</th>
                <th className="px-6 py-4">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  onClick={() => info(`${product.name} mahsuloti tafsilotlari`)}
                  className="hover:bg-surface-card/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-text-muted font-mono text-base">{product.code}</td>
                  <td className="px-6 py-4 font-bold text-text-primary">{product.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{product.category}</td>
                  <td className="px-6 py-4 font-black text-text-primary">{product.stock} dona</td>
                  <td className="px-6 py-4 text-text-primary">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 font-black text-brand-400">{product.sales.toLocaleString()} dona</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-base font-black uppercase tracking-wider rounded-full ${
                      product.status === 'Mavjud' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                      product.status === 'Kam qolgan' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' :
                      'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
