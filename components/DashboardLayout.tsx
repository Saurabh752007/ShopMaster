
import React, { useState, useEffect } from 'react';
import { AppView, UserRole } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  userRole: UserRole;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  onNavigateToContent: (title: string, content: React.ReactNode) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentView, 
  userRole,
  onNavigate, 
  onLogout,
  onNavigateToContent
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState('General Feedback');
  const [currentAvatar, setCurrentAvatar] = useState(localStorage.getItem('user-avatar') || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin");

  useEffect(() => {
    const handleAvatarSync = (e: any) => {
      setCurrentAvatar(e.detail);
    };
    window.addEventListener('avatar-changed', handleAvatarSync as EventListener);
    return () => {
      window.removeEventListener('avatar-changed', handleAvatarSync as EventListener);
    };
  }, []);

  const allNavItems = [
    { view: AppView.OVERVIEW, label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: [UserRole.ADMIN, UserRole.USER] },
    { view: AppView.NEW_SALE, label: 'New Sale', icon: 'M12 4v16m8-8H4', roles: [UserRole.ADMIN, UserRole.USER] },
    { view: AppView.BILLING, label: 'Billing History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', roles: [UserRole.ADMIN, UserRole.USER] },
    { view: AppView.PRODUCTS, label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', roles: [UserRole.ADMIN, UserRole.USER] },
    { view: AppView.EMPLOYEES, label: 'Employees', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: [UserRole.ADMIN] },
    { view: AppView.CUSTOMERS, label: 'Customers', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: [UserRole.ADMIN, UserRole.USER] },
    { view: AppView.EXPORT, label: 'Export Data', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', roles: [UserRole.ADMIN, UserRole.USER] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const handleNavigateAction = (view: AppView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const handleStatusClick = () => {
    if (userRole !== UserRole.ADMIN) {
      alert("Access Denied: Only Admins can view system status.");
      return;
    }
    const content = (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusIndicator label="Billing Engine" status="Operational" delay="0ms" />
          <StatusIndicator label="Inventory Sync" status="Operational" delay="100ms" />
          <StatusIndicator label="API Gateway" status="Operational" delay="200ms" />
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
           <h4 className="text-gray-900 font-black mb-4 uppercase tracking-widest text-xs">Uptime History</h4>
           <div className="h-4 w-full flex gap-1">
             {Array.from({length: 40}).map((_, i) => (
               <div key={i} className="flex-1 bg-emerald-400 rounded-sm opacity-80 hover:opacity-100 transition-opacity" title="99.9% Uptime"></div>
             ))}
           </div>
           <p className="mt-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Global Availability: 99.98% over the last 30 days.</p>
        </div>
      </div>
    );
    onNavigateToContent("System Status", content);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSent(false);
      setSelectedEmoji(null);
      setFeedbackCategory('General Feedback');
    }, 2000);
  };

  const handleFooterLink = (title: string, summary: string) => {
    const content = (
      <div className="space-y-6 md:space-y-12">
        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
          <div className="text-3xl">✨</div>
          <div>
            <h4 className="text-gray-900 font-black mb-2">Summary</h4>
            <p className="text-gray-600 leading-relaxed font-medium">{summary}</p>
          </div>
        </section>
        <div className="prose prose-sky max-w-none text-gray-600">
           <p>Detailed documentation content for {title} will be rendered here...</p>
        </div>
      </div>
    );
    onNavigateToContent(title, content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showEmojis = feedbackCategory === 'General Feedback' || feedbackCategory === 'UI/UX Suggestion';

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Sticky Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <button 
          onClick={() => onNavigate(AppView.OVERVIEW)}
          className="flex items-center gap-2 text-sky-600 font-bold text-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
          ShopMaster
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-500 hover:text-sky-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[55] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 flex flex-col z-[60] transition-transform duration-300 md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:static'}
      `}>
        <div className="p-8 hidden md:block">
          <button 
            onClick={() => onNavigate(AppView.OVERVIEW)}
            className="flex items-center gap-2 text-sky-600 font-bold text-2xl focus:outline-none"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            ShopMaster
          </button>
          <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${
            userRole === UserRole.ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
          }`}>
            {userRole} Mode
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0">
          <div className="md:hidden px-4 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigation</div>
          <div className="md:hidden px-4 mb-6">
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
              userRole === UserRole.ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
            }`}>
              {userRole}
            </span>
          </div>
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavigateAction(item.view)}
              className={`w-full flex items-center gap-4 px-4 py-4 md:py-3 text-sm font-bold rounded-2xl transition-all focus:outline-none ${
                currentView === item.view 
                ? 'bg-sky-50 text-sky-600 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleNavigateAction(AppView.PROFILE)}
            className={`w-full flex items-center gap-4 px-4 py-4 md:py-3 text-sm font-bold rounded-2xl transition-all focus:outline-none ${
              currentView === AppView.PROFILE 
              ? 'bg-sky-50 text-sky-600 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile & Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">Version 2.5.4 Pro</p>
        </div>
      </aside>

      <main className="flex-1 min-h-screen flex flex-col bg-gray-50 w-full overflow-x-hidden">
        <div className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          <header className="hidden md:flex justify-end items-center mb-8">
             <button 
               onClick={() => onNavigate(AppView.PROFILE)}
               className={`w-11 h-11 rounded-2xl border flex items-center justify-center hover:shadow-xl transition-all overflow-hidden shadow-sm ${
                 currentView === AppView.PROFILE ? 'border-sky-500 ring-4 ring-sky-500/10' : 'border-gray-100 bg-white'
               }`}
             >
               <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
             </button>
          </header>
          {children}
        </div>

        <footer className="mt-auto bg-white border-t border-gray-100 no-print">
          <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
              <div className="lg:w-1/3 space-y-6">
                <div className="flex items-center gap-3 text-sky-600 font-black text-2xl tracking-tighter">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                  ShopMaster Pro
                </div>
                <p className="text-gray-500 text-sm leading-relaxed font-medium max-sm">
                  Smart retail management designed for India's evolving marketplace. Streamlining billing, inventory, and staff for thousands of merchants.
                </p>
              </div>

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-8">
                 <FooterCol title="Resources" links={['Documentation', 'Help Center', 'API Reference', 'Developer Hub']} onLink={handleFooterLink} />
                 <FooterCol title="Company" links={['About Us', 'Success Stories', 'Partner Program', 'Careers']} onLink={handleFooterLink} />
                 <FooterCol title="Legal" links={['Privacy Policy', 'Terms of Service', 'Security', 'SLA Documentation']} onLink={handleFooterLink} />
              </div>
            </div>

            <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Systems Online</p>
              </div>
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.25em] text-center">
                &copy; {new Date().getFullYear()} ShopMaster Pro • Built with ❤️ in India
              </div>
              <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-300">
                <button 
                  onClick={handleStatusClick}
                  className={`transition-colors focus:outline-none ${userRole === UserRole.ADMIN ? 'hover:text-sky-600' : 'opacity-30 cursor-not-allowed'}`}
                >
                  Status
                </button>
                <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="hover:text-sky-600 transition-colors focus:outline-none"
                >
                  Feedback
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-10 text-center">
              {feedbackSent ? (
                <div className="py-10 animate-in zoom-in duration-500">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">📬</div>
                   <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Feedback Received</h3>
                   <p className="text-gray-500 font-medium">Thank you for helping us grow!</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Send Feedback</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-8">Tell us what you think</p>
                  
                  <form onSubmit={handleFeedbackSubmit} className="space-y-6 text-left">
                     {showEmojis && (
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-in slide-in-from-top-4 duration-500">
                           {['😞', '😐', '😊', '😍'].map((emoji, idx) => (
                              <button 
                                key={idx} 
                                type="button" 
                                onClick={() => setSelectedEmoji(idx)}
                                className={`text-2xl transition-all p-2 rounded-xl hover:scale-125 ${
                                  selectedEmoji === idx 
                                  ? 'grayscale-0 scale-110 bg-white shadow-sm border border-gray-100' 
                                  : 'grayscale hover:grayscale-0'
                                }`}
                              >
                                {emoji}
                              </button>
                           ))}
                        </div>
                     )}
                     <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                       <select 
                         value={feedbackCategory}
                         onChange={(e) => {
                           setFeedbackCategory(e.target.value);
                           if (e.target.value === 'Bug Report' || e.target.value === 'Feature Request') {
                             setSelectedEmoji(null);
                           }
                         }}
                         className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-sky-500/10 cursor-pointer transition-all"
                       >
                         <option>General Feedback</option>
                         <option>Bug Report</option>
                         <option>Feature Request</option>
                         <option>UI/UX Suggestion</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Message</label>
                       <textarea 
                         required
                         rows={4}
                         placeholder={feedbackCategory === 'Bug Report' ? "Please describe the issue in detail..." : "How can we make ShopMaster better for you?"}
                         className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner"
                       />
                     </div>
                     <div className="flex flex-col gap-3 pt-4">
                        <button type="submit" className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl shadow-sky-100 active:scale-95 transition-all">Submit Feedback</button>
                        <button type="button" onClick={() => { setShowFeedbackModal(false); setSelectedEmoji(null); setFeedbackCategory('General Feedback'); }} className="py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Discard</button>
                     </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusIndicator: React.FC<{label: string, status: string, delay: string}> = ({ label, status, delay }) => (
  <div 
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4 duration-500"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-black text-gray-900">{status}</p>
  </div>
);

const FooterCol: React.FC<{title: string, links: string[], onLink: (t: string, s: string) => void}> = ({ title, links, onLink }) => (
  <div className="min-w-[140px]">
    <h4 className="text-gray-900 font-black text-[10px] uppercase tracking-[0.3em] mb-8 border-l-2 border-sky-500 pl-4">{title}</h4>
    <ul className="space-y-4">
      {links.map(l => (
        <li key={l}>
          <button 
            onClick={() => onLink(l, `Learn about our ${l.toLowerCase()} policies.`)} 
            className="text-gray-400 hover:text-sky-600 hover:translate-x-1 text-xs font-bold transition-all text-left block"
          >
            {l}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default DashboardLayout;
