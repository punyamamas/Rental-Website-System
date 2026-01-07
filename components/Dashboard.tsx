import React, { useMemo } from 'react';
import { AppState, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Calendar, Activity } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6'];

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  
  const stats = useMemo(() => {
    const branchTx = state.transactions.filter(t => t.branch === state.currentBranch);
    
    const totalRevenue = branchTx.reduce((sum, t) => sum + t.totalAmount, 0);
    const rentalCount = branchTx.filter(t => t.type === TransactionType.RENTAL).length;
    const laundryCount = branchTx.filter(t => t.type === TransactionType.LAUNDRY).length;
    const saleCount = branchTx.filter(t => t.type === TransactionType.SALE).length;

    // Data for Revenue Mix Pie Chart
    const revenueByType = [
      { name: 'Rentals', value: branchTx.filter(t => t.type === TransactionType.RENTAL).reduce((sum, t) => sum + t.totalAmount, 0) },
      { name: 'Sales', value: branchTx.filter(t => t.type === TransactionType.SALE).reduce((sum, t) => sum + t.totalAmount, 0) },
      { name: 'Laundry', value: branchTx.filter(t => t.type === TransactionType.LAUNDRY).reduce((sum, t) => sum + t.totalAmount, 0) },
    ];

    // Mock Timeline Data (Last 7 days) - simplistic generation based on existing data
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const activityData = last7Days.map(day => ({
        name: day,
        revenue: Math.floor(Math.random() * 5000000) + 1000000 // Mock random for visual as real dates aren't fully populated in mock
    }));

    return { totalRevenue, rentalCount, laundryCount, saleCount, revenueByType, activityData };
  }, [state.transactions, state.currentBranch]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`Rp ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-emerald-500" />
        <StatCard title="Active Rentals" value={stats.rentalCount.toString()} icon={Calendar} color="text-blue-500" />
        <StatCard title="Retail Sales" value={stats.saleCount.toString()} icon={ShoppingBag} color="text-purple-500" />
        <StatCard title="Laundry Orders" value={stats.laundryCount.toString()} icon={Activity} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Mix */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Stream Mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.revenueByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.revenueByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number) => `Rp ${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {stats.revenueByType.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-sm text-slate-400">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Revenue Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};