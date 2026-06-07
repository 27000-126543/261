import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { formatCurrency, formatDate, formatDateTime, getCaseStatusLabel, getCaseStatusColor, getTaskStatusLabel, getTaskStatusColor, getTaskPriorityLabel, getTaskPriorityColor } from '../../utils';
import {
  Briefcase,
  Clock,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Plus,
  ChevronRight,
  AlertCircle,
  Gavel,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const tasks = useCaseStore((state) => state.tasks);
  const timesheets = useCaseStore((state) => state.timesheets);
  const hearings = useCaseStore((state) => state.hearings);
  const messages = useMessageStore((state) => state.messages);

  const myCases = cases.filter((c) => c.lawyerId === currentUser?.id);
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);
  const myTimesheets = timesheets.filter((t) => t.lawyerId === currentUser?.id);
  const myHearings = hearings.filter((h) => myCases.some((c) => c.id === h.caseId));
  const myMessages = messages.filter((m) => m.userId === currentUser?.id && !m.isRead);

  const totalHours = myTimesheets.reduce((sum, t) => sum + t.hours, 0);
  const totalAmount = myTimesheets.reduce((sum, t) => sum + t.amount, 0);
  const pendingTasks = myTasks.filter((t) => t.status !== 'completed');
  const budgetWarningCases = myCases.filter((c) => (c.usedAmount / c.budget) >= 0.8);

  const stats = [
    {
      label: '负责案件',
      value: myCases.length,
      unit: '件',
      icon: <Briefcase size={24} />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '待办任务',
      value: pendingTasks.length,
      unit: '项',
      icon: <CheckSquare size={24} />,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: '本月工时',
      value: totalHours,
      unit: '小时',
      icon: <Clock size={24} />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: '即将庭审',
      value: myHearings.filter((h) => h.status === 'scheduled').length,
      unit: '场',
      icon: <Gavel size={24} />,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const upcomingHearings = myHearings
    .filter((h) => h.status === 'scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">律师工作台</h1>
          <p className="text-gray-500 mt-1">{currentUser?.name}，欢迎回来</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/lawyer/timesheet')} className="btn-secondary flex items-center gap-2">
            <Clock size={18} />
            记录工时
          </button>
          <button onClick={() => navigate('/lawyer/cases')} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            新建案件
          </button>
        </div>
      </div>

      {budgetWarningCases.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-amber-800">预算预警提醒</p>
              <p className="text-sm text-amber-700 mt-1">
                您有 {budgetWarningCases.length} 个案件预算使用已超过80%，请注意控制成本
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
                <span className="text-lg font-normal text-gray-500 ml-1">{stat.unit}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">我的案件</h3>
            <button
              onClick={() => navigate('/lawyer/cases')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">案件名称</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">预算进度</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {myCases.slice(0, 5).map((caseItem) => {
                  const budgetPercent = Math.round((caseItem.usedAmount / caseItem.budget) * 100);
                  const isWarning = budgetPercent >= 80;
                  return (
                    <tr
                      key={caseItem.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/lawyer/cases/${caseItem.id}`)}
                    >
                      <td className="py-4 px-2">
                        <p className="font-medium text-gray-900">{caseItem.title}</p>
                        <p className="text-xs text-gray-500">{caseItem.caseNumber}</p>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`badge ${getCaseStatusColor(caseItem.status)}`}>
                          {getCaseStatusLabel(caseItem.status)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isWarning ? 'bg-amber-500' : 'bg-primary-500'}`}
                              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${isWarning ? 'text-amber-600' : 'text-gray-600'}`}>
                            {budgetPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-500">{formatDate(caseItem.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">待办任务</h3>
              <button
                onClick={() => navigate('/lawyer/tasks')}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                全部任务
              </button>
            </div>
            <div className="space-y-3">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                  onClick={() => navigate('/lawyer/tasks')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{task.caseName}</p>
                    </div>
                    <span className={`badge ${getTaskPriorityColor(task.priority)} ml-2`}>
                      {getTaskPriorityLabel(task.priority)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`badge ${getTaskStatusColor(task.status)}`}>
                      {getTaskStatusLabel(task.status)}
                    </span>
                    <span className="text-xs text-gray-400">截止：{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-6">
                  <CheckSquare className="mx-auto text-green-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">暂无待办任务</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">即将庭审</h3>
              <button
                onClick={() => navigate('/lawyer/schedule')}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                全部日程
              </button>
            </div>
            <div className="space-y-3">
              {upcomingHearings.map((hearing) => (
                <div key={hearing.id} className="p-3 bg-primary-50/50 rounded-lg border border-primary-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="text-primary-600" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{hearing.caseName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{hearing.court}</p>
                      <p className="text-xs text-primary-600 font-medium mt-1">
                        {formatDateTime(hearing.startTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingHearings.length === 0 && (
                <div className="text-center py-6">
                  <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-gray-500">暂无即将到来的庭审</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">本月业绩概览</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="text-gray-400" size={16} />
              <span className="text-sm text-gray-500">
                累计工时：<span className="font-medium text-gray-700">{totalHours} 小时</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="text-gray-400" size={16} />
              <span className="text-sm text-gray-500">
                累计收费：<span className="font-medium text-primary-600">{formatCurrency(totalAmount)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <div className="grid grid-cols-7 gap-2 h-full">
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, i) => {
              const hours = Math.floor(Math.random() * 8) + 2;
              const heightPercent = (hours / 10) * 100;
              return (
                <div key={day} className="flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-500"
                    style={{ height: `${heightPercent}%` }}
                    title={`${hours} 小时`}
                  />
                  <span className="text-xs text-gray-500 mt-2">{day}</span>
                  <span className="text-xs font-medium text-gray-700">{hours}h</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
