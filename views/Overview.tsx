
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Product, Bill, Customer, UserRole } from '../types';

type TimeRange = '7d' | '30d' | '90d';

const GENERATE_DATA = (days: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      name: date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
      value: Math.floor(Math.random() * (5000 - 1000) + 1000),
    };
  });
};

const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#a855f7', '#64748b'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={12}
      />
    </g>
  );
};

const Overview: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(GENERATE_DATA(7));
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const [stats, setStats] = useState({
    totalSales: 0,
    activeEmployees: 0,
    totalCustomers: 0,
    todayBills: 0,
    pieData: [] as any[]
  });

  const loadLiveStats = () => {
    const bills: Bill[] = JSON.parse(localStorage.getItem('sm_bills') || '[]');
    const products: Product[] = JSON.parse(localStorage.getItem('sm_products') || '[]');
    const customers: Customer[] = JSON.parse(localStorage.getItem('sm_customers') || '[]');
    const employees: any[] = JSON.parse(localStorage.getItem('sm_employees') || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const todayBills = bills.filter(b => b.date === today);
    const totalSalesValue = bills.reduce((acc, b) => acc + (b.status === 'Paid' ? b.amount : 0), 0);
    
    const categoryMap: Record<string, number> = {};
    products.forEach(p => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + p.price * p.stock;
    });
    
    const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).slice(0, 5);
    if (pieData.length === 0) pieData.push({ name: 'No Stock', value: 1 });

    setStats({
      totalSales: totalSalesValue,
      activeEmployees: employees.length,
      totalCustomers: customers.length,
      todayBills: todayBills.length,
      pieData
    });
  };

  useEffect(() => {
    loadLiveStats();
    window.addEventListener('sm_data_updated', loadLiveStats);
    return () => window.removeEventListener('sm_data_updated', loadLiveStats);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      setChartData(GENERATE_DATA(days));
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">
             {isAdmin ? 'Admin Dashboard' : 'Operational Dashboard'}
           </h1>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time store metrics and insights</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-2 ${
          isAdmin ? 'bg-amber-100 text-amber-600 border border-amber-200' :
          'bg-sky-100 text-sky-600 border border-sky-200'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isAdmin ? 'bg-amber-500' : 'bg-sky-500'
          }`}></div>
          {userRole} Mode
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} change="All-time" icon="₹" color="sky" />
        <MetricCard title="Bills Generated" value={stats.todayBills.toString()} change="Today" icon="📄" color="indigo" />
        <MetricCard title="Total Customers" value={stats.totalCustomers.toString()} change="Profiles" icon="👥" color="emerald" />
        {isAdmin ? (
          <MetricCard title="Staff Count" value={stats.activeEmployees.toString()} change="Active" icon="👤" color="amber" />
        ) : (
          <MetricCard title="Total Items" value={stats.pieData.length.toString()} change="Inventory" icon="📦" color="gray" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Overview</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Revenue Performance</p>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 outline-none focus:ring-4 focus:ring-sky-500/10 transition-all cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                  itemStyle={{fontWeight: 'black', color: '#0ea5e9'}}
                  labelStyle={{fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px'}}
                />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={5} dot={{r: 5, fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0, fill: '#0ea5e9'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full">
          <header className="mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Stock Valuation</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Value by category</p>
          </header>

          <div className="h-64 relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pieData} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={12} activeIndex={activeIndex} activeShape={renderActiveShape} onMouseEnter={onPieEnter} onMouseLeave={onPieLeave}>
                  {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900 leading-none">₹{(stats.pieData.reduce((a, b) => a + b.value, 0) / 1000).toFixed(1)}k</div>
                <div className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] mt-2">Inventory</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {stats.pieData.map((item, i) => (
              <div key={item.name} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${activeIndex === i ? 'bg-gray-50 shadow-inner' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-xs font-black text-gray-700">{item.name}</span>
                </div>
                <div className="text-[10px] font-black text-gray-400 tabular-nums">₹{item.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{title: string, value: string, change: string, icon: string, color: string}> = ({ title, value, change, icon, color }) => {
  const colorMap: any = {
    sky: 'bg-sky-50 text-sky-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-100 text-gray-600'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-sky-200 transition-all duration-300">
      <div className="absolute -top-4 -right-4 text-gray-50 text-8xl font-black opacity-40 select-none group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] block relative z-10">{title}</span>
      <span className="text-3xl font-black text-gray-900 mb-3 block relative z-10">{value}</span>
      <div className={`text-[9px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1 w-fit uppercase tracking-widest relative z-10 ${colorMap[color] || colorMap.gray}`}>
        {change}
      </div>
    </div>
  );
};

export default Overview;
