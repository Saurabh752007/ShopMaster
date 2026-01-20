
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Product, Bill, Customer } from '../types';

type TimeRange = '7d' | '30d' | '90d';

const GENERATE_DATA = (days: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      name: date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
      value: Math.floor(Math.random() * (5000 - 1000) + 1000), // Scaled for fresh starts
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

const Overview: React.FC = () => {
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
    
    // Aggregating pie data from inventory categories
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Sales (All Time)" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} change="Live Sync" icon="₹" />
        <MetricCard title="Active Employees" value={stats.activeEmployees.toString()} change="Personnel" icon="👤" />
        <MetricCard title="Total Customers" value={stats.totalCustomers.toString()} change="Registered" icon="👥" />
        <MetricCard title="Today's Bills" value={stats.todayBills.toString()} change="Real-time" icon="📄" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Updating...</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Performance</h3>
              <p className="text-xs text-gray-400">Projected trends based on activity</p>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 500}} 
                  tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} 
                />
                <Tooltip 
                  cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  itemStyle={{fontWeight: 'bold', color: '#0ea5e9'}}
                  labelStyle={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}} 
                  activeDot={{r: 8, strokeWidth: 0, fill: '#0ea5e9'}}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
          <header className="mb-6">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Stock Valuation</h3>
            <p className="text-xs font-medium text-gray-400">Inventory worth by category</p>
          </header>

          <div className="h-56 relative mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.pieData} 
                  innerRadius={75} 
                  outerRadius={95} 
                  paddingAngle={5} 
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationDuration={1500}
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px 16px'}}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900 leading-none">₹{(stats.pieData.reduce((a, b) => a + b.value, 0) / 1000).toFixed(1)}k</div>
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-2">Valuation</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {stats.pieData.map((item, i) => (
              <div 
                key={item.name} 
                className={`flex items-center justify-between p-2 rounded-xl transition-all ${activeIndex === i ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-sm font-bold text-gray-700">{item.name}</span>
                </div>
                <div className="text-xs font-black text-gray-400">
                   ₹{item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{title: string, value: string, change: string, icon: string}> = ({ title, value, change, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group hover:border-sky-200 transition-all duration-300">
    <div className="absolute -top-2 -right-2 text-gray-100 text-6xl font-black opacity-30 select-none group-hover:text-sky-100 transition-colors">{icon}</div>
    <span className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{title}</span>
    <span className="text-2xl font-black text-gray-900 mb-2">{value}</span>
    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit bg-sky-50 text-sky-600">
      {change}
    </div>
  </div>
);

export default Overview;
