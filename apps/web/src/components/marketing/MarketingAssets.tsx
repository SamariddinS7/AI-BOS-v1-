import React from 'react';
import Card from '../ui/Card';
import { Video, Image as ImageIcon, FileText, Play } from 'lucide-react';

interface Asset {
  id: string;
  type: 'video' | 'image' | 'doc';
  title: string;
  thumbnail: string;
  date: string;
}

const DUMMY_ASSETS: Asset[] = [
  { id: '1', type: 'video', title: 'Yangi Reklama 2025', thumbnail: 'https://images.unsplash.com/photo-1516280440614-629724128503', date: '2026-05-01' },
  { id: '2', type: 'image', title: 'Banner: Bahor Chegirmalari', thumbnail: 'https://images.unsplash.com/photo-1542744095-291d1f67b221', date: '2026-05-05' },
  { id: '3', type: 'doc', title: 'Marketing Strategiyasi Q1', thumbnail: '', date: '2026-05-08' },
];

export default function MarketingAssets() {
  return (
    <Card className="p-6 bg-surface-card border-border-dark">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">Marketing Aktivlari</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DUMMY_ASSETS.map((asset) => (
          <div key={asset.id} className="bg-surface-ground rounded-xl p-3 border border-border-dark flex items-center gap-4 hover:border-brand-500 transition-colors">
            <div className="w-16 h-16 rounded-lg bg-surface-card flex items-center justify-center overflow-hidden border border-border-dark">
              {asset.type === 'video' ? <Video className="w-8 h-8 text-brand-400" /> : 
               asset.type === 'image' ? <ImageIcon className="w-8 h-8 text-violet-400" /> : 
               <FileText className="w-8 h-8 text-teal-400" />}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-text-primary">{asset.title}</h4>
              <p className="text-sm text-text-muted">{asset.date}</p>
            </div>
            <button className="p-2 bg-surface-card rounded-md border border-border-dark text-text-secondary hover:text-white">
              <Play className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
