import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { mockUsers } from '../data/mockData';
import { getRoleLabel, getInitials } from '../utils';
import { Scale, UserCircle, Mail, Lock, ChevronRight, Building2, Gavel, UserCheck, Wallet } from 'lucide-react';

const roleIcons: Record<UserRole, React.ReactNode> = {
  client: <Building2 size={24} />,
  lawyer: <Gavel size={24} />,
  partner: <UserCheck size={24} />,
  arbitrator: <Scale size={24} />,
  finance: <Wallet size={24} />,
};

const roleDescriptions: Record<UserRole, string> = {
  client: '提交案件委托，查看案件进展和账单',
  lawyer: '管理案件，记录工时，参与庭审',
  partner: '查看统计报表，监控案件进度',
  arbitrator: '接收案件材料，上传裁决书',
  finance: '管理收费，生成财务报表',
};

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleUsers = mockUsers.filter((u) => u.role === selectedRole);

  const handleSelectUser = (user: User) => {
    setEmail(user.email);
    setPassword('123456');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(email, selectedRole);
      if (success) {
        const roleRoutes: Record<UserRole, string> = {
          client: '/client',
          lawyer: '/lawyer',
          partner: '/partner',
          arbitrator: '/arbitrator',
          finance: '/finance',
        };
        navigate(roleRoutes[selectedRole]);
      } else {
        setError('登录失败，请检查邮箱和角色是否匹配');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">金杜国际律所</h1>
              <p className="text-primary-200 text-sm">King &amp; Wood International Law Firm</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">
            智能案件管理<br />与仲裁平台
          </h2>
          <p className="text-primary-200 text-lg mb-12 max-w-md">
            为跨国律所打造的全流程数字化案件管理系统，支持智能分配、自动排期、实时预警等核心功能。
          </p>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400 mb-2">10,000+</div>
              <div className="text-primary-300 text-sm">累计案件</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400 mb-2">500+</div>
              <div className="text-primary-300 text-sm">专业律师</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400 mb-2">98%</div>
              <div className="text-primary-300 text-sm">客户满意度</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-800 rounded-xl flex items-center justify-center">
              <Scale className="text-gold-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-primary-900">金杜国际律所</h1>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">欢迎回来</h2>
          <p className="text-gray-500 mb-8">请选择您的角色并登录系统</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">选择角色</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(roleIcons) as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setEmail('');
                    setError('');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === role
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className={`mb-1 ${selectedRole === role ? 'text-primary-600' : 'text-gray-400'}`}>
                    {roleIcons[role]}
                  </div>
                  <span className="text-xs font-medium">{getRoleLabel(role)}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">{roleDescriptions[selectedRole]}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">快速选择用户（演示）</label>
            <div className="flex flex-wrap gap-2">
              {roleUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    email === user.email
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-xs font-medium text-primary-700">
                    {getInitials(user.name)}
                  </div>
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（任意密码即可）"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-600">记住我</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                忘记密码？
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>登录系统</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            登录即表示您同意我们的<a href="#" className="text-primary-600 hover:underline">服务条款</a>和
            <a href="#" className="text-primary-600 hover:underline">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
