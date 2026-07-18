import React, { useState } from 'react';
import { X, Link as LinkIcon, Globe } from 'lucide-react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cameraData: any) => void;
}

export default function AddCameraModal({ isOpen, onClose, onSave }: AddCameraModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    sourceType: 'RTSP Stream',
    fpsLimit: '15',
    focalLength: '2.8',
    sensorWidth: '4.8',
    ipAddress: '',
    port: '554',
    streamPath: '/stream',
    username: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // Calculate H-FOV (approximate formula: 2 * arctan(sensorWidth / (2 * focalLength)))
  const calculateFOV = () => {
    const f = parseFloat(formData.focalLength);
    const w = parseFloat(formData.sensorWidth);
    if (f > 0 && w > 0) {
      const fov = 2 * Math.atan(w / (2 * f)) * (180 / Math.PI);
      return `${fov.toFixed(1)}°`;
    }
    return '';
  };

  const previewUrl = `rtsp://${formData.username ? formData.username + ':***@' : ''}${formData.ipAddress || '0.0.0.0'}:${formData.port}${formData.streamPath}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-card w-full max-w-2xl rounded-xl shadow-2xl border border-border-dark flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border-dark">
          <h2 className="text-xl font-bold text-text-primary">Add Camera</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-base font-medium text-text-muted mb-1">Camera Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Front Gate" 
                className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-base font-medium text-text-muted mb-1">Location</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Building A" 
                className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium text-text-muted mb-1">Source Type</label>
              <select 
                name="sourceType"
                value={formData.sourceType}
                onChange={handleChange}
                className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors appearance-none"
              >
                <option>RTSP Stream</option>
                <option>HTTP Stream</option>
                <option>USB Camera</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-text-muted mb-1">FPS Limit</label>
              <input 
                type="number" 
                name="fpsLimit"
                value={formData.fpsLimit}
                onChange={handleChange}
                className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Optical Parameters */}
          <div className="border border-border-dark rounded-lg p-4 bg-surface-dark/50">
            <h3 className="text-base font-bold text-brand-400 mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Optical Parameters (Physical Lens)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-base font-medium text-text-muted mb-1">Focal Length (mm)</label>
                <input 
                  type="number" 
                  name="focalLength"
                  value={formData.focalLength}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-text-muted mb-1">Sensor Width (mm)</label>
                <input 
                  type="number" 
                  name="sensorWidth"
                  value={formData.sensorWidth}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-text-muted mb-1">Calculated H-FOV</label>
                <input 
                  type="text" 
                  readOnly
                  value={calculateFOV()}
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-emerald-400 focus:outline-none transition-colors text-base text-center"
                />
              </div>
            </div>
            <p className="text-base text-text-muted mt-2">
              * Standard 1/3" sensor width is ~4.8mm. 2.8mm lens gives ~81° FOV.
            </p>
          </div>

          {/* Network Configuration */}
          <div className="border border-border-dark rounded-lg p-4 bg-surface-dark/50">
            <h3 className="text-base font-bold text-brand-400 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Network Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-base font-medium text-text-muted mb-1">IP Address / Host</label>
                <input 
                  type="text" 
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  placeholder="192.168.1.100"
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors font-mono text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-text-muted mb-1">Port</label>
                <input 
                  type="text" 
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors font-mono text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-text-muted mb-1">Stream Path</label>
                <input 
                  type="text" 
                  name="streamPath"
                  value={formData.streamPath}
                  onChange={handleChange}
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors font-mono text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-text-muted mb-1">Username</label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors font-mono text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-text-muted mb-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="******"
                  className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-500 transition-colors font-mono text-base"
                />
              </div>
              <div className="col-span-2 mt-2">
                <div className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-text-muted font-mono text-base overflow-x-auto whitespace-nowrap">
                  Preview: {previewUrl}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-dark flex justify-end gap-4 bg-surface-card rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-text-muted hover:text-text-primary transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors font-bold"
          >
            Save Camera
          </button>
        </div>
      </div>
    </div>
  );
}
