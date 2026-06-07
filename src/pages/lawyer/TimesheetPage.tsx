import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { formatCurrency, formatDate, getCaseTypeLabel } from '../../utils';
import {
  Clock,
  Plus,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  X,
  Calendar,
  Briefcase,
  Timer,
} from 'lucide-react';

const workTypes = [
  { value: 'research', label: '法律研究', rate: 800 },
  { value: 'drafting', label: '文书起草', rate: 1000 },
  { value: 'meeting', label: '客户会议', rate: 1200 },
  { value: 'court', label: '出庭诉讼', rate: 2000 },
  { value: 'negotiation', label: '谈判调解', rate: 1500 },
  { value: 'other', label: '其他工作', rate: 600 },
];

const TimesheetPage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const timesheets = useCaseStore((state) => state.timesheets);
  const addTimesheet = useCaseStore((state) => state.addTimesheet);
  const updateCase = useCaseStore((state) => state.updateCase);
  const addMessage = useMessageStore((state) => state.addMessage);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    caseId: '',
    workType: '',
    hours: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const myCases = cases.filter((c) => c.lawyerId === currentUser?.id);
  const myTimesheets = timesheets.filter((t) => t.lawyerId === currentUser?.id);

  const totalHours = myTimesheets.reduce((sum, t) => sum + t.hours, 0);
  const totalAmount = myTimesheets.reduce((sum, t) => sum + t.amount, 0);
  const todayHours = myTimesheets
    .filter((t) => t.workDate?.split('T')[0] === new Date().toISOString().split('T')[0])
    .reduce((sum, t) => sum + t.hours, 0);

  const handleSubmit = () => {
    if (!formData.caseId || !formData.workType || formData.hours <= 0) return;

    const workType = workTypes.find((w) => w.value === formData.workType);
    const rate = workType?.rate || 800;

    addTimesheet({
      caseId: formData.caseId,
      caseName: myCases.find((c) => c.id === formData.caseId)?.title || '',
      lawyerId: currentUser?.id || '',
      lawyerName: currentUser?.name || '',
      workDate: formData.date,
      hours: formData.hours,
      rate,
      description: formData.description,
    });

    const caseItem = cases.find((c) => c.id === formData.caseId);
    if (caseItem) {
      const newUsedAmount = caseItem.usedAmount + formData.hours * rate;
      updateCase(formData.caseId, { usedAmount: newUsedAmount });

      if (newUsedAmount >= caseItem.budget * 0.8 && caseItem.usedAmount < caseItem.budget * 0.8) {
        addMessage(
          currentUser?.id || '',
          'budget_warning',
          '预算预警通知',
          `案件「${caseItem.title}」费用已达到预算的80%（¥${newUsedAmount.toLocaleString()} / ¥${caseItem.budget.toLocaleString()}），请注意控制成本。`,
          caseItem.id
        );
        addMessage(
          'partner-1',
          'budget_warning',
          '预算预警通知',
          `案件「${caseItem.title}」费用已达到预算的80%，律师「${currentUser?.name}」。`,
          caseItem.id
        );
      }
    }

    setShowModal(false);
    setFormData({
      caseId: '',
      workType: '',
      hours: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const stats = [
    { label: '今日工时', value: `${todayHours}h`, icon: <Timer size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '本月工时', value: `${totalHours}h`, icon: <Clock size={24} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '预计费用', value: formatCurrency(totalAmount), icon: <DollarSign size={24} />, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: '记录条数', value: myTimesheets.length, icon: <FileText size={24} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lawyer')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">工时记录</h1>
            <p className="text-gray-500 mt-1">记录工作时长，系统自动计算费用</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          添加工时
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">日期</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">案件</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">工作类型</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">时长</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">费率</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">金额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myTimesheets.map((ts) => {
                const workType = workTypes.find((w) => w.value === ts.workType);
                return (
                  <tr key={ts.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(ts.workDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ts.caseName}</div>
                      <div className="text-xs text-gray-500">{ts.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workType?.label || ts.workType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ts.hours}h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(ts.rate)}/h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gold-600">{formatCurrency(ts.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge bg-green-100 text-green-700">已确认</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {myTimesheets.length === 0 && (
          <div className="text-center py-16">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无工时记录</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
              立即添加
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">添加工时记录</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择案件</label>
                <select
                  className="input-field"
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                >
                  <option value="">请选择案件</option>
                  {myCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({getCaseTypeLabel(c.type)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工作类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {workTypes.map((wt) => (
                    <button
                      key={wt.value}
                      onClick={() => setFormData({ ...formData, workType: wt.value })}
                      className={`p-3 border rounded-lg text-left text-sm transition-all ${
                        formData.workType === wt.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{wt.label}</div>
                      <div className="text-xs text-gold-600">{formatCurrency(wt.rate)}/小时</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">工作时长（小时）</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="输入小时数"
                    value={formData.hours || ''}
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工作描述</label>
                <textarea
                  className="input-field"
                  placeholder="简要描述工作内容..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {formData.workType && formData.hours > 0 && (
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">预计费用</span>
                    <span className="text-xl font-bold text-gold-600">
                      {formatCurrency((workTypes.find((w) => w.value === formData.workType)?.rate || 0) * formData.hours)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.caseId || !formData.workType || formData.hours <= 0}
                className="btn-primary flex-1"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetPage;
