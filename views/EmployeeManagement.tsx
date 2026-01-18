
import React, { useState, useMemo } from 'react';
import { Employee } from '../types';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ravi Kumar', role: 'Sales Associate', phone: '9876543210', loginCode: 'BN101', permissions: 'Billing, Customer List' },
  { id: '2', name: 'Priya Sharma', role: 'Inventory Manager', phone: '9123456789', loginCode: 'BN102', permissions: 'Inventory, Billing' },
  { id: '3', name: 'Amit Singh', role: 'Accountant', phone: '9988776655', loginCode: 'BN103', permissions: 'Reports, Billing' },
  { id: '4', name: 'Sneha Reddy', role: 'Customer Service', phone: '9765432109', loginCode: 'BN104', permissions: 'Customer List' },
  { id: '5', name: 'Gaurav Gupta', role: 'Sales Lead', phone: '9012345678', loginCode: 'BN105', permissions: 'All (except Settings)' },
  { id: '6', name: 'Anjali Dubey', role: 'Stock Assistant', phone: '9345678901', loginCode: 'BN106', permissions: 'Inventory' },
];

const ROLES = [
  { name: 'Sales Associate', permissions: 'Billing, Customer List' },
  { name: 'Inventory Manager', permissions: 'Inventory, Billing' },
  { name: 'Accountant', permissions: 'Reports, Billing' },
  { name: 'Customer Service', permissions: 'Customer List' },
  { name: 'Sales Lead', permissions: 'All (except Settings)' },
  { name: 'Stock Assistant', permissions: 'Inventory' },
];

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    role: ROLES[0].name,
    phone: '',
    loginCode: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.loginCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: ROLES[0].name,
      phone: '',
      loginCode: `BN${Math.floor(100 + Math.random() * 900)}`,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      phone: emp.phone,
      loginCode: emp.loginCode,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this employee? This action cannot be undone.')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      showToast('Employee removed successfully');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRole = ROLES.find(r => r.name === formData.role);
    
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData, permissions: selectedRole?.permissions || 'None' } 
          : emp
      ));
      showToast('Employee updated successfully');
    } else {
      const newEmployee: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        permissions: selectedRole?.permissions || 'None',
      };
      setEmployees(prev => [newEmployee, ...prev]);
      showToast('Employee added successfully');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-8 z-[110] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-sky-500' : 'bg-white/20'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={toast.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
            </svg>
          </div>
          <p className="text-sm font-black">{toast.message}</p>
        </div>
      )}

      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Employees</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Personnel & Access Control</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="group flex items-center gap-3 px-8 py-4 bg-sky-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
           <div className="relative max-w-xl">
             <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </span>
             <input 
               type="text" 
               placeholder="Search by name, role, or ID..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-4 bg-white border border-transparent rounded-[1.25rem] text-sm font-medium outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm"
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Employee</th>
                <th className="px-8 py-6">Contact</th>
                <th className="px-8 py-6">Login Code</th>
                <th className="px-8 py-6">Permissions</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="group hover:bg-sky-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black group-hover:bg-white transition-colors">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{emp.name}</p>
                          <p className="text-xs text-sky-600 font-bold">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-600">{emp.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 bg-gray-900 text-white font-mono text-[10px] rounded-lg tracking-widest shadow-sm">
                        {emp.loginCode}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {emp.permissions.split(', ').map(p => (
                          <span key={p} className="px-3 py-1 bg-white border border-gray-100 text-[10px] font-black uppercase text-gray-400 rounded-full tracking-tighter">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(emp)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">🔍</div>
                      <p className="text-gray-900 font-black">No employees found</p>
                      <p className="text-sm text-gray-400 font-bold mt-1">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900">{editingEmployee ? 'Update Profile' : 'New Employee'}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Personnel Information</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Login Code</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-mono font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all"
                    value={formData.loginCode}
                    onChange={(e) => setFormData({ ...formData, loginCode: e.target.value })}
                    placeholder="BN123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Role</label>
                <select 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {ROLES.map(role => (
                    <option key={role.name} value={role.name}>{role.name}</option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] text-sky-600 font-bold uppercase italic">
                  * Permissions will be set automatically based on role
                </p>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="w-full py-5 bg-sky-600 text-white rounded-[1.5rem] font-black text-sm shadow-2xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {editingEmployee ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  )}
                  {editingEmployee ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
