import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useMessageStore } from '../../store/useMessageStore';
import { UserRole } from '../../types';
import { getRoleLabel, getInitials } from '../../utils';
import {
  Scale,
  Home,
  Briefcase,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  Plus,
  FileSpreadsheet,
  Receipt,
  Gavel,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  client: [
    { label: '工作台', icon: <Home size={20} />, path: '/client' },
    { label: '我的案件', icon: <Briefcase size={20} />, path: '/client/cases' },
    { label: '提交委托', icon: <Plus size={20} />, path: '/client/submit' },
    { label: '账单中心', icon: <DollarSign size={20} />, path: '/client/bills' },
    { label: '发票管理', icon: <Receipt size={20} />, path: '/client/invoices' },
  ],
  lawyer: [
    { label: '工作台', icon: <Home size={20} />, path: '/lawyer' },
    { label: '案件管理', icon: <Briefcase size={20} />, path: '/lawyer/cases' },
    { label: '任务管理', icon: <FileText size={20} />, path: '/lawyer/tasks' },
    { label: '日程排期', icon: <Calendar size={20} />, path: '/lawyer/schedule' },
    { label: '工时记录', icon: <Clock size={20} />, path: '/lawyer/timesheet' },
  ],
  partner: [
    { label: '仪表盘', icon: <Home size={20} />, path: '/partner' },
    { label: '统计分析', icon: <BarChart3 size={20} />, path: '/partner/analytics' },
    { label: '案件总览', icon: <Briefcase size={20} />, path: '/partner/cases' },
    { label: '律师业绩', icon: <Users size={20} />, path: '/partner/lawyers' },
  ],
  arbitrator: [
    { label: '工作台', icon: <Home size={20} />, path: '/arbitrator' },
    { label: '待审案件', icon: <Gavel size={20} />, path: '/arbitrator/cases' },
    { label: '裁决书管理', icon: <FileText size={20} />, path: '/arbitrator/awards' },
  ],
  finance: [
    { label: '工作台', icon: <Home size={20} />, path: '/finance' },
    { label: '月度报表', icon: <FileSpreadsheet size={20} />, path: '/finance/reports' },
    { label: '发票管理', icon: <Receipt size={20} />, path: '/finance/invoices' },
  ],
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const unreadCount = useMessageStore((state) =>
    currentUser ? state.getUnreadCount(currentUser.id) : 0
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = currentUser ? roleNavItems[currentUser.role] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-primary-900 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-5 border-b border-primary-800">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'lg:justify-center'}`}>
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="text-white" size={22} />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-white font-serif font-bold text-lg">金杜律所</h1>
                  <p className="text-primary-400 text-xs">智能案件管理系统</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex hidden text-primary-400 hover:text-white p-1 rounded-lg hover:bg-primary-800"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`sidebar-link w-full ${
                        isActive ? 'sidebar-link-active' : ''
                      } ${!sidebarOpen && 'lg:justify-center lg:px-0'}`}
                      title={item.label}
                    >
                      {item.icon}
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 pt-4 border-t border-primary-800">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => navigate('/messages')}
                    className={`sidebar-link w-full relative ${
                      location.pathname === '/messages' ? 'sidebar-link-active' : ''
                    } ${!sidebarOpen && 'lg:justify-center lg:px-0'}`}
                    title="消息中心"
                  >
                    <MessageSquare size={20} />
                    {sidebarOpen && <span>消息中心</span>}
                    {unreadCount > 0 && sidebarOpen && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                    {unreadCount > 0 && !sidebarOpen && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full lg:block hidden"></span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/settings')}
                    className={`sidebar-link w-full ${
                      location.pathname === '/settings' ? 'sidebar-link-active' : ''
                    } ${!sidebarOpen && 'lg:justify-center lg:px-0'}`}
                    title="系统设置"
                  >
                    <Settings size={20} />
                    {sidebarOpen && <span>系统设置</span>}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {navItems.find((item) => item.path === location.pathname)?.label || '工作台'}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-medium text-sm">
                    {currentUser && getInitials(currentUser.name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">
                      {currentUser && getRoleLabel(currentUser.role)}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings size={16} />
                      个人设置
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
