
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

type TimeRange = '7d' | '30d' | '90d';

const GENERATE_DATA = (days: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      name: date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
      value: Math.floor(Math.random() * (25000 - 10000) + 10000),
    };
  });
};

const pieData = [
  { name: 'Snacks', value: 400, percent: 31 },
  { name: 'Beverages', value: 300, percent: 23 },
  { name: 'Toiletries', value: 300, percent: 23 },
  { name: 'Cleaning', value: 200, percent: 15 },
  { name: 'Electronics', value: 100, percent: 8 },
];

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

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      setChartData(GENERATE_DATA(days));
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const totalSales = useMemo(() => {
    const sum = chartData.reduce((acc, curr) => acc + curr.value, 0);
    return sum.toLocaleString('en-IN');
  }, [chartData]);

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
        <MetricCard title="Total Sales (Period)" value={`₹${totalSales}`} change="+10.5% period" icon="₹" />
        <MetricCard title="Active Employees" value="8" change="No change" icon="👤" />
        <MetricCard title="Total Customers" value="345" change="+5 new" icon="👥" />
        <MetricCard title="Today's Bills" value="42" change="+8 more" icon="📄" />
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
              <h3 className="text-lg font-bold text-gray-900">Sales Trend</h3>
              <p className="text-xs text-gray-400">Revenue performance over time</p>
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
                  interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 4 : 14}
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
                  activeDot={{r: 8, strokeWidth: 0, fill: '#0ea5e9', shadow: '0 0 10px rgba(14,165,233,0.5)'}}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REDESIGNED PRODUCT BREAKDOWN */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
          <header className="mb-6">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Product Breakdown</h3>
            <p className="text-xs font-medium text-gray-400">Performance by category</p>
          </header>

          <div className="h-56 relative mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
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
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px 16px'}}
                   itemStyle={{fontSize: '14px', fontWeight: '800'}}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 leading-none">₹1.2L</div>
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-2">Revenue</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {pieData.map((item, i) => (
              <div 
                key={item.name} 
                className={`flex items-center justify-between p-2 rounded-xl transition-all ${activeIndex === i ? 'bg-gray-50 scale-[1.02]' : 'hover:bg-gray-50/50'}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-sm font-bold text-gray-700">{item.name}</span>
                </div>
                <div className="text-xs font-black text-gray-400 tabular-nums">
                  {item.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <button className="text-xs font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest transition-colors">View All</button>
          </div>
          <div className="space-y-6">
            <ActivityItem icon="💰" title="New bill generated for Customer A" time="5 mins ago" amount="₹2,450" />
            <ActivityItem icon="👤" title="Customer B added to list" time="1 hour ago" />
            <ActivityItem icon="📦" title="Stock updated for Milk" time="3 hours ago" amount="+24 units" />
            <ActivityItem icon="📄" title="Bill #1002 paid by Cash" time="Yesterday" amount="₹1,200" />
            <ActivityItem icon="🏢" title="Employee John logged in" time="Yesterday" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-8">Customer Insights</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-all hover:bg-sky-50 group">
               <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">👥</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Total Customers</p>
                    <p className="text-[10px] text-gray-400">All-time registered</p>
                  </div>
               </div>
               <span className="font-black text-sky-600 text-lg">345</span>
             </div>
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-all hover:bg-sky-50 group">
               <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">➕</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">New Customers</p>
                    <p className="text-[10px] text-gray-400">Past 24 hours</p>
                  </div>
               </div>
               <span className="font-black text-sky-600 text-lg">5</span>
             </div>
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl transition-all hover:bg-sky-50 group">
               <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">₹</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Avg. Basket Value</p>
                    <p className="text-[10px] text-gray-400">Based on last 100 bills</p>
                  </div>
               </div>
               <span className="font-black text-sky-600 text-lg">₹320</span>
             </div>
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
    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${
      change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'
    }`}>
      {change.startsWith('+') && <span>↑</span>}
      {change}
    </div>
  </div>
);

const ActivityItem: React.FC<{icon: string, title: string, time: string, amount?: string}> = ({ icon, title, time, amount }) => (
  <div className="flex items-center justify-between group">
    <div className="flex gap-4 items-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl group-hover:bg-sky-50 transition-colors shadow-sm">{icon}</div>
      <div>
        <div className="text-sm font-bold text-gray-800 leading-tight">{title}</div>
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-0.5">{time}</div>
      </div>
    </div>
    {amount && <div className="text-xs font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-xl group-hover:bg-sky-100 transition-colors">{amount}</div>}
  </div>
);

export default Overview;
