import React, { useEffect, useState } from 'react';
import { Card, Badge } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileCheck, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { ReportStatus, ReportSubmission } from '../types';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: any[];
    chartData: any[];
    recentSubmissions: ReportSubmission[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.getDashboardStats();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'pending': return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'success': return { icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50' };
      case 'danger': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' };
      default: return { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  const pieData = [
    { name: 'Đã nộp', value: 65 },
    { name: 'Chưa nộp', value: 35 },
  ];
  const COLORS = ['#3b82f6', '#e5e7eb'];

  if (loading || !data) {
    return <div className="flex items-center justify-center h-full text-gray-500">Đang tải dữ liệu Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 mt-1">Xin chào, chúc bạn một ngày làm việc hiệu quả.</p>
        </div>
        <div className="flex gap-2">
           <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
             Database: PostgreSQL (Simulated)
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat, index) => {
          const { icon: Icon, color, bg } = getIcon(stat.type);
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card title="Hiệu suất Vận hành (6 tháng)" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Hoạt động" />
                <Bar dataKey="downtime" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Dừng máy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card title="Tỷ lệ nộp báo cáo">
          <div className="h-56 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Đã nộp (65%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              <span className="text-sm text-gray-600">Chưa nộp (35%)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card title="Hoạt động gần đây">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Báo cáo</th>
                <th className="px-6 py-3">Người gửi</th>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSubmissions.map((sub) => (
                <tr key={sub.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {sub.reportDefinitionId === 'rd1' ? 'Báo cáo Vận hành Tháng' : 'Báo cáo Nhân sự Tuần'}
                  </td>
                  <td className="px-6 py-4">{sub.submittedBy}</td>
                  <td className="px-6 py-4">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <Badge status={sub.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
