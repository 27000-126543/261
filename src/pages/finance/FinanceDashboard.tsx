import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { formatCurrency, formatDate, getBillStatusLabel, getBillStatusColor } from '../../utils';
import {
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Download,
  PieChart,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const bills = useCaseStore((state) => state.bills);
  const invoices = useCaseStore((state) => state.invoices);
  const cases = useCaseStore((state) => state.cases);

  const totalBilled = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalUnpaid = totalBilled - totalPaid;
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
  const pendingInvoices = invoices.filter((i) => i.status === 'pending' || i.status === 'issued');

  const stats = [
    {
      label: '本月收费',
      value: formatCurrency(428000),
      change: '+15.2%',
      icon: <DollarSign size={24} />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600',
    },
    {
      label: '回款率',
      value: `${collectionRate}%`,
      change: '+3.5%',
      icon: <TrendingUp size={24} />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: 'text-green-600',
    },
    {
      label: '待开票',
      value: pendingInvoices.length,
      change: '+2',
      icon: <Receipt size={24} />,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      changeColor: 'text-amber-600',
    },
    {
      label: '逾期账款',
      value: formatCurrency(68000),
      change: '-8%',
      icon: <AlertTriangle size={24} />,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      changeColor: 'text-green-600',
    },
  ];

  const monthlyRevenue = [
    { month: '1月', 已收: 280000, 待收: 80000 },
    { month: '2月', 已收: 350000, 待收: 120000 },
    { month: '3月', 已收: 320000, 待收: 95000 },
    { month: '4月', 已收: 410000, 待收: 110000 },
    { month: '5月', 已收: 380000, 待收: 85000 },
    { month: '6月', 已收: 428000, 待收: 68000 },
  ];

  const lawyerRevenue = [
    { name: '陈律师', value: 180000, color: '#3b82f6' },
    { name: '刘律师', value: 96000, color: '#10b981' },
    { name: '赵律师', value: 300000, color: '#8b5cf6' },
  ];

  const recentBills = bills.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">财务工作台</h1>
          <p className="text-gray-500 mt-1">{currentUser?.name}，欢迎回来</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/finance/reports')} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={18} />
            生成报表
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download size={18} />
            导出数据
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
              <h3 className="text-lg font-semibold text-gray-900">月度收费趋势</h3>
              <p className="text-sm text-gray-500">已收与待收对比</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
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
                <Bar dataKey="已收" fill="#1a365d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="待收" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">律师收费占比</h3>
            <p className="text-sm text-gray-500">本月各律师业绩</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={lawyerRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {lawyerRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {lawyerRevenue.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium text-gray-900 ml-auto">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近账单</h3>
            <button
              onClick={() => navigate('/finance/reports')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {recentBills.map((bill) => (
              <div key={bill.id} className="p-3 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{bill.caseName}</p>
                    <p className="text-xs text-gray-500">账单日期：{formatDate(bill.issuedDate)}</p>
                  </div>
                  <span className={`badge ${getBillStatusColor(bill.status)}`}>
                    {getBillStatusLabel(bill.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    已付：{formatCurrency(bill.paidAmount)} / {formatCurrency(bill.amount)}
                  </span>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${bill.amount > 0 ? Math.round((bill.paidAmount / bill.amount) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">待处理发票</h3>
            <button
              onClick={() => navigate('/finance/invoices')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">收票人：{invoice.recipient}</p>
                  </div>
                  <span className="badge bg-amber-100 text-amber-700">
                    {invoice.status === 'pending' ? '待开具' : '已开具'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </span>
                  <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    处理 →
                  </button>
                </div>
              </div>
            ))}
            {pendingInvoices.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
                <p className="text-sm text-gray-500">暂无待处理发票</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
