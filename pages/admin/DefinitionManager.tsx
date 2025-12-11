
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/UI';
import { ReportDefinition, ReportField, Department } from '../../types';
import { api } from '../../services/api';
import { Plus, Edit3, Trash, ArrowLeft, GripVertical, Save, Ban } from 'lucide-react';

export const DefinitionManager: React.FC = () => {
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadDefs();
  }, []);

  const loadDefs = async () => {
    const data = await api.getDefinitions();
    setDefinitions(data);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Bạn có chắc muốn kết thúc hiệu lực mẫu báo cáo này? Người dùng sẽ không thể tạo mới báo cáo này nữa.')) return;
    try {
      await api.updateDefinition(id, { status: 'inactive' }); // Treat as inactive
      loadDefs();
    } catch (e) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  if (editingId === 'NEW' || editingId) {
    return (
      <DefinitionEditor
        id={editingId === 'NEW' ? null : editingId}
        onClose={() => { setEditingId(null); loadDefs(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Mẫu báo cáo</h2>
        <Button onClick={() => setEditingId('NEW')}>
          <Plus size={16} className="mr-2" /> Tạo mẫu mới
        </Button>
      </div>

      <div className="grid gap-4">
        {definitions.map(def => (
          <Card key={def.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-900">{def.name}</h3>
                  <Badge status={def.status === 'active' ? 'active' : 'inactive'} />
                </div>
                <p className="text-gray-500 text-sm mt-1">{def.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>Key: {def.key}</span>
                  <span>Chu kỳ: {def.periodType}</span>
                  <span>{def.structure.length} trường dữ liệu</span>
                </div>
              </div>
              <div className="flex gap-2">
                {def.status === 'active' && (
                  <Button variant="danger" size="sm" onClick={() => handleDeactivate(def.id)}>
                    <Ban size={16} className="mr-2" /> Kết thúc
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setEditingId(def.id)}>
                  <Edit3 size={16} className="mr-2" /> Sửa cấu trúc
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- Sub Component: Editor (Form Builder) ---

const DefinitionEditor: React.FC<{ id: string | null, onClose: () => void }> = ({ id, onClose }) => {
  const [def, setDef] = useState<Partial<ReportDefinition>>({
    name: '',
    key: '',
    description: '',
    periodType: 'monthly',
    status: 'draft',
    structure: []
  });
  const [loading, setLoading] = useState(false);
  const [depts, setDepts] = useState<Department[]>([]);

  useEffect(() => {
    // Load departments
    api.getAllDepartments().then(setDepts);

    if (id) {
      api.getDefinitionById(id).then(data => {
        if (data) setDef(data);
      });
    }
  }, [id]);

  const addField = () => {
    const newField: ReportField = {
      id: `field_${Date.now()}`,
      label: 'Trường dữ liệu mới',
      type: 'text',
      required: false
    };
    setDef(prev => ({ ...prev, structure: [...(prev.structure || []), newField] }));
  };

  const updateField = (idx: number, updates: Partial<ReportField>) => {
    const newStructure = [...(def.structure || [])];
    newStructure[idx] = { ...newStructure[idx], ...updates };
    setDef(prev => ({ ...prev, structure: newStructure }));
  };

  const removeField = (idx: number) => {
    const newStructure = [...(def.structure || [])];
    newStructure.splice(idx, 1);
    setDef(prev => ({ ...prev, structure: newStructure }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!def.name || !def.key) return alert('Thiếu thông tin cơ bản');

      const payload = {
        ...def,
        id: id || crypto.randomUUID(),
        structure: def.structure || []
      } as ReportDefinition;

      if (id) await api.updateDefinition(id, payload);
      else await api.createDefinition(payload);

      onClose();
    } catch (e) {
      alert('Lỗi lưu mẫu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="flex items-center text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-2" /> Quay lại
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} isLoading={loading}>
            <Save size={16} className="mr-2" /> Lưu mẫu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Basic Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Thông tin chung">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tên báo cáo</label>
                <input className="w-full border p-2 rounded" value={def.name} onChange={e => setDef({ ...def, name: e.target.value })} placeholder="Vd: Báo cáo Doanh thu" />
              </div>
              <div>
                <label className="text-sm font-medium">Mã (Key - Unique)</label>
                <input className="w-full border p-2 rounded" value={def.key} onChange={e => setDef({ ...def, key: e.target.value })} placeholder="revenue_monthly" />
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <textarea className="w-full border p-2 rounded" rows={3} value={def.description} onChange={e => setDef({ ...def, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Chu kỳ</label>
                <select className="w-full border p-2 rounded" value={def.periodType} onChange={e => setDef({ ...def, periodType: e.target.value as any })}>
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <select className="w-full border p-2 rounded" value={def.status} onChange={e => setDef({ ...def, status: e.target.value as any })}>
                  <option value="active">Hoạt động</option>
                  <option value="draft">Nháp (Ẩn)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Phòng ban (Truy cập)</label>
                <select
                  className="w-full border p-2 rounded"
                  value={def.departmentId || ''}
                  onChange={e => setDef({ ...def, departmentId: e.target.value || null })}
                >
                  <option value="">-- Tất cả phòng ban --</option>
                  {depts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Form Builder */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Cấu trúc biểu mẫu" action={<Button size="sm" onClick={addField}><Plus size={14} className="mr-1" /> Thêm trường</Button>}>
            <div className="space-y-3">
              {def.structure?.length === 0 && <p className="text-center text-gray-400 py-8">Chưa có trường dữ liệu nào. Hãy thêm mới.</p>}

              {def.structure?.map((field, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 group relative">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-1 pt-3 text-gray-400 cursor-move text-center"><GripVertical size={20} /></div>

                    <div className="col-span-11 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Nhãn (Label)</label>
                        <input
                          className="w-full border p-1.5 rounded text-sm"
                          value={field.label}
                          onChange={e => updateField(idx, { label: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500" htmlFor={`field-id-${idx}`}>Mã trường (ID)</label>
                        <input
                          id={`field-id-${idx}`}
                          className="w-full border p-1.5 rounded text-sm bg-gray-100"
                          value={field.id}
                          onChange={e => updateField(idx, { id: e.target.value })}
                          placeholder="Mã định danh (ID)"
                          title="Mã định danh của trường dữ liệu"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Loại dữ liệu</label>
                        <select
                          className="w-full border p-1.5 rounded text-sm"
                          value={field.type}
                          onChange={e => updateField(idx, { type: e.target.value as any })}
                        >
                          <option value="text">Văn bản (Text)</option>
                          <option value="number">Số (Number)</option>
                          <option value="date">Ngày tháng (Date)</option>
                          <option value="select">Danh sách chọn (Select)</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-3 pb-1">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={e => updateField(idx, { required: e.target.checked })}
                          />
                          <span>Bắt buộc</span>
                        </label>
                      </div>

                      {field.type === 'select' && (
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-gray-500">Các lựa chọn (ngăn cách bằng dấu phẩy)</label>
                          <input
                            className="w-full border p-1.5 rounded text-sm"
                            placeholder="Option 1, Option 2, Option 3"
                            value={field.options?.join(', ')}
                            onChange={e => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()) })}
                          />
                        </div>
                      )}
                      {field.type === 'number' && (
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-gray-500">Đơn vị (VD: cái, kg, giờ)</label>
                          <input
                            className="w-full border p-1.5 rounded text-sm"
                            value={field.unit}
                            onChange={e => updateField(idx, { unit: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeField(idx)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div >
    </div >
  );
};
