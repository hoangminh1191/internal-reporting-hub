
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Settings,
  Bell,
  Search,
  LogOut,
  PieChart,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.getCurrentUser().then(setUser).catch(e => {
      // If api fails (e.g. storage cleared manually), force logout
      if (onLogout) onLogout();
    });
  }, [onLogout]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-reports', label: 'Báo cáo của tôi', icon: FileText },
    { id: 'approvals', label: 'Duyệt báo cáo', icon: CheckSquare },
    { id: 'departments', label: 'Quản lý phòng ban', icon: Building2 },
    { id: 'aggregate', label: 'Tổng hợp dữ liệu', icon: PieChart },
    { id: 'settings', label: 'Cấu hình', icon: Settings },
  ];

  if (!user) return <div className="h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              R
            </div>
            <span className="text-xl font-bold tracking-tight">ReportHub</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;


            // Hide Approvals if not Lead/Admin
            if (item.id === 'approvals' && user.role === UserRole.DEPARTMENT_USER) return null;
            // Hide Departments if not Admin
            if (item.id === 'departments' && user.role !== UserRole.ADMIN) return null;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <img
              src={user.avatarUrl}
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm py-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-96">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm báo cáo, số liệu..."
              className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user.departmentId === 'd1' ? 'Phòng Vận hành' :
                  user.departmentId === 'd2' ? 'Phòng Kỹ thuật' : 'Phòng ban'}
              </p>
              <p className="text-xs text-gray-500">Code: {user.departmentId.toUpperCase()}</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
