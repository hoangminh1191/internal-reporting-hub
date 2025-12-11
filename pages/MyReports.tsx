import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { ReportStatus, ReportSubmission, ReportDefinition } from '../types';
import { Edit2, Eye, Plus, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { auth } from '../services/auth';

interface MyReportsProps {
  onSelectReport: (submissionId: string | null, defId: string) => void;
}

export const MyReports = ({ onSelectReport }: MyReportsProps) => {
  const [submissions, setSubmissions] = useState<ReportSubmission[]>([]);
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = auth.getSessionUserId() || '';
      const [subs, defs, currentUser] = await Promise.all([
        api.getMySubmissions(userId),
        api.getDefinitions(),
        api.getCurrentUser()
      ]);

      setSubmissions(subs);
      // Filter: Keep all reports belonging to department (Active + Inactive)
      // We will filter by status in the UI tabs
      const accessible = defs.filter(d =>
        !d.departmentId || d.departmentId === currentUser.departmentId || d.departmentId === null
      );
      setDefinitions(accessible);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter lists based on tab
  const activeDefinitions = definitions.filter(d => d.status === 'active');
  const inactiveDefinitions = definitions.filter(d => d.status === 'inactive');

  // Submissions filtered by definition status
  const currentSubmissions = submissions.filter(s => {
    const def = definitions.find(d => d.id === s.reportDefinitionId);
    return def && (def.status === 'active');
  });

  const historySubmissions = submissions.filter(s => {
    const def = definitions.find(d => d.id === s.reportDefinitionId);
    return !def || def.status !== 'active';
  });

  const displayedSubmissions = activeTab === 'active' ? currentSubmissions : historySubmissions;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý và nộp các báo cáo định kỳ.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchData}><RefreshCw size={16} /></Button>

          {activeTab === 'active' && (
            <div className="relative">
              <Button onClick={() => setShowDropdown(!showDropdown)}>
                <Plus size={16} className="mr-2" /> Tạo báo cáo mới
              </Button>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-xl z-10">
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase">Chọn mẫu báo cáo:</p>
                      {activeDefinitions.map(d => (
                        <button
                          key={d.id}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded mb-1"
                          onClick={() => {
                            onSelectReport(null, d.id);
                            setShowDropdown(false);
                          }}
                        >
                          {d.name}
                        </button>
                      ))}
                      {activeDefinitions.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Không có mẫu báo cáo nào khả dụng.</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('active')}
        >
          Báo cáo đang hiệu lực
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inactive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('inactive')}
        >
          Lịch sử / Hết hiệu lực
        </button>
      </div>

      <Card title={activeTab === 'active' ? "Danh sách báo cáo cần làm" : "Lịch sử báo cáo đã ngừng"}>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Tên báo cáo</th>
                  <th className="px-6 py-3">Kỳ báo cáo</th>
                  <th className="px-6 py-3">Deadline</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      Không có dữ liệu.
                    </td>
                  </tr>
                )}
                {displayedSubmissions.map((sub) => {
                  const def = definitions.find(d => d.id === sub.reportDefinitionId);
                  const isEditable = activeTab === 'active' && def && def.status === 'active' && (sub.status === ReportStatus.DRAFT || sub.status === ReportStatus.REJECTED);

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{def?.name || 'Unknown Report'}</div>
                        <div className="text-xs text-gray-500">{def?.description}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(sub.periodStart).toLocaleDateString()} - {new Date(sub.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        25/11/2023
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {isEditable ? (
                          <Button size="sm" variant="secondary" onClick={() => onSelectReport(sub.id, sub.reportDefinitionId)}>
                            <Edit2 size={14} className="mr-1" /> Sửa
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => onSelectReport(sub.id, sub.reportDefinitionId)}>
                            <Eye size={14} className="mr-1" /> Xem
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};