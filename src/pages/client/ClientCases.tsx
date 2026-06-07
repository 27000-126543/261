import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { formatCurrency, formatDate, getCaseTypeLabel, getCaseStatusLabel, getCaseStatusColor } from '../../utils';
import {
  ChevronLeft,
  Plus,
  Briefcase,
  Clock,
  DollarSign,
  User,
  FileText,
  Eye,
  X,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const ClientCases = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const tasks = useCaseStore((state) => state.tasks);
  const hearings = useCaseStore((state) => state.hearings);
  const documents = useCaseStore((state) => state.documents);

  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const myCases = cases.filter((c) => c.clientId === currentUser?.id);

  const handleViewDetail = (caseItem: any) => {
    setSelectedCase(caseItem);
    setShowDetail(true);
  };

  const caseTasks = selectedCase ? tasks.filter((t) => t.caseId === selectedCase.id) : [];
  const caseHearings = selectedCase ? hearings.filter((h) => h.caseId === selectedCase.id) : [];
  const caseDocuments = selectedCase ? documents.filter((d) => d.caseId === selectedCase.id) : [];
  const progress = selectedCase
    ? Math.round(
        (caseTasks.filter((t) => t.status === 'completed').length / Math.max(1, caseTasks.length)) * 100
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/client')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的案件</h1>
            <p className="text-gray-500 mt-1">共 {myCases.length} 个案件</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/client/submit')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          提交新委托
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myCases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewDetail(caseItem)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Briefcase size={24} className="text-primary-600" />
              </div>
              <span className={`badge ${getCaseStatusColor(caseItem.status)}`}>
                {getCaseStatusLabel(caseItem.status)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{caseItem.title}</h3>
            <p className="text-sm text-gray-500 mb-3">
              案件编号：{caseItem.caseNumber}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <User size={14} />
                  主办律师
                </span>
                <span className="font-medium text-gray-900">{caseItem.lawyerName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <DollarSign size={14} />
                  预算/已用
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(caseItem.usedAmount)} / {formatCurrency(caseItem.budget)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar size={14} />
                  立案时间
                </span>
                <span className="text-gray-600">{formatDate(caseItem.createdAt)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">案件进度</span>
                <span className="text-xs font-medium text-primary-600">
                  {Math.round((caseItem.usedAmount / Math.max(1, caseItem.budget)) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((caseItem.usedAmount / Math.max(1, caseItem.budget)) * 100))}%`,
                  }}
                />
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(caseItem);
              }}
              className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Eye size={16} />
              查看详情
            </button>
          </div>
        ))}
      </div>

      {showDetail && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCase.title}</h2>
                <p className="text-sm text-gray-500 mt-1">案件编号：{selectedCase.caseNumber}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">案件类型</p>
                  <p className="font-semibold text-gray-900">{getCaseTypeLabel(selectedCase.type)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">案件状态</p>
                  <span className={`badge ${getCaseStatusColor(selectedCase.status)}`}>
                    {getCaseStatusLabel(selectedCase.status)}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">主办律师</p>
                  <p className="font-semibold text-gray-900">{selectedCase.lawyerName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">立案时间</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedCase.createdAt)}</p>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-gold-600" />
                  费用信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-500">预算总额</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedCase.budget)}</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-gray-500">已使用</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(selectedCase.usedAmount)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-gray-500">剩余预算</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(Math.max(0, selectedCase.budget - selectedCase.usedAmount))}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">预算使用率</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((selectedCase.usedAmount / Math.max(1, selectedCase.budget)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (selectedCase.usedAmount / selectedCase.budget) > 0.8
                          ? 'bg-red-500'
                          : (selectedCase.usedAmount / selectedCase.budget) > 0.5
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (selectedCase.usedAmount / Math.max(1, selectedCase.budget)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  任务进度
                </h3>
                <div className="space-y-3">
                  {caseTasks.length > 0 ? (
                    caseTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            task.status === 'completed'
                              ? 'bg-green-500'
                              : task.status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">截止：{formatDate(task.dueDate)}</p>
                        </div>
                        <span
                          className={`badge ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {task.status === 'completed' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待处理'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-4">暂无任务</p>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-purple-600" />
                  庭审安排
                </h3>
                <div className="space-y-3">
                  {caseHearings.length > 0 ? (
                    caseHearings.map((hearing) => (
                      <div
                        key={hearing.id}
                        className="p-4 border border-gray-200 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{hearing.court}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(hearing.startTime)} · {formatDate(hearing.startTime).split(' ')[1] || ''}
                            </p>
                            {hearing.judge && (
                              <p className="text-sm text-gray-500 mt-0.5">
                                法官：{hearing.judge}
                              </p>
                            )}
                          </div>
                          <span
                            className={`badge ${
                              hearing.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-700'
                                : hearing.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {hearing.status === 'scheduled' ? '已排期' : hearing.status === 'completed' ? '已完成' : '待安排'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-4">暂无庭审安排</p>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  案件材料
                </h3>
                <div className="space-y-2">
                  {caseDocuments.length > 0 ? (
                    caseDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.uploadedBy} 上传于 {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <button className="text-sm text-primary-600 hover:text-primary-700">
                          下载
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-4">暂无案件材料</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/client/bills')}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <DollarSign size={18} />
                  查看账单
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCases;
