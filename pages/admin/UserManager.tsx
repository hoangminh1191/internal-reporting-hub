
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/UI';
import { User, UserRole, Department } from '../../types';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, d] = await Promise.all([
        api.getAllUsers(),
        api.getAllDepartments()
      ]);
      setUsers(u);
      setDepts(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUser = async () => {
    try {
      if (!editingUser.name || !editingUser.email) return alert('Vui lòng nhập tên và email');

      if (editingUser.id) {
        await api.updateUser(editingUser.id, editingUser);
      } else {
        const newUser: User = {
          id: crypto.randomUUID(),
          name: editingUser.name!,
          email: editingUser.email!,
          role: editingUser.role || UserRole.DEPARTMENT_USER,
          departmentId: editingUser.departmentId || depts[0]?.id || '',
          avatarUrl: `https://ui-avatars.com/api/?name=${editingUser.name}&background=random`
        };
        await api.createUser(newUser);
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      alert('Lỗi khi lưu người dùng');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa user này?')) {
      await api.deleteUser(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Quản lý người dùng</h2>
        <Button onClick={() => { setEditingUser({ role: UserRole.DEPARTMENT_USER }); setIsModalOpen(true); }}>
          <Plus size={16} className="mr-2" /> Thêm nhân sự
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Nhân sự</th>
                <th className="px-6 py-3">Vai trò</th>
                <th className="px-6 py-3">Phòng ban</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={u.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                    <div>
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-gray-500 text-xs">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                      u.role === UserRole.DEPARTMENT_LEAD ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {depts.find(d => d.id === u.departmentId)?.name || '---'}
                  </td>
                  <td className="px-6 py-4 text-right gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                      title="Sửa thông tin"
                      aria-label="Sửa thông tin"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(u.id)}
                      title="Xóa nhân sự"
                      aria-label="Xóa nhân sự"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{editingUser.id ? 'Sửa thông tin' : 'Thêm nhân sự mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ tên</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu {editingUser.id && '(Bỏ trống nếu không đổi)'}</label>
                <input
                  type="password"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={editingUser.id ? '********' : 'Nhập mật khẩu...'}
                  // interacting with extra field that is not in User type, so we cast or handle separately? 
                  // editingUser is Partial<User>, we need to extend it or just rely on JS dynamic nature/any cast
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value } as any)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vai trò</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                >
                  {Object.values(UserRole).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phòng ban</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingUser.departmentId}
                  onChange={e => setEditingUser({ ...editingUser, departmentId: e.target.value })}
                >
                  {depts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button onClick={handleSaveUser}><Save size={16} className="mr-2" /> Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
