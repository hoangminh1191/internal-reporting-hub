import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import { Download, Filter, FileText } from 'lucide-react';
import { api } from '../services/api';
import { ReportDefinition, ReportSubmission, ReportStatus } from '../types';

export const AggregateView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [submissions, setSubmissions] = useState<ReportSubmission[]>([]);
  const [selectedDefId, setSelectedDefId] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const [defs, subs] = await Promise.all([
          api.getDefinitions(),
          api.getAllSubmissions()
        ]);
        setDefinitions(defs);
        setSubmissions(subs);
        if (defs.length > 0) setSelectedDefId(defs[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const selectedDef = definitions.find(d => d.id === selectedDefId);

  // Filter submissions for this report type and ONLY approved ones (normally aggregation is on approved data)
  // But for flexibility let's show all submitted/approved for now, or just approved? 
  // User didn't specify, but "Aggregation" usually implies valid data. Let's include SUBMITTED and APPROVED.
  const filteredSubmissions = submissions.filter(s =>
    s.reportDefinitionId === selectedDefId &&
    (s.status === ReportStatus.SUBMITTED || s.status === ReportStatus.APPROVED)
  );

  // Calculate Aggregates for Numeric Fields
  const activeStructure = selectedDef?.structure || [];
  const numericFields = activeStructure.filter(f => f.type === 'number');

  const aggregates = numericFields.map(field => {
    const values = filteredSubmissions.map(s => {
      const val = s.data[field.id];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? (sum / values.length).toFixed(1) : 0;
    return { field, sum, avg };
  });

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng hợp dữ liệu</h1>
          <p className="text-gray-500 mt-1">Xem và phân tích số liệu từ các báo cáo</p>
        </div>
        <div className="flex gap-2">
          <select
            className="border rounded-lg px-3 py-2 bg-white"
            value={selectedDefId}
            onChange={e => setSelectedDefId(e.target.value)}
            aria-label="Chọn loại báo cáo"
          >
            {definitions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <Button variant="primary"><Download size={16} className="mr-2" /> Xuất Excel</Button>
        </div>
      </div>

      {/* Aggregate Cards */}
      {aggregates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-100">
            <p className="text-blue-600 font-medium">Tổng số báo cáo</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{filteredSubmissions.length}</p>
            <p className="text-sm text-blue-700 mt-1">bản ghi</p>
          </Card>
          {aggregates.map((agg, idx) => (
            <Card key={idx} className="p-6 bg-indigo-50 border-indigo-100">
              <p className="text-indigo-600 font-medium">Tổng {agg.field.label}</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">
                {agg.sum.toLocaleString()}
              </p>
              <p className="text-sm text-indigo-700 mt-1">Trung bình: {agg.avg}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-gray-500">Mẫu báo cáo này chưa có trường dữ liệu số nào để tính toán tổng hợp.</p>
        </Card>
      )}

      {/* Data Table */}
      <Card title="Dữ liệu chi tiết">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Ngày gửi</th>
                <th className="px-6 py-3">Người gửi</th>
                <th className="px-6 py-3">Phòng ban</th>
                {activeStructure.map(f => (
                  <th key={f.id} className="px-6 py-3">{f.label}</th>
                ))}
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={4 + activeStructure.length} className="px-6 py-8 text-center text-gray-500">
                    Chưa có dữ liệu cho báo cáo này
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 font-medium">{sub.submittedBy}</td>
                    <td className="px-6 py-4">{sub.departmentName}</td>
                    {activeStructure.map(f => (
                      <td key={f.id} className="px-6 py-4">
                        {sub.data[f.id] !== undefined ? String(sub.data[f.id]) : '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === ReportStatus.APPROVED ? 'bg-green-100 text-green-700' :
                        sub.status === ReportStatus.REJECTED ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
