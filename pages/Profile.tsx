
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  ShoppingBag, 
  Heart, 
  BarChart3, 
  Edit3, 
  Check, 
  X, 
  Camera,
  Save,
  Trash2
} from 'lucide-react';

interface UserProfile {
  name: string;
  title: string;
  bio: string;
  avatarColor: string;
  avatarUrl?: string;
}

const Profile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Jane Cooper',
    title: 'Home Chef • Pro Member',
    bio: 'Passionate about Mediterranean cuisine and zero-waste cooking.',
    avatarColor: 'orange'
  });

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('spicesync_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('spicesync_profile', JSON.stringify(profile));
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setProfile(prev => ({ ...prev, avatarUrl: undefined }));
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <header className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16" />
        
        {!isEditing ? (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className={`w-32 h-32 bg-${profile.avatarColor}-100 rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-500`}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className={`w-16 h-16 text-${profile.avatarColor}-500`} />
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full shadow-lg"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">{profile.name}</h2>
              <p className="text-orange-500 text-sm font-bold uppercase tracking-widest">{profile.title}</p>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">{profile.bio}</p>
            </div>

            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 hover:text-orange-500 transition-all border border-transparent hover:border-orange-100"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-xl font-bold text-slate-800">Edit Profile</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group mx-auto md:mx-0">
                <div className={`w-32 h-32 bg-${profile.avatarColor}-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden`}>
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className={`w-16 h-16 text-${profile.avatarColor}-500`} />
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                
                <div className="absolute bottom-0 right-0 flex flex-col gap-2">
                  <button 
                    onClick={triggerFileInput}
                    className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-orange-600 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  {profile.avatarUrl && (
                    <button 
                      onClick={removeAvatar}
                      className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Culinary Title</label>
                  <input 
                    type="text" 
                    value={profile.title}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">About You</label>
                  <textarea 
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-600 text-sm leading-relaxed resize-none"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full md:w-auto px-8 py-3.5 bg-orange-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard icon={<Heart className="w-6 h-6 text-rose-500" />} label="Favorites" count="12" />
        <StatsCard icon={<ShoppingBag className="w-6 h-6 text-orange-500" />} label="Cooked" count="48" />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-4">Account Settings</h3>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
          <SettingItem icon={<BarChart3 className="text-blue-500" />} label="Nutritional Goals" />
          <SettingItem icon={<Bell className="text-amber-500" />} label="Expiry Alerts" />
          <SettingItem icon={<Shield className="text-emerald-500" />} label="Privacy & Data" />
          <SettingItem icon={<HelpCircle className="text-purple-500" />} label="Help Center" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-4">Integrations</h3>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
          <SettingItem label="Instacart Connection" badge="Active" />
          <SettingItem label="Samsung Smart Fridge" badge="Connect" />
        </div>
      </div>

      <button className="w-full bg-white text-rose-500 font-bold py-5 rounded-[2rem] border border-slate-100 flex items-center justify-center gap-3 mt-4 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm active:scale-98">
        <LogOut className="w-6 h-6" />
        Log Out
      </button>
    </div>
  );
};

const StatsCard: React.FC<{ icon: React.ReactNode; label: string; count: string }> = ({ icon, label, count }) => (
  <button className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-3 hover:border-orange-200 transition-all group">
    <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
    <div className="text-center">
      <div className="text-xl font-black text-slate-800">{count}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  </button>
);

const SettingItem: React.FC<{ icon?: React.ReactNode; label: string; badge?: string }> = ({ icon, label, badge }) => (
  <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-4">
      {icon && <div className="w-5 h-5 group-hover:scale-110 transition-transform">{icon}</div>}
      <span className="font-bold text-slate-700">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {badge && (
        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${badge === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
          {badge}
        </span>
      )}
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>
  </button>
);

export default Profile;
