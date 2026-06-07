import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { formatCurrency, formatDate, getCaseTypeLabel, getCaseStatusLabel, getCaseStatusColor } from '../../utils';
import {
  Gavel,
  FileText,
  Clock,
  CheckCircle,
  Upload,
  Eye,
  ChevronRight,
  AlertCircle,
  FileCheck,
  Users,
} from 'lucide-react';

const ArbitratorDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const documents = useCaseStore((state) => state.documents);

  const myCases = cases.filter((c) => c.arbitratorId === currentUser?.id);
  const pendingCases = myCases.filter((c) => c.status === 'arbitration' || c.status === 'hearing');
  const completedCases = myCases.filter((c) => c.status === 'closed');

  const stats = [
    {
      label: '待审案件',
      value: pendingCases.length,
      icon: <Gavel size={24} />,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: '已结案件',
      value: completedCases.length,
      icon: <CheckCircle size={24} />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: '待阅材料',
      value: 12,
      icon: <FileText size={24} />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '本月裁决',
      value: 5,
      icon: <FileCheck size={24} />,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仲裁员工作台</h1>
          <p className="text-gray-500 mt-1">{currentUser?.name}，欢迎回来</p>
        </div>
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
            <h3 className="text-lg font-semibold text-gray-900">待审案件</h3>
            <button
              onClick={() => navigate('/arbitrator/cases')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {pendingCases.map((caseItem) => {
              const caseDocuments = documents.filter((d) => d.caseId === caseItem.id);
              return (
                <div
                  key={caseItem.id}
                  className="p-4 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                  onClick={() => navigate(`/arbitrator/cases/${caseItem.id}`)}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>类型：{getCaseTypeLabel(caseItem.type)}</span>
                      <span>申请方：{caseItem.clientName}</span>
                      <span>律师：{caseItem.lawyerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{caseDocuments.length} 份材料待审阅</span>
                    <AlertCircle size={14} className="text-amber-500 ml-auto" />
                    <span className="text-xs text-amber-600">需在 7 天内完成</span>
                  </div>
                </div>
              );
            })}
            {pendingCases.length === 0 && (
              <div className="text-center py-12">
                <Gavel className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">暂无待审案件</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/arbitrator/cases')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-all"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                  <Gavel size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">审理案件</p>
                  <p className="text-xs text-gray-500">查看案件材料并作出裁决</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <Upload size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">上传裁决书</p>
                  <p className="text-xs text-gray-500">提交案件裁决文件</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                  <FileText size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">已结案件</p>
                  <p className="text-xs text-gray-500">查看历史裁决记录</p>
                </div>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">仲裁日程</h3>
            <div className="space-y-3">
              <div className="p-3 bg-primary-50/50 rounded-lg border border-primary-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="text-primary-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">在线仲裁听证</p>
                    <p className="text-xs text-gray-500">Global Trade跨境贸易仲裁</p>
                    <p className="text-xs text-primary-600 font-medium mt-1">今天 14:00 - 16:00</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="text-gray-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">裁决书提交截止</p>
                    <p className="text-xs text-gray-500">创意工作室专利侵权案</p>
                    <p className="text-xs text-gray-600 mt-1">明天 17:00 前</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArbitratorDashboard;
