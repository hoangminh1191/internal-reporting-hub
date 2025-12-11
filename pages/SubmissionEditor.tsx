import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { ArrowLeft, Save, Send, AlertTriangle } from 'lucide-react';
import { ReportStatus, ReportDefinition, ReportSubmission } from '../types';
import { api } from '../services/api';

interface SubmissionEditorProps {
  submissionId: string | null;
  reportDefinitionId: string;
  onBack: () => void;
}

export const SubmissionEditor: React.FC<SubmissionEditorProps> = ({ submissionId, reportDefinitionId, onBack }) => {
  const [definition, setDefinition] = useState<ReportDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [savingTarget, setSavingTarget] = useState<ReportStatus | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Definition and Data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Load Definition
        const def = await api.getDefinitionById(reportDefinitionId);
        if (def) setDefinition(def);

        // Load Submission if exists
        if (submissionId) {
          const sub = await api.getSubmissionById(submissionId);
          if (sub) {
            setFormData(sub.data);
            setStatus(sub.status);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [submissionId, reportDefinitionId]);

  if (isLoading) return <div className="p-12 text-center text-gray-500">Đang tải biểu mẫu...</div>;
  if (!definition) return <div>Không tìm thấy mẫu báo cáo</div>;

  const isReadOnly = status === ReportStatus.SUBMITTED || status === ReportStatus.APPROVED;

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async (newStatus: ReportStatus) => {
    setIsSaving(true);
    setSavingTarget(newStatus);

    try {
      const submissionData: Partial<ReportSubmission> = {
        reportDefinitionId: definition.id,
        status: newStatus,
        data: formData,
        submittedAt: newStatus === ReportStatus.SUBMITTED ? new Date().toISOString() : undefined,
        periodStart: '2023-11-01', // Mock period logic
        periodEnd: '2023-11-30'
      };

      if (submissionId) {
        // Update
        await api.updateSubmission(submissionId, submissionData);
      } else {
        // Create new
        const user = await api.getCurrentUser();
        const newSubmission: ReportSubmission = {
          id: crypto.randomUUID(), // Generate ID
          submittedBy: user.name,
          departmentId: user.departmentId,
          departmentName: 'Phòng Vận Hành', // Should fetch dept name
          version: 1,
          periodStart: '2023-11-01',
          periodEnd: '2023-11-30',
          reportDefinitionId: definition.id,
          data: formData,
          status: newStatus,
          submittedAt: newStatus === ReportStatus.SUBMITTED ? new Date().toISOString() : undefined,
        };
        await api.createSubmission(newSubmission);
      }

      setStatus(newStatus);
      setShowConfirm(false);
      if (newStatus === ReportStatus.SUBMITTED) {
        onBack();
      }
    } catch (e) {
      alert('Lỗi khi lưu báo cáo');
    } finally {
      setIsSaving(false);
      setSavingTarget(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{definition.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500">Kỳ: 01/11/2023 - 30/11/2023</span>
              <span className="text-gray-300">|</span>
              <Badge status={status} />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {!isReadOnly && (
            <>
              <Button variant="secondary" onClick={() => handleSave(ReportStatus.DRAFT)} isLoading={isSaving && savingTarget === ReportStatus.DRAFT}>
                <Save size={16} className="mr-2" /> Lưu nháp
              </Button>
              <Button onClick={() => setShowConfirm(true)} isLoading={isSaving && savingTarget === ReportStatus.SUBMITTED}>
                <Send size={16} className="mr-2" /> Nộp báo cáo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Warning Banner for readonly */}
      {isReadOnly && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5" />
          <div>
            <p className="font-medium">Báo cáo đang ở chế độ chỉ xem</p>
            <p className="text-sm mt-1 opacity-90">
              Báo cáo này đã được gửi hoặc phê duyệt. Bạn không thể chỉnh sửa dữ liệu trừ khi quản lý yêu cầu sửa lại.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Form Form */}
      <Card>
        <div className="space-y-8">
          {definition.structure.map((field) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:items-start border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  {field.label} {field.required && <span className="text-red-600">*</span>}
                </label>
                {field.unit && <p className="text-xs text-gray-500 font-medium">Đơn vị: {field.unit}</p>}
              </div>
              <div className="md:col-span-3">
                {field.type === 'text' && (
                  <textarea
                    disabled={isReadOnly}
                    rows={3}
                    className="w-full rounded-lg border-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 text-gray-900 disabled:bg-gray-100 disabled:text-gray-600 transition-all font-medium"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={`Nhập ${field.label.toLowerCase()}...`}
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    disabled={isReadOnly}
                    className="w-full max-w-sm rounded-lg border-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 text-gray-900 disabled:bg-gray-100 disabled:text-gray-600 transition-all font-medium"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, Number(e.target.value))}
                  />
                )}

                {field.type === 'select' && (
                  <select
                    disabled={isReadOnly}
                    className="w-full max-w-sm rounded-lg border-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-900 disabled:bg-gray-100 disabled:text-gray-600 transition-all font-medium"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  >
                    <option value="">-- Chọn --</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Xác nhận nộp báo cáo?</h3>
            <p className="text-gray-600 mb-6">
              Sau khi nộp, báo cáo sẽ được gửi đến quản lý để duyệt. Bạn sẽ không thể chỉnh sửa cho đến khi có phản hồi.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>Hủy</Button>
              <Button onClick={() => handleSave(ReportStatus.SUBMITTED)}>Xác nhận nộp</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};