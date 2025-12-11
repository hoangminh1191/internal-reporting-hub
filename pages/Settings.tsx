
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { UserManager } from './admin/UserManager';
import { DefinitionManager } from './admin/DefinitionManager';
import { ShieldAlert, Users, FileCode } from 'lucide-react';

export const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'security'>(user?.role === UserRole.ADMIN ? 'reports' : 'security');

  useEffect(() => {
    api.getCurrentUser().then(u => {
      setUser(u);
      if (u.role !== UserRole.ADMIN) setActiveTab('security');
    });
  }, []);

  if (!user) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
        <p className="text-gray-500">Quản lý tài khoản và thiết lập hệ thống.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {(user.department?.code === 'GENERAL' || user.role === UserRole.ADMIN) && (
          <>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FileCode size={18} /> Mẫu báo cáo
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Users size={18} /> Người dùng
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'security'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <ShieldAlert size={18} /> Bảo mật
        </button>
      </div>

      <div className="flex-1">
        {activeTab === 'reports' && (user.department?.code === 'GENERAL' || user.role === UserRole.ADMIN) && <DefinitionManager />}
        {activeTab === 'users' && user.role === UserRole.ADMIN && <UserManager />}
        {activeTab === 'security' && <SecuritySettings user={user} />}
      </div>
    </div>
  );
};

const SecuritySettings: React.FC<{ user: User }> = ({ user }) => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.new !== passwords.confirm) {
      return setError('Mật khẩu mới không khớp');
    }
    if (passwords.new.length < 3) {
      return setError('Mật khẩu quá ngắn');
    }

    try {
      // In a real app we would verify current password on server. 
      // Here we just update the user with the new password via our existing API.
      await api.updateUser(user.id, { password: passwords.new });
      setSuccess('Đổi mật khẩu thành công!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Lỗi khi đổi mật khẩu');
    }
  };

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-medium mb-4">Đổi mật khẩu</h3>
      {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 mb-4 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={passwords.new}
            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
          <input
            type="password"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={passwords.confirm}
            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
};
