
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
  
  const [aiSuggestions, setAiSuggestions] = useState<{title: string, text: string, type: 'growth' | 'efficiency' | 'marketing'}[]>([]);

  const generateAiInsights = (bills: Bill[], products: Product[], customers: Customer[]) => {
    if (bills.length === 0) {
      setAiSuggestions([
        { title: "Kickstart Sales", text: "Record your first sale to unlock AI-powered insights for your business.", type: 'growth' },
        { title: "Inventory Tip", text: "Add at least 10 products to your catalog to get started.", type: 'efficiency' },
        { title: "Customer Base", text: "Add customer details during checkout to track loyalty later.", type: 'marketing' }
      ]);
      return;
    }

    const dates = bills.map(b => new Date(b.date).getTime());
    const oldest = new Date(Math.min(...dates));
    const newest = new Date(Math.max(...dates));
    const diffTime = Math.abs(newest.getTime() - oldest.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    if (diffDays < 30) {
      // Early Stage Suggestions
      setAiSuggestions([
        { 
          title: "Build Loyalty Early", 
          text: `You have ${customers.length} customers. Offer a 5% discount on their next visit to encourage repeat business.`, 
          type: 'marketing' 
        },
        { 
          title: "Optimize Inventory", 
          text: "Identify your top 3 selling items this week and ensure they never run out of stock.", 
          type: 'efficiency' 
        },
        { 
          title: "Expand Reach", 
          text: "Ask your happy customers to leave a Google Review to attract more local footfall.", 
          type: 'growth' 
        }
      ]);
    } else {
      // Growth Stage Analysis (> 30 Days)
      
      // 1. Find Busiest Day
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayCounts = new Array(7).fill(0);
      bills.forEach(b => {
        const day = new Date(b.date).getDay();
        dayCounts[day]++;
      });
      const busiestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
      const busiestDay = days[busiestDayIndex];

      // 2. Find Top Category
      const catCounts: Record<string, number> = {};
      bills.forEach(b => {
        b.itemsList?.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            catCounts[product.category] = (catCounts[product.category] || 0) + item.quantity;
          }
        });
      });
      const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';

      setAiSuggestions([
        { 
          title: "Peak Traffic Insight", 
          text: `${busiestDay} is your busiest day. Ensure you have full staff coverage and stocked shelves.`, 
          type: 'efficiency' 
        },
        { 
          title: "Category Expansion", 
          text: `${topCategory} is your best-performing category. Consider adding premium items to this range to boost margins.`, 
          type: 'growth' 
        },
        { 
          title: "Customer Retention", 
          text: `Analyze the ${Math.floor(customers.length * 0.2)} top spenders. Create a VIP WhatsApp group for them with exclusive previews.`, 
          type: 'marketing' 
        }
      ]);
    }
  };

  const loadLiveStats = () => {
    const bills: Bill[] = JSON.parse(localStorage.getItem('sm_bills') || '[]');
    const products: Product[] = JSON.parse(localStorage.getItem('sm_products') || '[]');
    const customers: Customer[] = JSON.parse(localStorage.getItem('sm_customers') || '[]');
    const employees: any[] = JSON.parse(localStorage.getItem('sm_employees') || '[]');
    
    generateAiInsights(bills, products, customers);

    const today = new Date().toISOString().split('T')[0];
    const todayBills = bills.filter(b => b.date === today);
    const totalSalesValue = bills.reduce((acc, b) => acc + (b.status === 'Paid' ? b.amount : 0), 0);
    
    const categoryMap: Record<string, number> = {};
    let totalStockVal = 0;

    products.forEach(p => {
      const val = p.price * p.stock;
      categoryMap[p.category] = (categoryMap[p.category] || 0) + val;
      totalStockVal += val;
    });
    
    // Sort categories by value descending
    const sortedCategories = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Take top 4
    let pieData = sortedCategories.slice(0, 4);
    
    // Sum the rest as "Others"
    const othersValue = sortedCategories.slice(4).reduce((acc, curr) => acc + curr.value, 0);
    if (othersValue > 0) {
      pieData.push({ name: 'Others', value: othersValue });
    }

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

      {/* AI Suggestions Panel */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v4.59l-3.29-3.3a1 1 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l5-5a1 1 0 0 0-1.42-1.42L13 11.59V7a1 1 0 0 0-1-1z"/></svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl shadow-inner border border-white/20">
              ✨
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">AI Business Advisor</h3>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Smart insights to grow your business</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    suggestion.type === 'growth' ? 'bg-emerald-500/20 text-emerald-300' :
                    suggestion.type === 'efficiency' ? 'bg-sky-500/20 text-sky-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {suggestion.type}
                  </span>
                  <svg className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h4 className="text-lg font-black mb-2">{suggestion.title}</h4>
                <p className="text-sm text-indigo-100 leading-relaxed font-medium opacity-90">
                  {suggestion.text}
                </p>
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
