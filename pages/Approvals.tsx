import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { ReportStatus, ReportSubmission, ReportDefinition } from '../types';
import { Check, X, Eye, FileText, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const Approvals: React.FC = () => {
  const [submissions, setSubmissions] = useState<ReportSubmission[]>([]);
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, defs] = await Promise.all([
        api.getPendingApprovals('d1'),
        api.getDefinitions()
      ]);
      setSubmissions(subs);
      setDefinitions(defs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (confirm(`Bạn có chắc chắn muốn ${action === 'approve' ? 'duyệt' : 'từ chối'} báo cáo này?`)) {
      try {
        await api.updateSubmission(id, { 
            status: action === 'approve' ? ReportStatus.APPROVED : ReportStatus.REJECTED 
        });
        await loadData(); // Reload list
      } catch (e) {
        alert('Có lỗi xảy ra');
      }
    }
  };

  if (loading) return <div className="text-center p-12 text-gray-500">Đang tải danh sách chờ duyệt...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phê duyệt báo cáo</h1>
          <p className="text-gray-500 mt-1">Danh sách các báo cáo đang chờ bạn xử lý.</p>
        </div>
        <Button variant="secondary" onClick={loadData}><RefreshCw size={16} className="mr-2"/> Làm mới</Button>
      </div>

      <div className="grid gap-6">
        {submissions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Tất cả đã xong!</h3>
            <p className="text-gray-500">Hiện không có báo cáo nào cần duyệt.</p>
          </Card>
        ) : (
          submissions.map(sub => {
            const def = definitions.find(d => d.id === sub.reportDefinitionId);
            return (
              <Card key={sub.id} className="border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge status={sub.status} />
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm font-medium text-gray-600">{sub.departmentName}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{def?.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <p className="text-gray-500">Người gửi</p>
                        <p className="font-medium">{sub.submittedBy}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Kỳ báo cáo</p>
                        <p className="font-medium">{new Date(sub.periodStart).toLocaleDateString()} - {new Date(sub.periodEnd).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Preview Data Snippet */}
                    <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-2 font-medium">
                        <FileText size={14} /> Tóm tắt dữ liệu:
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(sub.data).slice(0, 3).map(([key, val]) => (
                           <div key={key}>
                             <span className="block text-xs text-gray-500 uppercase">{key.replace(/_/g, ' ')}</span>
                             <span className="font-medium">{String(val)}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye size={16} className="mr-2" /> Chi tiết
                    </Button>
                    <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700 w-full" onClick={() => handleAction(sub.id, 'approve')}>
                      <Check size={16} className="mr-2" /> Duyệt
                    </Button>
                    <Button variant="danger" size="sm" className="w-full" onClick={() => handleAction(sub.id, 'reject')}>
                      <X size={16} className="mr-2" /> Từ chối
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
