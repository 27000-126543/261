import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { formatCurrency, formatDate, getCaseTypeLabel, getCaseStatusLabel, getCaseStatusColor } from '../../utils';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  BarChart3,
  PieChart,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const timesheets = useCaseStore((state) => state.timesheets);
  const bills = useCaseStore((state) => state.bills);
  const lawyers = [
    { id: 'user-101', name: '陈律师', cases: 3, hours: 120, revenue: 180000, winRate: 85 },
    { id: 'user-102', name: '刘律师', cases: 2, hours: 80, revenue: 96000, winRate: 78 },
    { id: 'user-103', name: '赵律师', cases: 2, hours: 150, revenue: 300000, winRate: 92 },
  ];

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status !== 'closed').length;
  const closedCases = cases.filter((c) => c.status === 'closed').length;
  const totalRevenue = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalBudget = cases.reduce((sum, c) => sum + c.budget, 0);
  const avgWinRate = 78;

  const stats = [
    {
      label: '案件总数',
      value: totalCases,
      change: '+12%',
      icon: <Briefcase size={24} />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: 'text-green-600',
    },
    {
      label: '进行中案件',
      value: activeCases,
      change: '+8%',
      icon: <Clock size={24} />,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      changeColor: 'text-green-600',
    },
    {
      label: '累计收费',
      value: formatCurrency(totalRevenue),
      change: '+23%',
      icon: <DollarSign size={24} />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600',
    },
    {
      label: '平均胜诉率',
      value: `${avgWinRate}%`,
      change: '+5%',
      icon: <Award size={24} />,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      changeColor: 'text-green-600',
    },
  ];

  const monthlyData = [
    { month: '1月', revenue: 320000, cases: 8, costs: 180000 },
    { month: '2月', revenue: 450000, cases: 12, costs: 220000 },
    { month: '3月', revenue: 380000, cases: 10, costs: 200000 },
    { month: '4月', revenue: 520000, cases: 15, costs: 250000 },
    { month: '5月', revenue: 480000, cases: 13, costs: 230000 },
    { month: '6月', revenue: 620000, cases: 18, costs: 280000 },
  ];

  const caseTypeData = [
    { name: '商事案件', value: cases.filter((c) => c.type === 'commercial').length, color: '#3b82f6' },
    { name: '民事案件', value: cases.filter((c) => c.type === 'civil').length, color: '#10b981' },
    { name: '知识产权', value: cases.filter((c) => c.type === 'intellectual').length, color: '#8b5cf6' },
    { name: '劳动争议', value: cases.filter((c) => c.type === 'labor').length, color: '#f59e0b' },
    { name: '国际仲裁', value: cases.filter((c) => c.type === 'international').length, color: '#ef4444' },
  ];

  const recentCases = cases.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">合伙人仪表盘</h1>
          <p className="text-gray-500 mt-1">律所运营数据概览</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/partner/analytics')} className="btn-secondary flex items-center gap-2">
            <BarChart3 size={18} />
            详细分析
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm font-medium mt-2 ${stat.changeColor}`}>
                  <TrendingUp size={14} className="inline mr-1" />
                  {stat.change} 较上月
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">营收与案件趋势</h3>
              <p className="text-sm text-gray-500">近6个月数据对比</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                <span className="text-xs text-gray-500">营收</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-gray-500">案件数</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#1a365d" radius={[4, 4, 0, 0]} name="营收" />
                <Bar yAxisId="right" dataKey="cases" fill="#10b981" radius={[4, 4, 0, 0]} name="案件数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">案件类型分布</h3>
            <p className="text-sm text-gray-500">按案件类型统计</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={caseTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {caseTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {caseTypeData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}</span>
                <span className="text-xs font-medium text-gray-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">律师业绩排行</h3>
            <button
              onClick={() => navigate('/partner/lawyers')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {lawyers.map((lawyer, index) => (
              <div key={lawyer.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                      : 'bg-gradient-to-br from-amber-600 to-amber-800'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{lawyer.name}</p>
                  <p className="text-sm text-gray-500">{lawyer.cases} 个案件 · {lawyer.hours} 工时</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">{formatCurrency(lawyer.revenue)}</p>
                  <p className="text-xs text-gray-500">胜诉率 {lawyer.winRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最新案件</h3>
            <button
              onClick={() => navigate('/partner/cases')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {recentCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-3 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                onClick={() => navigate(`/partner/cases`)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{caseItem.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {caseItem.caseNumber} · {caseItem.lawyerName}
                    </p>
                  </div>
                  <span className={`badge ${getCaseStatusColor(caseItem.status)} ml-2 flex-shrink-0`}>
                    {getCaseStatusLabel(caseItem.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{getCaseTypeLabel(caseItem.type)}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {formatCurrency(caseItem.usedAmount)} / {formatCurrency(caseItem.budget)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">收费率趋势</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1a365d"
                strokeWidth={3}
                dot={{ fill: '#1a365d', strokeWidth: 2 }}
                name="营收"
              />
              <Line
                type="monotone"
                dataKey="costs"
                stroke="#d4af37"
                strokeWidth={3}
                dot={{ fill: '#d4af37', strokeWidth: 2 }}
                name="成本"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
