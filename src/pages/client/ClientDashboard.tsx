import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { formatCurrency, formatDate, getCaseStatusLabel, getCaseStatusColor } from '../../utils';
import {
  Briefcase,
  DollarSign,
  FileText,
  Clock,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const bills = useCaseStore((state) => state.bills);
  const messages = useMessageStore((state) => state.messages);

  const myCases = cases.filter((c) => c.clientId === currentUser?.id);
  const myBills = bills.filter((b) => b.clientId === currentUser?.id);
  const myMessages = messages.filter((m) => m.userId === currentUser?.id && !m.isRead);

  const totalBudget = myCases.reduce((sum, c) => sum + c.budget, 0);
  const totalUsed = myCases.reduce((sum, c) => sum + c.usedAmount, 0);
  const unpaidBills = myBills.filter((b) => b.status !== 'paid');

  const stats = [
    {
      label: '我的案件',
      value: myCases.length,
      icon: <Briefcase size={24} />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '进行中',
      value: myCases.filter((c) => c.status !== 'closed').length,
      icon: <Loader size={24} />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: '待支付账单',
      value: unpaidBills.length,
      icon: <DollarSign size={24} />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: '未读消息',
      value: myMessages.length,
      icon: <FileText size={24} />,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来，{currentUser?.name}</h1>
          <p className="text-gray-500 mt-1">以下是您的案件进展概览</p>
        </div>
        <button onClick={() => navigate('/client/cases/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          提交新委托
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
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
            <h3 className="text-lg font-semibold text-gray-900">我的案件</h3>
            <button
              onClick={() => navigate('/client/cases')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {myCases.slice(0, 3).map((caseItem) => {
              const budgetPercent = Math.round((caseItem.usedAmount / caseItem.budget) * 100);
              const isOverBudget = budgetPercent >= 80;
              return (
                <div
                  key={caseItem.id}
                  className="p-4 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                  onClick={() => navigate(`/client/cases/${caseItem.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{caseItem.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">案件编号：{caseItem.caseNumber}</p>
                    </div>
                    <span className={`badge ${getCaseStatusColor(caseItem.status)}`}>
                      {getCaseStatusLabel(caseItem.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">负责律师：{caseItem.lawyerName}</span>
                      <span className="text-gray-500">创建于：{formatDate(caseItem.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <span className="flex items-center gap-1 text-amber-600 text-xs">
                          <AlertCircle size={14} />
                          预算预警
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">预算使用</span>
                      <span className={`font-medium ${isOverBudget ? 'text-amber-600' : 'text-gray-700'}`}>
                        {formatCurrency(caseItem.usedAmount)} / {formatCurrency(caseItem.budget)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget ? 'bg-amber-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {myCases.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">暂无案件，点击上方按钮提交新委托</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">费用概览</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">总预算</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">已使用</span>
                  <span className="font-semibold text-primary-600">{formatCurrency(totalUsed)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                    style={{ width: `${totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">未支付金额</span>
                  <span className="font-semibold text-amber-600">
                    {formatCurrency(unpaidBills.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">最新通知</h3>
              <button
                onClick={() => navigate('/messages')}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                全部消息
              </button>
            </div>
            <div className="space-y-3">
              {myMessages.slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 bg-primary-50/50 rounded-lg border border-primary-100 cursor-pointer hover:bg-primary-50 transition-colors"
                  onClick={() => navigate('/messages')}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={16} className="text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{msg.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {myMessages.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">暂无新消息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
