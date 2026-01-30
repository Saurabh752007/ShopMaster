
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginViewProps {
  onLogin: (role: UserRole) => void;
}

type AuthMode = 'login' | 'signup';
type SignupStep = 'form' | 'verify' | 'ready';

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login Form States
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ identifier?: boolean; password?: boolean }>({});

  // Signup States
  const [signupStep, setSignupStep] = useState<SignupStep>('form');
  const [signupData, setSignupData] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: { identifier?: boolean; password?: boolean } = {};
    
    const id = loginData.identifier.trim().toLowerCase();
    const pass = loginData.password.trim();

    if (!id) errors.identifier = true;
    if (!pass) errors.password = true;

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      setError('Please enter your credentials to continue.');
      return;
    }

    setLoginErrors({});
    setIsLoading(true);
    
    /**
     * Role Mapping:
     * 1. 'admin' in identifier -> ADMIN (Full Control)
     * 2. Everything else -> USER (Operational Dashboard)
     */
    let assignedRole = UserRole.USER;
    if (id.includes('admin')) {
      assignedRole = UserRole.ADMIN;
    }

    setTimeout(() => {
      setIsLoading(false);
      const profile = {
        name: assignedRole === UserRole.ADMIN ? 'Admin User' : 'Standard User',
        email: id.includes('@') ? id : `${id}@shopmaster.pro`,
        role: assignedRole,
        shopName: 'ShopMaster Demo'
      };
      localStorage.setItem('shopmaster-user-profile', JSON.stringify(profile));
      onLogin(assignedRole);
    }, 1200);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!signupData.name || !signupData.email || !signupData.phone || !signupData.shopName || !signupData.password) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSignupStep('verify');
    }, 1500);
  };

  const handleVerifySignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSignupStep('ready');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row relative overflow-hidden">
      <div className="flex-1 flex flex-col justify-center px-6 md:px-24 lg:px-32 py-12 md:py-24">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-3xl mb-12 select-none justify-center md:justify-start">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            ShopMaster
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight text-center md:text-left">
            {mode === 'login' ? 'Access your portal.' : 'Start scaling today.'}
          </h1>
          <p className="text-gray-400 mb-10 font-bold uppercase tracking-widest text-[10px] text-center md:text-left">
            {mode === 'login' ? 'Try "admin" for full access or any other ID for User mode.' : 'Join the ShopMaster network.'}
          </p>

          <div className="bg-gray-100 p-1 rounded-2xl flex mb-10 shadow-inner">
            <button 
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-white text-sky-600 shadow-xl' : 'text-gray-400'}`}
            >
              Log In
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-sky-600 shadow-xl' : 'text-gray-400'}`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form className="space-y-6" onSubmit={handleLoginSubmit} noValidate>
              <InputField 
                label="Identifier" 
                placeholder="e.g. admin@shop.com" 
                icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                value={loginData.identifier}
                onChange={v => setLoginData({...loginData, identifier: v})}
                error={loginErrors.identifier}
              />
              <InputField 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                value={loginData.password}
                onChange={v => setLoginData({...loginData, password: v})}
                error={loginErrors.password}
              />
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
              )}
              <button 
                type="submit"
                disabled={isLoading} 
                className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-2xl shadow-sky-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm & Log In'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSignupSubmit} noValidate>
              <InputField label="Name" placeholder="Rahul S." value={signupData.name} onChange={v => setSignupData({...signupData, name: v})} />
              <InputField label="Shop Name" placeholder="Superstore" value={signupData.shopName} onChange={v => setSignupData({...signupData, shopName: v})} />
              <InputField label="Email" placeholder="rahul@example.com" type="email" value={signupData.email} onChange={v => setSignupData({...signupData, email: v})} />
              <button 
                type="submit"
                disabled={isLoading} 
                className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all mt-4"
              >
                {isLoading ? 'Processing...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 hidden md:flex items-center justify-center p-12">
        <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-10 relative border border-white">
           <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" alt="Dashboard" className="rounded-[2.5rem] w-full h-[500px] object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-[2.5rem]"></div>
        </div>
      </div>

      {signupStep !== 'form' && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-xl">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 text-center animate-in zoom-in-95">
              {signupStep === 'verify' && (
                <>
                  <div className="text-4xl mb-6">📱</div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Check your phone</h2>
                  <p className="text-sm text-gray-400 mb-8">We've sent a code to complete your setup.</p>
                  <button onClick={handleVerifySignup} className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl">Confirm Code</button>
                </>
              )}
              {signupStep === 'ready' && (
                <>
                  <div className="text-5xl mb-6">🎉</div>
                  <h2 className="text-2xl font-black text-gray-900 mb-4">Account Ready!</h2>
                  <p className="text-gray-500 font-medium mb-10">You're now ready to use ShopMaster Pro.</p>
                  <button onClick={() => onLogin(UserRole.ADMIN)} className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl">Enter Admin Panel</button>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const InputField: React.FC<{label: string, type?: string, icon?: string, placeholder?: string, value?: string, onChange?: (v: string) => void, error?: boolean}> = ({ label, type = "text", icon, placeholder, value, onChange, error }) => (
  <div className="space-y-2">
    <label className={`block text-[10px] font-black uppercase tracking-widest transition-colors ${error ? 'text-red-500' : 'text-gray-400'}`}>{label}</label>
    <div className="relative">
      {icon && (
        <span className={`absolute inset-y-0 left-4 flex items-center transition-colors ${error ? 'text-red-400' : 'text-gray-300'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} /></svg>
        </span>
      )}
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={e => onChange?.(e.target.value)} 
        className={`w-full ${icon ? 'pl-12' : 'px-6'} pr-4 py-4 bg-gray-50 rounded-2xl font-bold shadow-inner outline-none transition-all border ${
          error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-transparent focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500'
        }`} 
      />
    </div>
  </div>
);

export default LoginView;
