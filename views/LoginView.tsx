
import React, { useState, useEffect } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'signup';
type RecoveryStep = 'request' | 'verify' | 'reset' | 'success';
type SignupStep = 'form' | 'verify' | 'ready';

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login Form States
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ identifier?: boolean; password?: boolean }>({});

  // Recovery States
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('request');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState({ password: '', confirm: '' });
  const [cooldown, setCooldown] = useState(0);

  // Signup States
  const [signupStep, setSignupStep] = useState<SignupStep>('form');
  const [signupData, setSignupData] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: { identifier?: boolean; password?: boolean } = {};
    
    // Validate fields
    if (!loginData.identifier.trim()) errors.identifier = true;
    if (!loginData.password.trim()) errors.password = true;

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      setError('Please enter your credentials to continue.');
      return;
    }

    setLoginErrors({});
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!signupData.name || !signupData.email || !signupData.phone || !signupData.shopName || !signupData.password) {
      setError('All fields are required.');
      return;
    }

    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSignupStep('verify');
      setOtp('');
      setCooldown(60);
    }, 1500);
  };

  const handleVerifySignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') {
        // Save user data to localStorage so ProfileView can reflect it
        const userData = {
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          shopName: signupData.shopName,
          address: '123 Business Hub, Sector 44, Gurgaon, Haryana, 122003',
          notifications: true,
          twoFactor: false
        };
        localStorage.setItem('shopmaster-user-profile', JSON.stringify(userData));
        setSignupStep('ready');
      } else {
        setError('Invalid code. Use 123456 to test.');
      }
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
            {mode === 'login' ? 'Welcome back.' : 'Scale your business.'}
          </h1>
          <p className="text-gray-400 mb-10 font-bold uppercase tracking-widest text-[10px] text-center md:text-left">
            {mode === 'login' ? 'Enter credentials' : 'Join ShopMaster Pro'}
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
                placeholder="Email or Phone" 
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
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
              )}
              <div className="text-right">
                <button type="button" onClick={() => setShowRecovery(true)} className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline">Trouble logging in?</button>
              </div>
              <button 
                type="submit"
                disabled={isLoading} 
                className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-2xl shadow-sky-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Log In'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSignupSubmit} noValidate>
              <InputField label="Full Name" placeholder="Rahul S." value={signupData.name} onChange={v => setSignupData({...signupData, name: v})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Email Address" placeholder="rahul@example.com" type="email" value={signupData.email} onChange={v => setSignupData({...signupData, email: v})} />
                <InputField label="Mobile Number" placeholder="+91 98765 43210" type="tel" value={signupData.phone} onChange={v => setSignupData({...signupData, phone: v})} />
              </div>
              <InputField label="Shop Name" placeholder="Superstore" value={signupData.shopName} onChange={v => setSignupData({...signupData, shopName: v})} />
              <InputField label="Security Key" type="password" placeholder="8+ characters" value={signupData.password} onChange={v => setSignupData({...signupData, password: v})} />
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
              )}
              <button 
                type="submit"
                disabled={isLoading} 
                className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Continue to Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 hidden md:flex items-center justify-center p-12">
        <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-10 relative border border-white">
           <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" alt="" className="rounded-[2.5rem] w-full h-[500px] object-cover" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-20">
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl text-center border border-white">
                 <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Built for India.</h3>
                 <p className="text-sm text-gray-400 font-bold uppercase tracking-widest text-[10px]">Trusted by 10k+ Merchants</p>
              </div>
           </div>
        </div>
      </div>

      {signupStep !== 'form' && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-xl">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 text-center animate-in zoom-in-95">
              {signupStep === 'verify' && (
                <>
                  <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">📱</div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Verify Mobile</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Code sent to {signupData.phone}</p>
                  
                  <input maxLength={6} placeholder="0 0 0 0 0 0" value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-2xl text-center text-2xl font-black tracking-widest outline-none focus:ring-4 focus:ring-sky-500/10 mb-6" />
                  
                  <button onClick={handleVerifySignup} className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">Verify & Create Account</button>
                  
                  <div className="mt-6 flex justify-between items-center px-2">
                    <button onClick={() => setSignupStep('form')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Change Details</button>
                    <button disabled={cooldown > 0} className="text-[10px] font-black text-sky-600 uppercase tracking-widest disabled:opacity-50">
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </>
              )}
              {signupStep === 'ready' && (
                <>
                  <div className="text-5xl mb-6">🎉</div>
                  <h2 className="text-2xl font-black text-gray-900 mb-4">You're In!</h2>
                  <p className="text-gray-500 font-medium mb-10">Your shop {signupData.shopName} is ready.</p>
                  <button onClick={onLogin} className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">Enter Dashboard</button>
                </>
              )}
           </div>
        </div>
      )}

      {showRecovery && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 relative animate-in zoom-in-95">
             <button onClick={() => setShowRecovery(false)} className="absolute top-10 right-10 text-gray-300 hover:text-gray-900 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Recovery</h2>
             <InputField label="Registered Email" placeholder="email@example.com" value={recoveryInput} onChange={setRecoveryInput} />
             <button onClick={() => setRecoveryStep('verify')} className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl mt-8">Send Code</button>
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
