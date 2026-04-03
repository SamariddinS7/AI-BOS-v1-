import React, { useState, useEffect } from 'react';
import { Camera as CameraIcon, Video, Wifi, WifiOff, Activity, Plus, Settings, Disc, Aperture } from 'lucide-react';
import { cameraService } from '../services/cameraService';
import { Camera } from '../types';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import AddCameraModal from '../components/cameras/AddCameraModal';

export default function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadedCameras = cameraService.getAllCameras();
    setCameras(loadedCameras);
    if (loadedCameras.length > 0) {
      setSelectedCamera(loadedCameras[0]);
    }
  }, []);

  const handleAddCamera = (cameraData: any) => {
    // Mock adding camera
    const newCamera: Camera = {
      id: Math.random().toString(36).substr(2, 9),
      name: cameraData.name || 'New Camera',
      location: cameraData.location || 'Unknown',
      status: 'Online',
      type: 'Dome', // Default to Dome for new cameras
      ipAddress: cameraData.ipAddress || '0.0.0.0',
      lastActive: new Date().toISOString()
    };
    setCameras([...cameras, newCamera]);
    setSelectedCamera(newCamera);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Kuzatuv Kameralari</h2>
          <p className="text-text-muted">Ombor va hudud xavfsizligi</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 font-bold text-base"
        >
          <Plus className="w-4 h-4" />
          Kamera Qo'shish
        </button>
      </div>

      <AIInsightCard 
        title="Xavfsizlik Tahlili"
        description="Omborning 2-sektorida noodatiy harakat aniqlandi (02:45 AM). Tizim avtomatik ravishda xavfsizlik xizmatiga xabar yubordi."
        impact="Xavfsizlik darajasi yuqori"
        confidence={98}
        action="Videoyozuvni ko'rish"
        type="warning"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera List */}

        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 h-[calc(100vh-300px)] overflow-y-auto">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 sticky top-0 bg-surface-card z-10 py-2">
              <CameraIcon className="w-5 h-5 text-brand-500" />
              Faol Kameralar
            </h3>
            <div className="space-y-3">
              {cameras.map((camera) => (
                <div 
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                    selectedCamera?.id === camera.id 
                      ? 'bg-brand-900/20 border-brand-500/50 ring-1 ring-brand-500/50' 
                      : 'bg-surface-dark border-border-dark hover:border-brand-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] ${
                        camera.status === 'Online' ? 'bg-emerald-500 animate-pulse shadow-emerald-500/50' : 
                        camera.status === 'Maintenance' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-rose-500 shadow-rose-500/50'
                      }`} />
                      <span className={`font-bold text-base transition-colors ${selectedCamera?.id === camera.id ? 'text-brand-400' : 'text-text-primary group-hover:text-text-primary'}`}>{camera.name}</span>
                    </div>
                    <span className="text-base font-black uppercase tracking-wider text-text-muted bg-surface-ground px-1.5 py-0.5 rounded border border-border-dark">
                      {camera.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base text-text-muted font-medium">
                    <span>{camera.location}</span>
                    <span className="font-mono opacity-70">{camera.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <div className="bg-surface-dark p-4 rounded-xl border border-border-dark">
            <h4 className="font-bold text-text-primary text-base mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              Tizim Holati
            </h4>
            <div className="space-y-2 text-base font-medium text-text-secondary">
              <div className="flex justify-between items-center p-2 bg-surface-card rounded-lg border border-border-dark">
                <span>Server</span>
                <span className="text-emerald-400 font-bold">Online (99.9%)</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-card rounded-lg border border-border-dark">
                <span>Tarmoq yuki</span>
                <span className="text-brand-400 font-bold">45 Mbps</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-card rounded-lg border border-border-dark">
                <span>Saqlash joyi</span>
                <span className="text-yellow-400 font-bold">2.4 TB / 8 TB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Feed View */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-[600px] relative flex flex-col p-0 border-0 ring-1 ring-border-dark">
            {selectedCamera ? (
              <>
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white shadow-lg border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${selectedCamera.status === 'Online' ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]' : 'bg-gray-500'}`} />
                  <span className="text-base font-black tracking-widest">LIVE</span>
                  <span className="text-base text-gray-300 border-l border-white/20 pl-2 ml-2 font-medium">{selectedCamera.name}</span>
                </div>
                
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-black/80 transition-colors shadow-lg border border-white/10">
                    <Wifi className="w-4 h-4" />
                  </button>
                </div>

                {/* Mock Video Placeholder */}
                <div className="flex-1 bg-black flex items-center justify-center relative group overflow-hidden">
                  {/* Scanline effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-20"></div>
                  
                  {selectedCamera.status === 'Online' ? (
                    <div className="text-center z-10">
                      <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping"></div>
                        <Video className="w-10 h-10 text-brand-400 relative z-10" />
                      </div>
                      <p className="text-brand-100 text-base font-medium tracking-wide">Kamera tasviri yuklanmoqda...</p>
                      <p className="text-brand-500/50 text-base mt-2 font-mono tracking-widest">{selectedCamera.ipAddress}</p>
                    </div>
                  ) : (
                    <div className="text-center z-10">
                      <WifiOff className="w-16 h-16 text-rose-500 mx-auto mb-4 opacity-50" />
                      <p className="text-rose-500 text-base font-bold">Signal yo'q</p>
                      <p className="text-gray-500 text-base mt-2">Kamera oflayn rejimda</p>
                    </div>
                  )}
                  
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                    {[...Array(9)].map((_, i) => (
                      <div key={`grid-${i}`} className="border border-white/20" />
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="h-16 bg-surface-card border-t border-border-dark flex items-center justify-between px-6">
                  <div className="text-base text-brand-400 font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
                    {new Date().toLocaleString()}
                  </div>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-text-secondary hover:text-brand-400 transition-colors text-base font-bold uppercase tracking-wider group">
                      <Disc className="w-4 h-4 group-hover:text-rose-500 transition-colors" />
                      Yozib olish
                    </button>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-brand-400 transition-colors text-base font-bold uppercase tracking-wider group">
                      <Aperture className="w-4 h-4" />
                      Rasmga olish
                    </button>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-brand-400 transition-colors text-base font-bold uppercase tracking-wider group">
                      <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                      Sozlamalar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted font-medium">
                Kamera tanlanmagan
              </div>
            )}
          </Card>
        </div>
      </div>

      <AddCameraModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddCamera} 
      />
    </div>
  );
}
