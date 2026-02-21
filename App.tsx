
import React, { useState, useEffect } from 'react';
import LoginView from './views/LoginView';
import DashboardLayout from './components/DashboardLayout';
import Overview from './views/Overview';
import NewSale from './views/NewSale';
import BillingManagement from './views/BillingManagement';
import ProductsManagement from './views/ProductsManagement';
import EmployeeManagement from './views/EmployeeManagement';
import CustomerManagement from './views/CustomerManagement';
import ExportManagement from './views/ExportManagement';
import ProfileView from './views/ProfileView';
import { AppView, ContentPage, UserRole } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER);
  const [contentPage, setContentPage] = useState<ContentPage | null>(null);
  const [billingSearchTerm, setBillingSearchTerm] = useState<string>('');

  useEffect(() => {
    const savedRole = sessionStorage.getItem('sm_session_role');
    const savedLoggedIn = sessionStorage.getItem('sm_session_logged_in');
    
    // Strict validation of role to prevent legacy 'MANAGER' role from persisting
    const isValidRole = savedRole === UserRole.ADMIN || savedRole === UserRole.USER;
    
    if (savedLoggedIn === 'true' && isValidRole) {
      setIsLoggedIn(true);
      setUserRole(savedRole as UserRole);
      setCurrentView(AppView.OVERVIEW);
    } else {
      // If invalid role found in session, force logout to clean state
      if (savedLoggedIn) handleLogout();
    }
  }, []);

  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    sessionStorage.setItem('sm_session_role', role);
    sessionStorage.setItem('sm_session_logged_in', 'true');
    setCurrentView(AppView.OVERVIEW);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(UserRole.USER);
    sessionStorage.removeItem('sm_session_role');
    sessionStorage.removeItem('sm_session_logged_in');
    // Clear legacy local storage items if necessary
    localStorage.removeItem('shopmaster-user-profile'); 
    setCurrentView(AppView.LOGIN);
  };

  const handleNavigateToContent = (title: string, content: React.ReactNode) => {
    setContentPage({ title, content });
    setCurrentView(AppView.CONTENT_PAGE);
  };

  const handleNavigateToBilling = (searchTerm: string) => {
    setBillingSearchTerm(searchTerm);
    setCurrentView(AppView.BILLING);
  };

  /**
   * Permissions Map:
   * ADMIN: Full access to everything.
   * USER: Access to daily operations (Sales, Billing, Products, Customers, Export, Profile).
   *       Restricted from Employee Management.
   */
  const canAccess = (view: AppView): boolean => {
    if (userRole === UserRole.ADMIN) return true;
    
    // User role permissions (operational access)
    const userAllowed = [
      AppView.OVERVIEW, 
      AppView.NEW_SALE, 
      AppView.BILLING, 
      AppView.PRODUCTS, 
      AppView.CUSTOMERS, 
      AppView.EXPORT, 
      AppView.PROFILE,
      AppView.CONTENT_PAGE
    ];
    return userAllowed.includes(view);
  };

  const handleNavigate = (view: AppView) => {
    if (canAccess(view)) {
      setCurrentView(view);
    } else {
      console.warn(`Unauthorized access attempt to ${view} by ${userRole}`);
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (!canAccess(currentView)) {
      return <Overview userRole={userRole} />;
    }

    switch (currentView) {
      case AppView.OVERVIEW: return <Overview userRole={userRole} />;
      case AppView.NEW_SALE: return <NewSale />;
      case AppView.BILLING: return <BillingManagement initialSearch={billingSearchTerm} />;
      case AppView.PRODUCTS: return <ProductsManagement userRole={userRole} onNavigateToBilling={handleNavigateToBilling} />;
      case AppView.EMPLOYEES: return <EmployeeManagement />;
      case AppView.CUSTOMERS: return <CustomerManagement onNavigateToBilling={handleNavigateToBilling} />;
      case AppView.EXPORT: return <ExportManagement userRole={userRole} />;
      case AppView.PROFILE: return <ProfileView onLogout={handleLogout} />;
      case AppView.CONTENT_PAGE: 
        return (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="bg-sky-50/50 px-8 md:px-12 py-10 border-b border-gray-100">
                <nav className="flex items-center gap-2 text-xs font-black text-sky-600 uppercase tracking-widest mb-6 select-none">
                  <span className="cursor-pointer hover:underline" onClick={() => setCurrentView(AppView.OVERVIEW)}>Dashboard</span>
                  <span>/</span>
                  <span className="text-gray-400">Resources</span>
                </nav>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
                  {contentPage?.title}
                </h1>
                <p className="text-lg text-gray-500 font-medium max-w-2xl">
                  {contentPage?.title === 'System Status' ? 'Detailed performance and infrastructure monitoring.' : 'Helpful guides and resources.'}
                </p>
              </div>
              <div className="p-8 md:p-12">
                <div className="prose prose-sky max-w-none text-gray-600 leading-relaxed text-lg font-medium space-y-6">
                  {contentPage?.content}
                </div>
                <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">Need further assistance?</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Our team is available for system support</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentView(AppView.OVERVIEW)} 
                    className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Return to Overview
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default: return <Overview userRole={userRole} />;
    }
  };

  return (
    <DashboardLayout 
      currentView={currentView} 
      userRole={userRole}
      onNavigate={handleNavigate} 
      onLogout={handleLogout}
      onNavigateToContent={handleNavigateToContent}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default App;
