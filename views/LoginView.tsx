
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
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (signupData.email === 'admin@shopmaster.in') {
      setError('This email is already associated with an account.');
      return;
    }
    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSignupStep('verify');
      setOtp(''); // Clear any previous OTP input
      setCooldown(60);
    }, 1500);
  };

  const handleVerifySignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Secret OTP for demo: 123456
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') {
        setSignupStep('ready');
      } else {
        setError('Incorrect verification code. Please check and try again.');
      }
    }, 1200);
  };

  const handleCancelSignupVerify = () => {
    setSignupStep('form');
    setOtp('');
    setError(null);
  };

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput) return;
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      setRecoveryStep('verify');
      setCooldown(60);
      setOtp('');
    }, 1500);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') setRecoveryStep('reset');
      else setError('Invalid verification code.');
    }, 1200);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.password !== newPass.confirm) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRecoveryStep('success');
    }, 1500);
  };

  const closeModals = () => {
    setShowRecovery(false);
    setRecoveryStep('request');
    setSignupStep('form');
    setOtp('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row relative overflow-hidden">
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-3xl mb-12 select-none">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            logo
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            {mode === 'login' ? 'Welcome back to ShopMaster.' : 'Start your retail journey today.'}
          </h1>
          <p className="text-gray-500 mb-8 font-medium">
            {mode === 'login' 
              ? 'Enter your credentials to access your dashboard and manage sales.' 
              : 'Join 10,000+ Indian merchants using smart billing and inventory.'}
          </p>

          <div className="bg-gray-100 p-1 rounded-2xl flex mb-10 shadow-inner">
            <button 
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-white text-sky-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Log In
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-sky-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <InputField 
                label="Email or Phone" 
                icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                placeholder="admin@shopmaster.in"
                required
              />
              <InputField 
                label="Password" 
                type="password" 
                icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                placeholder="••••••••"
                required
              />

              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => setShowRecovery(true)}
                  className="text-sky-600 text-[10px] font-black uppercase tracking-widest hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl shadow-2xl shadow-sky-100 flex items-center justify-center gap-3 transition-all transform active:scale-95"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Enter Dashboard'}
                {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
              </button>
            </form>
          ) : (
            <form className="space-y-6 animate-in fade-in slide-in-from-bottom-2" onSubmit={handleSignupSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Full Name" 
                  placeholder="Rahul S." 
                  value={signupData.name} 
                  onChange={v => setSignupData({...signupData, name: v})}
                  required 
                />
                <InputField 
                  label="Shop Name" 
                  placeholder="Superstore" 
                  value={signupData.shopName} 
                  onChange={v => setSignupData({...signupData, shopName: v})}
                  required 
                />
              </div>
              <InputField 
                label="Email or Phone" 
                placeholder="rahul@example.com" 
                value={signupData.email} 
                onChange={v => setSignupData({...signupData, email: v})}
                required 
              />
              <InputField 
                label="Create Password" 
                type="password" 
                placeholder="Min. 8 characters" 
                value={signupData.password} 
                onChange={v => setSignupData({...signupData, password: v})}
                required 
              />
              
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 transition-all transform active:scale-95"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Create My Account'}
                {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
              </button>
            </form>
          )}

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300"><span className="px-4 bg-white">Trusted by 10k+</span></div>
          </div>

          <button className="w-full py-4 border border-gray-100 rounded-2xl flex items-center justify-center gap-4 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-10 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Legal: By continuing, you agree to our <a href="#" className="text-sky-600 hover:underline">Terms</a> and <a href="#" className="text-sky-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 hidden md:flex items-center justify-center p-12">
        <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden relative border border-white">
           <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" alt="Shop illustration" className="rounded-[2rem] w-full h-[500px] object-cover" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-20">
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white text-center">
                 <div className="text-4xl mb-4">✨</div>
                 <h3 className="text-xl font-black text-gray-900 mb-2">Designed for India.</h3>
                 <p className="text-sm text-gray-500 font-medium">From Kirana shops to large retail chains, ShopMaster handles it all.</p>
              </div>
           </div>
        </div>
      </div>

      {/* SIGNUP VERIFICATION MODAL */}
      {signupStep !== 'form' && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-white relative">
              <div className="p-12">
                 {signupStep === 'verify' && (
                   <div className="text-center animate-in zoom-in-95 duration-500">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-inner">📬</div>
                      <h2 className="text-3xl font-black text-gray-900 mb-3">Verification Required</h2>
                      <p className="text-gray-500 font-medium mb-10">We've sent a 6-digit code to <span className="text-gray-900 font-bold">{signupData.email}</span>.</p>
                      
                      <form onSubmit={handleVerifySignup} className="space-y-6">
                        <input 
                          required
                          maxLength={6}
                          placeholder="0 0 0 0 0 0"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                        />
                        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">{error}</p>}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={handleCancelSignupVerify}
                            className="py-5 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                          >
                            Back
                          </button>
                          <button 
                            type="submit"
                            disabled={isLoading}
                            className="py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm'}
                          </button>
                        </div>

                        <div className="pt-4 flex flex-col gap-2">
                           <button 
                            type="button" 
                            disabled={cooldown > 0} 
                            onClick={handleSignupSubmit}
                            className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline disabled:opacity-30"
                           >
                            {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Code'}
                           </button>
                           <button 
                            type="button"
                            onClick={handleCancelSignupVerify}
                            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                           >
                            Change Details
                           </button>
                        </div>
                      </form>
                   </div>
                 )}

                 {signupStep === 'ready' && (
                   <div className="text-center animate-in zoom-in-95 duration-500">
                      <div className="w-24 h-24 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center text-5xl mb-8 mx-auto shadow-inner">🎉</div>
                      <h2 className="text-3xl font-black text-gray-900 mb-3">Welcome Aboard!</h2>
                      <p className="text-gray-500 font-medium mb-10 leading-relaxed">Your account for <span className="font-bold text-gray-900">{signupData.shopName}</span> is active and ready for business.</p>
                      <button 
                        onClick={onLogin}
                        className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-2xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95"
                      >
                        Enter Your Shop
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* RECOVERY MODAL */}
      {showRecovery && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-12 relative">
              <button 
                type="button"
                onClick={closeModals}
                className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {recoveryStep === 'request' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-[1.5rem] flex items-center justify-center text-3xl mb-8">🔑</div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Security Reset</h2>
                  <p className="text-gray-500 font-medium mb-10 leading-relaxed">Enter your registered email to receive a secure recovery code.</p>
                  <form onSubmit={handleRequestOTP} className="space-y-6">
                    <InputField 
                      label="Recovery Email" 
                      placeholder="email@example.com"
                      value={recoveryInput}
                      onChange={setRecoveryInput}
                      required
                    />
                    <button 
                      disabled={isLoading}
                      className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Request Recovery Code'}
                    </button>
                  </form>
                </div>
              )}

              {recoveryStep === 'verify' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center text-3xl mb-8 mx-auto">📧</div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Identity Check</h2>
                  <p className="text-gray-500 font-medium mb-10 leading-relaxed">Code sent to <span className="text-gray-900 font-bold">{recoveryInput}</span>.</p>
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <input 
                      required
                      maxLength={6}
                      placeholder="0 0 0 0 0 0"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 animate-bounce">{error}</p>}
                    <button 
                      disabled={isLoading}
                      className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
                    >
                      {isLoading ? 'Checking...' : 'Verify Access'}
                    </button>
                    <div className="pt-4">
                      <button 
                        type="button"
                        disabled={cooldown > 0}
                        onClick={handleRequestOTP}
                        className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline disabled:text-gray-300"
                      >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {recoveryStep === 'reset' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center text-3xl mb-8">🛡️</div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">New Security Key</h2>
                  <p className="text-gray-500 font-medium mb-10 leading-relaxed">Set a strong password to protect your shop data.</p>
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <InputField label="New Password" type="password" value={newPass.password} onChange={v => setNewPass({...newPass, password: v})} required />
                    <InputField label="Confirm Password" type="password" value={newPass.confirm} onChange={v => setNewPass({...newPass, confirm: v})} required />
                    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                    <button 
                      disabled={isLoading}
                      className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95"
                    >
                      {isLoading ? 'Updating...' : 'Confirm New Password'}
                    </button>
                  </form>
                </div>
              )}

              {recoveryStep === 'success' && (
                <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-8 mx-auto shadow-inner">✨</div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Key Updated</h2>
                  <p className="text-gray-500 font-medium mb-12 leading-relaxed">Security reset complete. You may now return to the login screen.</p>
                  <button 
                    type="button"
                    onClick={closeModals}
                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Components
const InputField: React.FC<{
  label: string, 
  type?: string, 
  icon?: string, 
  placeholder?: string, 
  required?: boolean,
  value?: string,
  onChange?: (v: string) => void
}> = ({ label, type = "text", icon, placeholder, required, value, onChange }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative group">
      {icon && (
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-sky-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} />
          </svg>
        </span>
      )}
      <input 
        required={required}
        type={type} 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-12' : 'px-6'} pr-4 py-4 rounded-2xl border border-transparent bg-gray-50 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner`}
      />
    </div>
  </div>
);

export default LoginView;
