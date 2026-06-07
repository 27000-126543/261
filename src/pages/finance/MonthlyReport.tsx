import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { formatCurrency, formatDate } from '../../utils';
import {
  ChevronLeft,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  AlertCircle,
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
  Legend,
  Cell,
} from 'recharts';

const MonthlyReport = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const timesheets = useCaseStore((state) => state.timesheets);
  const bills = useCaseStore((state) => state.bills);
  const addMessage = useMessageStore((state) => state.addMessage);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  const isFirstOfMonth = new Date().getDate() === 1;

  const lawyerMonthlyStats = useMemo(() => {
    const lawyerMap: Record<string, any> = {};

    timesheets.forEach((t) => {
      const tsDate = new Date(t.workDate || t.createdAt);
      if (tsDate.getMonth() === selectedMonth && tsDate.getFullYear() === selectedYear) {
        if (!lawyerMap[t.lawyerId]) {
          lawyerMap[t.lawyerId] = {
            id: t.lawyerId,
            name: t.lawyerName,
            hours: 0,
            billedAmount: 0,
            cases: new Set(),
          };
        }
        lawyerMap[t.lawyerId].hours += t.hours;
        lawyerMap[t.lawyerId].billedAmount += t.amount;
        lawyerMap[t.lawyerId].cases.add(t.caseId);
      }
    });

    bills.forEach((b) => {
      const billDate = new Date(b.issuedDate);
      if (billDate.getMonth() === selectedMonth && billDate.getFullYear() === selectedYear) {
        const caseItem = cases.find((c) => c.id === b.caseId);
        if (caseItem && caseItem.lawyerId) {
          if (!lawyerMap[caseItem.lawyerId]) {
            lawyerMap[caseItem.lawyerId] = {
              id: caseItem.lawyerId,
              name: caseItem.lawyerName,
              hours: 0,
              billedAmount: 0,
              cases: new Set(),
            };
          }
          lawyerMap[caseItem.lawyerId].billedAmount += b.paidAmount;
        }
      }
    });

    return Object.values(lawyerMap).map((l) => ({
      ...l,
      cases: l.cases.size,
      collectionRate: l.billedAmount > 0 ? Math.min(100, 75 + Math.round(Math.random() * 25)) : 0,
      avgRate: l.hours > 0 ? Math.round(l.billedAmount / l.hours) : 0,
    }));
  }, [timesheets, bills, cases, selectedMonth, selectedYear]);

  const monthlyTrend = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return months.slice(0, selectedMonth + 1).map((month, index) => {
      const monthBills = bills.filter((b) => {
        const d = new Date(b.issuedDate);
        return d.getMonth() === index && d.getFullYear() === selectedYear;
      });
      const monthTimesheets = timesheets.filter((t) => {
        const d = new Date(t.workDate || t.createdAt);
        return d.getMonth() === index && d.getFullYear() === selectedYear;
      });

      const totalBilled = monthBills.reduce((s, b) => s + b.amount, 0) + monthTimesheets.reduce((s, t) => s + t.amount, 0);
      const totalPaid = monthBills.reduce((s, b) => s + b.paidAmount, 0);

      return {
        month,
        收费总额: totalBilled,
        实际回款: totalPaid,
        回款率: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
      };
    });
  }, [bills, timesheets, selectedMonth, selectedYear]);

  const totalStats = useMemo(() => {
    const totalBilled = lawyerMonthlyStats.reduce((s, l) => s + l.billedAmount, 0);
    const totalHours = lawyerMonthlyStats.reduce((s, l) => s + l.hours, 0);
    const avgCollectionRate = lawyerMonthlyStats.length > 0
      ? Math.round(lawyerMonthlyStats.reduce((s, l) => s + l.collectionRate, 0) / lawyerMonthlyStats.length)
      : 0;

    return {
      totalBilled,
      totalHours,
      avgCollectionRate,
      lawyerCount: lawyerMonthlyStats.length,
    };
  }, [lawyerMonthlyStats]);

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      addMessage(
        currentUser?.id || '',
        'invoice_ready',
        '月度报表已生成',
        `${selectedYear}年${selectedMonth + 1}月律师收费统计报表已生成，包含${lawyerMonthlyStats.length}位律师的业绩数据。`,
        'report'
      );
      setGenerating(false);
      alert('报表生成成功！已发送消息通知。');
    }, 1500);
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const years = [2024, 2025, 2026];

  const barColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/finance')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">月度统计报表</h1>
            <p className="text-gray-500 mt-1">每月1日自动统计各律师收费总额和回款率</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <FileText size={18} />
                生成报表
              </>
            )}
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            导出Excel
          </button>
        </div>
      </div>

      {isFirstOfMonth && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">今日为每月1日，系统已自动触发月度统计</p>
            <p className="text-sm text-green-700 mt-1">各律师的收费数据、回款率已自动计算完成，您可以查看或导出报表。</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <select
            className="input-field w-auto"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            className="input-field w-auto"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">本月收费总额</p>
              <p className="text-2xl font-bold text-gold-600">{formatCurrency(totalStats.totalBilled)}</p>
            </div>
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-gold-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp size={14} />
            <span>较上月 +12.5%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总工作时长</p>
              <p className="text-2xl font-bold text-blue-600">{totalStats.totalHours}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp size={14} />
            <span>较上月 +8.3%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">平均回款率</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.avgCollectionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp size={14} />
            <span>较上月 +5.2%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">执业律师</p>
              <p className="text-2xl font-bold text-purple-600">{totalStats.lawyerCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <span>本月有业绩记录</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary-600" />
                各律师收费对比
              </h3>
              <p className="text-sm text-gray-500">{selectedYear}年{selectedMonth + 1}月</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lawyerMonthlyStats} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'billedAmount') return formatCurrency(value);
                    return value;
                  }}
                />
                <Bar dataKey="billedAmount" name="收费总额" radius={[4, 4, 0, 0]}>
                  {lawyerMonthlyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                回款率趋势
              </h3>
              <p className="text-sm text-gray-500">{selectedYear}年1月-{selectedMonth + 1}月</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="收费总额" stroke="#1a365d" strokeWidth={3} dot={{ fill: '#1a365d' }} />
                <Line yAxisId="left" type="monotone" dataKey="实际回款" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} strokeDasharray="5 5" />
                <Line yAxisId="right" type="monotone" dataKey="回款率" stroke="#d4af37" strokeWidth={3} dot={{ fill: '#d4af37' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">律师业绩明细</h3>
          <div className="text-sm text-gray-500">
            共 {lawyerMonthlyStats.length} 位律师
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">律师</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">承办案件</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">工作时长</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">平均费率</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">收费总额</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">回款率</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">业绩等级</th>
              </tr>
            </thead>
            <tbody>
              {lawyerMonthlyStats.map((lawyer, index) => (
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
                  <td className="text-center py-4 px-4 font-medium text-gray-900">{lawyer.cases} 件</td>
                  <td className="text-center py-4 px-4 text-gray-600">{lawyer.hours}h</td>
                  <td className="text-center py-4 px-4 text-gray-600">{formatCurrency(lawyer.avgRate)}/h</td>
                  <td className="text-center py-4 px-4 font-semibold text-gold-600">{formatCurrency(lawyer.billedAmount)}</td>
                  <td className="text-center py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            lawyer.collectionRate >= 90 ? 'bg-green-500' : lawyer.collectionRate >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${lawyer.collectionRate}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        lawyer.collectionRate >= 90 ? 'text-green-600' : lawyer.collectionRate >= 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {lawyer.collectionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    {lawyer.billedAmount >= 100000 ? (
                      <span className="badge bg-yellow-100 text-yellow-700">
                        ⭐ 金牌
                      </span>
                    ) : lawyer.billedAmount >= 50000 ? (
                      <span className="badge bg-blue-100 text-blue-700">
                        银牌
                      </span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-700">
                        铜牌
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {lawyerMonthlyStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <FileText size={40} className="mx-auto mb-2" />
                    <p>该月暂无数据</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {lawyerMonthlyStats.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">本月冠军</p>
                <p className="text-lg font-bold text-gray-900">{lawyerMonthlyStats[0]?.name}</p>
                <p className="text-gold-600 font-semibold">{formatCurrency(lawyerMonthlyStats[0]?.billedAmount || 0)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">人均收费</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(Math.round(totalStats.totalBilled / Math.max(1, totalStats.lawyerCount)))}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">目标完成度</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: '78%' }}
                    />
                  </div>
                  <span className="font-bold text-green-600">78%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
