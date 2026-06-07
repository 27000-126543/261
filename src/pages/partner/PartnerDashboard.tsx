import { useMemo } from 'react';
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
  Award,
  Target,
  TrendingDown,
  PieChart,
  Radar,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
} from 'recharts';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const timesheets = useCaseStore((state) => state.timesheets);
  const bills = useCaseStore((state) => state.bills);

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status !== 'closed').length;
  const closedCases = cases.filter((c) => c.status === 'closed').length;
  const totalRevenue = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalBilled = bills.reduce((sum, b) => sum + b.amount, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 0;

  const lawyerStats = useMemo(() => {
    const lawyerMap: Record<string, any> = {};
    
    cases.forEach((c) => {
      if (!c.lawyerId) return;
      if (!lawyerMap[c.lawyerId]) {
        lawyerMap[c.lawyerId] = {
          id: c.lawyerId,
          name: c.lawyerName,
          cases: 0,
          closedCases: 0,
          totalBudget: 0,
          usedAmount: 0,
          hours: 0,
          revenue: 0,
        };
      }
      lawyerMap[c.lawyerId].cases++;
      lawyerMap[c.lawyerId].totalBudget += c.budget;
      lawyerMap[c.lawyerId].usedAmount += c.usedAmount;
      if (c.status === 'closed') {
        lawyerMap[c.lawyerId].closedCases++;
      }
    });

    timesheets.forEach((t) => {
      if (lawyerMap[t.lawyerId]) {
        lawyerMap[t.lawyerId].hours += t.hours;
        lawyerMap[t.lawyerId].revenue += t.amount;
      }
    });

    return Object.values(lawyerMap).map((l) => ({
      ...l,
      winRate: l.cases > 0 ? Math.min(95, 65 + Math.round(Math.random() * 30)) : 0,
      feeRate: l.totalBudget > 0 ? Math.round((l.usedAmount / l.totalBudget) * 100) : 0,
    }));
  }, [cases, timesheets]);

  const caseComparisonData = useMemo(() => {
    return cases.slice(0, 5).map((c) => {
      const progress = c.status === 'closed' ? 100 : Math.min(95, Math.round((c.usedAmount / c.budget) * 100) + Math.floor(Math.random() * 20));
      const feeRate = c.budget > 0 ? Math.round((c.usedAmount / c.budget) * 100) : 0;
      const winRate = c.status === 'closed' ? (Math.random() > 0.2 ? 100 : 0) : Math.round(50 + Math.random() * 40);
      return {
        name: c.caseNumber.slice(-4),
        fullName: c.title,
        进度: progress,
        收费率: feeRate,
        胜诉率: winRate,
      };
    });
  }, [cases]);

  const radarData = useMemo(() => {
    const caseTypes = ['commercial', 'intellectual', 'labor', 'international', 'civil'];
    return caseTypes.map((type) => {
      const typeCases = cases.filter((c) => c.type === type);
      const totalBudget = typeCases.reduce((sum, c) => sum + c.budget, 0);
      const usedAmount = typeCases.reduce((sum, c) => sum + c.usedAmount, 0);
      return {
        subject: getCaseTypeLabel(type),
        案件数量: typeCases.length * 20,
        预算使用: totalBudget > 0 ? Math.round((usedAmount / totalBudget) * 100) : 0,
        完成率: typeCases.length > 0 ? Math.round((typeCases.filter((c) => c.status === 'closed').length / typeCases.length) * 100) : 0,
        客户满意度: Math.round(70 + Math.random() * 25),
      };
    });
  }, [cases]);

  const monthlyData = [
    { month: '1月', 营收: 320000, 成本: 180000, 案件数: 8 },
    { month: '2月', 营收: 450000, 成本: 220000, 案件数: 12 },
    { month: '3月', 营收: 380000, 成本: 200000, 案件数: 10 },
    { month: '4月', 营收: 520000, 成本: 250000, 案件数: 15 },
    { month: '5月', 营收: 480000, 成本: 230000, 案件数: 13 },
    { month: '6月', 营收: totalRevenue > 0 ? totalRevenue : 620000, 成本: 280000, 案件数: activeCases + closedCases },
  ];

  const caseTypeData = [
    { name: '商事案件', value: cases.filter((c) => c.type === 'commercial').length, color: '#3b82f6' },
    { name: '民事案件', value: cases.filter((c) => c.type === 'civil').length, color: '#10b981' },
    { name: '知识产权', value: cases.filter((c) => c.type === 'intellectual').length, color: '#8b5cf6' },
    { name: '劳动争议', value: cases.filter((c) => c.type === 'labor').length, color: '#f59e0b' },
    { name: '国际仲裁', value: cases.filter((c) => c.type === 'international').length, color: '#ef4444' },
  ];

  const stats = [
    {
      label: '案件总数',
      value: totalCases,
      change: `+${activeCases} 进行中`,
      icon: <Briefcase size={24} />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: 'text-blue-600',
    },
    {
      label: '回款率',
      value: `${collectionRate}%`,
      change: totalBilled > 0 ? `已收 ${formatCurrency(totalRevenue)}` : '暂无数据',
      icon: <DollarSign size={24} />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600',
    },
    {
      label: '累计收费',
      value: formatCurrency(totalRevenue),
      change: `预算总额 ${formatCurrency(cases.reduce((s, c) => s + c.budget, 0))}`,
      icon: <TrendingUp size={24} />,
      bgColor: 'bg-gold-50',
      iconColor: 'text-gold-600',
      changeColor: 'text-gold-600',
    },
    {
      label: '律师人数',
      value: lawyerStats.length,
      change: `人均 ${lawyerStats.length > 0 ? Math.round(totalRevenue / lawyerStats.length).toLocaleString() : 0} 元`,
      icon: <Users size={24} />,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      changeColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">合伙人仪表盘</h1>
          <p className="text-gray-500 mt-1">律所运营数据概览与案件对比分析</p>
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
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm font-medium mt-2 ${stat.changeColor}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target size={20} className="text-primary-600" />
                案件核心指标对比
              </h3>
              <p className="text-sm text-gray-500">进度、收费率、胜诉率对比</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caseComparisonData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`${value}%`, name];
                  }}
                  labelFormatter={(label: string, payload: any) => {
                    return payload?.[0]?.payload?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="进度" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="收费率" fill="#d4af37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="胜诉率" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
              <p className="text-xs text-gray-600">平均进度</p>
              <p className="text-lg font-bold text-blue-600">
                {Math.round(caseComparisonData.reduce((s, d) => s + d.进度, 0) / Math.max(1, caseComparisonData.length))}%
              </p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1"></div>
              <p className="text-xs text-gray-600">平均收费率</p>
              <p className="text-lg font-bold text-amber-600">
                {Math.round(caseComparisonData.reduce((s, d) => s + d.收费率, 0) / Math.max(1, caseComparisonData.length))}%
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
              <p className="text-xs text-gray-600">平均胜诉率</p>
              <p className="text-lg font-bold text-green-600">
                {Math.round(caseComparisonData.reduce((s, d) => s + d.胜诉率, 0) / Math.max(1, caseComparisonData.length))}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Radar size={20} className="text-purple-600" />
                案件类型能力雷达图
              </h3>
              <p className="text-sm text-gray-500">各类型案件综合表现</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <RechartsRadar name="案件数量" dataKey="案件数量" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <RechartsRadar name="预算使用" dataKey="预算使用" stroke="#d4af37" fill="#d4af37" fillOpacity={0.3} />
                <RechartsRadar name="完成率" dataKey="完成率" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <RechartsRadar name="客户满意度" dataKey="客户满意度" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">营收与成本趋势</h3>
              <p className="text-sm text-gray-500">近6个月数据对比</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                <span className="text-xs text-gray-500">营收</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-gray-500">成本</span>
              </div>
            </div>
          </div>
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
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="营收" stroke="#1a365d" strokeWidth={3} dot={{ fill: '#1a365d' }} />
                <Line type="monotone" dataKey="成本" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">案件类型分布</h3>
            <p className="text-sm text-gray-500">按案件类型统计</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={caseTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
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
          <div className="space-y-2 mt-4">
            {caseTypeData.filter((c) => c.value > 0).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}</span>
                <span className="text-xs font-medium text-gray-900 ml-auto">{item.value} 件</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-primary-600" />
            律师业绩对比
          </h3>
          <button
            onClick={() => navigate('/partner/lawyers')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            查看全部 <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">律师</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">案件数</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">工作时长</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">已结案件</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">收费总额</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">预算使用率</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">胜诉率</th>
              </tr>
            </thead>
            <tbody>
              {lawyerStats.map((lawyer, index) => (
                <tr key={lawyer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                            : 'bg-gradient-to-br from-primary-500 to-primary-700'
                        }`}
                      >
                        {lawyer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lawyer.name}</p>
                        <p className="text-xs text-gray-500">执业律师</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 font-medium text-gray-900">{lawyer.cases}</td>
                  <td className="text-center py-4 px-4 text-gray-600">{lawyer.hours}h</td>
                  <td className="text-center py-4 px-4">
                    <span className="badge bg-green-100 text-green-700">{lawyer.closedCases}</span>
                  </td>
                  <td className="text-center py-4 px-4 font-semibold text-gold-600">{formatCurrency(lawyer.revenue)}</td>
                  <td className="text-center py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            lawyer.feeRate > 80 ? 'bg-red-500' : lawyer.feeRate > 50 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${lawyer.feeRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{lawyer.feeRate}%</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className={`font-semibold ${lawyer.winRate >= 80 ? 'text-green-600' : lawyer.winRate >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {lawyer.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
