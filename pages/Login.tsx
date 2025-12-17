import React, { useState, useEffect } from 'react';
import { auth } from '../services/auth';
import { Button } from '../components/UI';
import { LogIn, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('a.nguyen@company.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  // Fetch users for demo list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await api.getAllUsers();
        setDemoUsers(users);
      } catch (err) {
        console.error('Failed to fetch demo users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('[LoginUI] Login error caught:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Left Side - Brand/Creative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 text-white overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-white">R</span>
            </div>
            HỆ THỐNG BÁO CÁO TẬP TRUNG
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Quản lý báo cáo hiệu quả & minh bạch.</h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            Hệ thống tập trung giúp đơn giản hóa quy trình báo cáo, phê duyệt và theo dõi hiệu suất.
          </p>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          &copy; {new Date().getFullYear()} Corporate Internal System
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại</h1>
            <p className="text-gray-500 mt-2">Vui lòng đăng nhập để truy cập tài khoản của bạn.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-start animate-fade-in">
              <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Lỗi đăng nhập</h4>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 block">Email công việc</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-900 block">Mật khẩu</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">Quên mật khẩu?</a>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full py-3 text-base font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 rounded-xl" isLoading={loading}>
              {!loading && <LogIn size={20} className="mr-2" />}
              Đăng nhập hệ thống
            </Button>
          </form>

          {/* Developer Tools Toggle */}
          <div className="pt-8 border-t border-gray-100">
            <button
              onClick={() => setShowDemoUsers(!showDemoUsers)}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 uppercase tracking-wider flex items-center gap-2 mx-auto lg:mx-0 transition-colors"
            >
              Mode Demo Developers
              <span className={`transform transition-transform ${showDemoUsers ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showDemoUsers && (
              <div className="mt-4 grid grid-cols-1 gap-2 animate-fade-in-down max-h-60 overflow-y-auto">
                {demoUsers.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center italic">Đang tải danh sách người dùng...</p>
                ) : (
                  // Replaced demo users list rendering as per instruction
                  demoUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setEmail(u.email); setPassword(''); }}
                      className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group text-left w-full"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.role}</div>
                      </div>
                      <div className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Sử dụng →
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
