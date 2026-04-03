import React, { useState } from 'react';
import { Camera, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function ProfileSettings() {
  const { success, error, info } = useToast();
  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '+998 90 123 45 67',
    bio: 'Bosh hisobchi va tizim administratori.',
    role: 'Administrator',
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        error("Rasm hajmi 1MB dan oshmasligi kerak");
        return;
      }
      success("Rasm muvaffaqiyatli yuklandi");
      // In a real app, you would upload the file here
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Ism kiritilishi shart";
    if (!formData.lastName.trim()) newErrors.lastName = "Familiya kiritilishi shart";
    if (!formData.email.trim()) newErrors.email = "Email kiritilishi shart";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      error("Iltimos, barcha majburiy maydonlarni to'ldiring");
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setSuccessMessage('');
  };

  const handleSubmit = () => {
    if (validate()) {
      setSuccessMessage("Ma'lumotlar muvaffaqiyatli saqlandi!");
      success("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profil ma'lumotlari</h3>
        <button 
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
        >
          {successMessage ? <Check className="w-4 h-4" /> : null}
          Saqlash
        </button>
      </div>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-green-200 dark:border-green-800">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="flex items-center gap-6 mb-8">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-gray-400 border-4 border-white dark:border-gray-900 shadow-sm transition-transform group-hover:scale-105">
            {formData.firstName[0]}{formData.lastName[0]}
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg border-2 border-white dark:border-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-4 h-4" />
          </div>
        </div>
        <div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Rasm o'zgartirish
          </button>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
            JPG, GIF yoki PNG. Maksimal 1MB.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Ism</label>
          <input 
            type="text" 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 outline-none transition-all text-gray-900 dark:text-gray-100 ${
              errors.firstName 
                ? 'border-red-300 dark:border-red-900 focus:ring-red-200 dark:focus:ring-red-900/20' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-base text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Familiya</label>
          <input 
            type="text" 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 outline-none transition-all text-gray-900 dark:text-gray-100 ${
              errors.lastName 
                ? 'border-red-300 dark:border-red-900 focus:ring-red-200 dark:focus:ring-red-900/20' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 outline-none transition-all text-gray-900 dark:text-gray-100 ${
              errors.email 
                ? 'border-red-300 dark:border-red-900 focus:ring-red-200 dark:focus:ring-red-900/20' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Rol (O'zgartirib bo'lmaydi)</label>
          <input 
            type="text" 
            value={formData.role}
            disabled
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Ruxsatlar</label>
          <div className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed text-base">
            Barcha modullarga kirish (Full Access)
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
        <textarea 
          rows={4} 
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 resize-none"
        ></textarea>
        <p className="text-base text-gray-400 dark:text-gray-500 mt-1 text-right">
          {formData.bio.length}/500
        </p>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Parolni o'zgartirish</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Yangi parol</label>
            <input 
              type="password" 
              placeholder="Kamida 8 ta belgi"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Joriy parol (Tasdiqlash uchun)</label>
            <input 
              type="password" 
              placeholder="Joriy parolni kiriting"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => success("Parol muvaffaqiyatli o'zgartirildi")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Parolni saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
