import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { DefectRecord, SummaryStats } from '../types';
import { CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';

interface DashboardProps {
  defects: DefectRecord[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, subtext, icon, colorClass }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ defects }) => {
  const stats: SummaryStats = React.useMemo(() => {
    const total = defects.reduce((acc, curr) => acc + curr.totalDefects, 0);
    const fixed = defects.reduce((acc, curr) => acc + curr.fixedDefects, 0);
    const remaining = total - fixed;
    const percentage = total > 0 ? (fixed / total) * 100 : 0;
    return { total, fixed, remaining, percentage };
  }, [defects]);

  const categoryData = React.useMemo(() => {
    const categories: Record<string, { name: string, Total: number, Fixed: number }> = {};
    defects.forEach(d => {
      if (!categories[d.category]) {
        categories[d.category] = { name: d.category, Total: 0, Fixed: 0 };
      }
      categories[d.category].Total += d.totalDefects;
      categories[d.category].Fixed += d.fixedDefects;
    });
    return Object.values(categories);
  }, [defects]);

  const statusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {};
    defects.forEach(d => {
      if (d.status === 'Completed' || (d.totalDefects > 0 && d.totalDefects === d.fixedDefects)) {
         statusCounts['Completed'] = (statusCounts['Completed'] || 0) + 1;
      } else {
         statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
      }
    });
    return Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
  }, [defects]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Defects" 
          value={stats.total} 
          subtext="Across all locations" 
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          colorClass="bg-red-50"
        />
        <StatCard 
          title="Defects Fixed" 
          value={stats.fixed} 
          subtext={`${stats.percentage.toFixed(1)}% Completion Rate`} 
          icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
          colorClass="bg-emerald-50"
        />
        <StatCard 
          title="Remaining" 
          value={stats.remaining} 
          subtext="Requires action" 
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          colorClass="bg-amber-50"
        />
        <StatCard 
          title="Total Locations" 
          value={defects.length} 
          subtext="Monitored areas" 
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          colorClass="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Defects by Category</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="Total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fixed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Status Distribution</h3>
          <div className="h-80 w-full flex justify-center items-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
             
     {/* Quick view of recent items or critical items */}
     <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Pending CM Approval</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Defects</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defects.filter(d => d.status === 'Fixed (Wait CM)').map(d => (
                  <tr key={d.id}>
                    <td className="px-6 py-3 font-medium text-slate-700">{d.location}</td>
                    <td className="px-6 py-3 text-slate-600">{d.totalDefects}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full border border-amber-200">{d.status}</span>
                    </td>
                  </tr>
                ))}
                 {defects.filter(d => d.status === 'Fixed (Wait CM)').length === 0 && (
                   <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-400">No items waiting for approval.</td></tr>
                 )}
              </tbody>
            </table>
        </div>
     </div>
    </div>
  );
};

export default Dashboard;