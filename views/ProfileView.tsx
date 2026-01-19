
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  onLogout?: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  phone: '+91 98765 43210',
  shopName: 'ShopMaster Superstore',
  address: '123 Business Hub, Sector 44, Gurgaon, Haryana, 122003',
  notifications: true,
  twoFactor: false
};

const ProfileView: React.FC<ProfileViewProps> = ({ onLogout }) => {
  // Load profile from localStorage if it exists, otherwise use defaults
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('shopmaster-user-profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [avatar, setAvatar] = useState<string>(localStorage.getItem('user-avatar') || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin");
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const syncAvatar = (newUrl: string) => {
    setAvatar(newUrl);
    localStorage.setItem('user-avatar', newUrl);
    window.dispatchEvent(new CustomEvent('avatar-changed', { detail: newUrl }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid format. Use JPG, PNG or WebP', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('File too large. Max limit 2MB', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        const result = reader.result as string;
        syncAvatar(result);
        setIsUploading(false);
        showToast('Profile photo updated');
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('shopmaster-user-profile', JSON.stringify(profile));
      setIsSaving(false);
      showToast('Profile details updated');
    }, 800);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowPassModal(false);
      showToast('Security credentials updated');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {toast && (
        <div className={`fixed top-8 right-8 z-[150] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-sky-500' : 'bg-white/20'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm font-black">{toast.message}</p>
        </div>
      )}

      <div className="mb-10 flex flex-col md:flex-row gap-8 items-center md:items-center text-center md:text-left">
        <div className="relative group">
          <div className={`w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center transform transition-all group-hover:rotate-3 relative ${isUploading ? 'bg-sky-50' : 'bg-gray-50'}`}>
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleAvatarChange} 
          />

          <div className="absolute -bottom-2 -right-2 flex gap-2">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-11 h-11 bg-gray-900 text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-sky-600 transition-all hover:scale-110 active:scale-95"
               title="Update Photo"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
          </div>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mt-1">{profile.shopName}</p>
          <div className="flex justify-center md:justify-start gap-2 mt-4">
             <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">Merchant Verified</span>
             <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-full">Pro Plan</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-100/50">
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-3 gap-2 overflow-x-auto no-scrollbar">
          {(['profile', 'security', 'preferences'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-4 px-6 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${
                activeTab === tab 
                ? 'bg-white text-sky-600 shadow-xl shadow-sky-100/50 border border-sky-50 translate-y-[-2px]' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 md:p-10">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <InputField label="Full Name" value={profile.name} onChange={(v) => setProfile({...profile, name: v})} />
                  <InputField label="Email Address" value={profile.email} onChange={(v) => setProfile({...profile, email: v})} />
                  <InputField label="Mobile Number" value={profile.phone} onChange={(v) => setProfile({...profile, phone: v})} />
                  <InputField label="Shop Name" value={profile.shopName} onChange={(v) => setProfile({...profile, shopName: v})} />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Business Address</label>
                  <textarea 
                    value={profile.address} 
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner min-h-[100px]"
                  />
               </div>
               <div className="flex justify-center md:justify-end mt-4">
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="w-full md:w-auto px-10 py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl shadow-sky-100 hover:bg-sky-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    Save Changes
                  </button>
               </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="p-8 bg-sky-50 rounded-[2rem] border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Credentials</h3>
                    <p className="text-xs text-sky-600 font-bold uppercase mt-1">Rotate regularly</p>
                  </div>
                  <button 
                    onClick={() => setShowPassModal(true)}
                    className="w-full md:w-auto px-6 py-4 bg-white text-gray-900 font-black text-xs uppercase rounded-xl border border-gray-200 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                  >
                    Change Password
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SecurityToggle 
                    icon="📱" 
                    title="Two-Factor Verification" 
                    desc={`Linked to ${profile.phone}`} 
                    enabled={profile.twoFactor} 
                    onToggle={() => setProfile({...profile, twoFactor: !profile.twoFactor})} 
                  />
                  <SecurityToggle 
                    icon="🛡️" 
                    title="Security Alerts" 
                    desc={`Sent to ${profile.email}`} 
                    enabled={profile.notifications} 
                    onToggle={() => setProfile({...profile, notifications: !profile.notifications})} 
                  />
               </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col gap-6">
                <div className="p-8 md:p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Active Session</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Exit secure environment</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="w-full md:w-auto px-10 py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-sky-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                  </button>
                </div>

                <div className="p-8 md:p-10 bg-red-50 rounded-[2.5rem] border border-red-100">
                  <h3 className="text-xl font-black text-red-900 mb-4 tracking-tight">Danger Zone</h3>
                  <p className="text-sm text-red-700/70 mb-8 font-medium">Permanently delete your shop database and all associated history. This is irreversible.</p>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full md:w-auto px-8 py-4 bg-red-600 text-white font-black text-xs uppercase rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                  >
                    Delete Shop Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showPassModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-10">
                <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Security Update</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                   <InputField label="Current Password" type="password" value={passForm.current} onChange={v => setPassForm({...passForm, current: v})} />
                   <InputField label="New Password" type="password" value={passForm.next} onChange={v => setPassForm({...passForm, next: v})} />
                   <InputField label="Confirm Password" type="password" value={passForm.confirm} onChange={v => setPassForm({...passForm, confirm: v})} />
                   <div className="flex flex-col md:flex-row gap-4 pt-4">
                      <button type="button" onClick={() => setShowPassModal(false)} className="py-4 font-black text-gray-400 hover:text-gray-600 transition-colors order-2 md:order-1">Cancel</button>
                      <button type="submit" className="flex-1 py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl shadow-sky-100 order-1 md:order-2">Update Credentials</button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-10 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">🗑️</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Confirm Reset</h3>
                <p className="text-gray-500 font-medium mb-8 leading-relaxed">Type <span className="font-black text-red-600">DELETE DATA</span> to confirm wiping {profile.shopName}.</p>
                <input 
                  type="text" 
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
                  className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-2xl text-center font-black text-gray-900 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                  placeholder="Verification here..."
                />
                <div className="flex flex-col gap-4 mt-8">
                   <button 
                     disabled={deleteConfirmText !== 'DELETE DATA'}
                     onClick={() => {
                       localStorage.removeItem('shopmaster-user-profile');
                       window.location.reload();
                     }}
                     className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-100 disabled:opacity-30 transition-all active:scale-95"
                   >
                     Confirm Reset
                   </button>
                   <button onClick={() => setShowDeleteModal(false)} className="py-4 font-black text-gray-400 hover:text-gray-600 transition-colors">Cancel Operation</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField: React.FC<{label: string, value: string, type?: string, onChange: (v: string) => void}> = ({ label, value, type = 'text', onChange }) => (
  <div className="space-y-2 text-left">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 font-bold transition-all shadow-inner"
    />
  </div>
);

const SecurityToggle: React.FC<{icon: string, title: string, desc: string, enabled: boolean, onToggle: () => void}> = ({ icon, title, desc, enabled, onToggle }) => (
  <div 
    onClick={onToggle}
    className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl bg-white hover:border-sky-500 hover:shadow-xl hover:shadow-sky-100/30 transition-all cursor-pointer group"
  >
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl group-hover:bg-sky-50 transition-colors">{icon}</div>
      <div className="text-left">
        <p className="font-black text-gray-900">{title}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{desc}</p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-sky-500' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`}></div>
    </div>
  </div>
);

export default ProfileView;
