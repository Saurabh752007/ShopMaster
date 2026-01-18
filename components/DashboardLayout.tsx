
import React, { useState, useRef, useEffect } from 'react';
import { AppView } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  onNavigateToContent: (title: string, content: React.ReactNode) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate, 
  onLogout,
  onNavigateToContent
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(localStorage.getItem('user-avatar') || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin");
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    // Listen for avatar changes from ProfileView
    const handleAvatarSync = (e: any) => {
      setCurrentAvatar(e.detail);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('avatar-changed', handleAvatarSync as EventListener);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('avatar-changed', handleAvatarSync as EventListener);
    };
  }, []);

  const navItems = [
    { view: AppView.OVERVIEW, label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { view: AppView.BILLING, label: 'Billing History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { view: AppView.PRODUCTS, label: 'Products & Categories', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { view: AppView.EMPLOYEES, label: 'Manage Employees', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { view: AppView.CUSTOMERS, label: 'Manage Customers', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { view: AppView.EXPORT, label: 'Data Export & Backup', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  ];

  const handleProfileNav = (view: AppView) => {
    onNavigate(view);
    setIsProfileOpen(false);
  };

  const handleFooterLink = (title: string, summary: string) => {
    const content = (
      <div className="space-y-12">
        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex gap-6 items-start">
          <div className="text-3xl">✨</div>
          <div>
            <h4 className="text-gray-900 font-black mb-2">Summary</h4>
            <p className="text-gray-600 leading-relaxed font-medium">{summary}</p>
          </div>
        </section>

        <section className="space-y-6">
          <h4 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
            Overview
          </h4>
          <p className="text-gray-600">
            Welcome to the ShopMaster Pro <strong>{title}</strong> page. This section is designed to provide you with the most up-to-date and relevant information regarding our services and your user experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
              <p className="text-xs font-black text-sky-600 uppercase mb-2">Key Point 1</p>
              <p className="text-sm font-bold text-gray-800">Seamless Integration</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Built for modern Indian retail ecosystems.</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
              <p className="text-xs font-black text-sky-600 uppercase mb-2">Key Point 2</p>
              <p className="text-sm font-bold text-gray-800">Advanced Security</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Enterprise-grade encryption for all data.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6 p-8 bg-gray-900 rounded-[2rem] text-white">
          <div className="flex justify-between items-start">
            <h4 className="text-xl font-black">Detailed Guidelines</h4>
            <div className="px-3 py-1 bg-sky-500 text-[10px] font-black uppercase rounded-full tracking-widest">Version 2.4</div>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center gap-4 text-gray-300 font-medium">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              Always ensure your inventory is synchronized with the latest GST norms.
            </li>
            <li className="flex items-center gap-4 text-gray-300 font-medium">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              Employee logins should be unique and rotated every 90 days.
            </li>
            <li className="flex items-center gap-4 text-gray-300 font-medium">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              Data backups are automatically performed daily at 2:00 AM IST.
            </li>
          </ul>
        </section>

        <p className="text-xs text-center text-gray-300 font-bold uppercase tracking-[0.2em] italic">
          — This is a simulated documentation page for the ShopMaster Pro Demo —
        </p>
      </div>
    );

    onNavigateToContent(title, content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-40">
        <div className="p-6">
          <button 
            onClick={() => onNavigate(AppView.OVERVIEW)}
            className="flex items-center gap-2 text-sky-600 font-bold text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            logo
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                currentView === item.view 
                ? 'bg-sky-50 text-sky-600 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen flex flex-col bg-gray-50">
        <div className="p-8 flex-1">
          <header className="flex justify-end items-center mb-8">
             <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="Toggle profile menu"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                  className="w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:shadow-xl hover:border-sky-100 transition-all active:scale-95 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-sm"
                >
                  <img 
                    src={currentAvatar} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=Admin`;
                    }}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-50 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
                        <img src={currentAvatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Admin Account</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Active Professional</p>
                      </div>
                    </div>
                    <div className="py-2">
                      <button 
                        onClick={() => handleProfileNav(AppView.PROFILE)}
                        className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profile Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-50 py-2">
                      <button 
                        onClick={onLogout}
                        className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
             </div>
          </header>
          {children}
        </div>

        <footer className="mt-auto bg-white border-t border-gray-200" role="contentinfo">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
              <div className="col-span-1">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xl mb-4 select-none">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                  ShopMaster Pro
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  Empowering 10,000+ local businesses across India with smart billing and inventory intelligence.
                </p>
              </div>
              
              <nav aria-label="Footer Resources" className="col-span-1">
                <h4 className="text-gray-900 font-bold text-sm uppercase tracking-widest mb-6">Resources</h4>
                <ul className="space-y-4">
                  <li><button onClick={() => handleFooterLink('Documentation', 'Comprehensive guides for setting up and mastering ShopMaster Pro.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Documentation</button></li>
                  <li><button onClick={() => handleFooterLink('Help Center', 'Our support team is here to assist you with any billing or technical queries.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Help Center</button></li>
                  <li><button onClick={() => handleFooterLink('API Reference', 'Developer tools to integrate ShopMaster data with your existing workflows.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">API Reference</button></li>
                  <li><button onClick={() => handleFooterLink('Community', 'Join the forum of retail entrepreneurs share tips and best practices.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Community</button></li>
                </ul>
              </nav>

              <nav aria-label="Footer Company" className="col-span-1">
                <h4 className="text-gray-900 font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
                <ul className="space-y-4">
                  <li><button onClick={() => handleFooterLink('About Us', 'Learn about our mission to digitize the Indian retail market.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">About Us</button></li>
                  <li><button onClick={() => handleFooterLink('Contact', 'Get in touch with our sales or support teams directly.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Contact</button></li>
                  <li><button onClick={() => handleFooterLink('Partners', 'Collaborate with us to expand your business ecosystem.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Partners</button></li>
                  <li><button onClick={() => handleFooterLink('Careers', 'Join our engineering and product teams building for India.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Careers</button></li>
                </ul>
              </nav>

              <nav aria-label="Footer Legal" className="col-span-1">
                <h4 className="text-gray-900 font-bold text-sm uppercase tracking-widest mb-6">Legal</h4>
                <ul className="space-y-4">
                  <li><button onClick={() => handleFooterLink('Privacy Policy', 'Your data security is our top priority. Learn how we handle your information.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Privacy Policy</button></li>
                  <li><button onClick={() => handleFooterLink('Terms of Service', 'The guidelines for using our business management suite.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Terms of Service</button></li>
                  <li><button onClick={() => handleFooterLink('Cookie Policy', 'Transparent disclosure on how we use cookies to improve experience.')} className="text-gray-500 hover:text-sky-600 text-sm transition-colors focus:outline-none focus-visible:underline">Cookie Policy</button></li>
                </ul>
              </nav>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} ShopMaster Pro. All rights reserved. Built with love in India.
              </div>
              <div className="flex gap-4" aria-label="Social Media Links">
                {['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].map(s => (
                  <button 
                    key={s} 
                    aria-label={`Follow us on ${s}`}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all border border-transparent hover:border-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <div className="w-5 h-5 bg-current mask-icon" style={{ WebkitMask: `url(https://cdn.simpleicons.org/${s}) center/contain no-repeat`, mask: `url(https://cdn.simpleicons.org/${s}) center/contain no-repeat` }}></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
