import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { formatDate, getCaseTypeLabel, getTaskStatusLabel, getTaskStatusColor, getTaskPriorityLabel, getTaskPriorityColor } from '../../utils';
import {
  ChevronLeft,
  Plus,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Users,
  Sparkles,
  RefreshCw,
  Briefcase,
  User,
  Star,
  X,
} from 'lucide-react';
import { mockUsers } from '../../data/mockData';

const taskTemplates: Record<string, { title: string; description: string; priority: 'high' | 'medium' | 'low'; daysAfter: number }[]> = {
  commercial: [
    { title: '收集案件证据材料', description: '整理合同原件、沟通记录、付款凭证等证据材料', priority: 'high', daysAfter: 1 },
    { title: '案件法律研究', description: '研究相关法律法规、司法解释和类似判例', priority: 'high', daysAfter: 2 },
    { title: '起草起诉状/答辩状', description: '根据证据材料起草法律文书', priority: 'high', daysAfter: 5 },
    { title: '客户沟通会议', description: '与客户沟通案件进展，确认诉讼策略', priority: 'medium', daysAfter: 3 },
    { title: '准备庭审材料', description: '准备证据清单、质证意见、代理词等', priority: 'high', daysAfter: 15 },
  ],
  intellectual: [
    { title: '专利/商标检索分析', description: '进行现有技术检索，分析权利要求稳定性', priority: 'high', daysAfter: 1 },
    { title: '侵权比对分析', description: '对比涉案产品与权利要求，进行侵权判定', priority: 'high', daysAfter: 3 },
    { title: '证据保全公证', description: '协助客户进行侵权证据保全公证', priority: 'high', daysAfter: 5 },
    { title: '损害赔偿计算', description: '计算侵权损失和合理开支', priority: 'medium', daysAfter: 7 },
    { title: '起草无效宣告请求', description: '针对对方专利准备无效宣告材料', priority: 'medium', daysAfter: 10 },
  ],
  labor: [
    { title: '收集劳动证据', description: '收集劳动合同、工资流水、考勤记录等', priority: 'high', daysAfter: 1 },
    { title: '计算赔偿金额', description: '计算经济补偿金、赔偿金、加班工资等', priority: 'high', daysAfter: 2 },
    { title: '起草仲裁申请书', description: '起草劳动争议仲裁申请书', priority: 'high', daysAfter: 3 },
    { title: '调解准备', description: '准备调解方案，与对方协商', priority: 'medium', daysAfter: 5 },
  ],
  international: [
    { title: '准据法研究', description: '研究合同约定的准据法和相关国际公约', priority: 'high', daysAfter: 2 },
    { title: '证据翻译公证', description: '涉外证据的翻译和公证认证', priority: 'high', daysAfter: 5 },
    { title: '起草仲裁申请书', description: '用中英文起草仲裁申请书', priority: 'high', daysAfter: 7 },
    { title: '选定仲裁员', description: '协助客户选定仲裁员', priority: 'medium', daysAfter: 10 },
    { title: '准备开庭陈述', description: '准备英文开庭陈述词和辩论要点', priority: 'high', daysAfter: 20 },
  ],
  civil: [
    { title: '案件事实梳理', description: '梳理案件事实，整理时间线', priority: 'high', daysAfter: 1 },
    { title: '法律关系分析', description: '分析双方法律关系和争议焦点', priority: 'high', daysAfter: 2 },
    { title: '起草法律文书', description: '起草起诉状或答辩状', priority: 'high', daysAfter: 4 },
    { title: '调解协商', description: '尝试与对方进行调解协商', priority: 'medium', daysAfter: 7 },
  ],
  criminal: [
    { title: '会见当事人', description: '会见犯罪嫌疑人，了解案件情况', priority: 'high', daysAfter: 1 },
    { title: '查阅案卷材料', description: '到检察机关查阅复制案卷材料', priority: 'high', daysAfter: 3 },
    { title: '法律研究', description: '研究相关罪名和量刑标准', priority: 'high', daysAfter: 5 },
    { title: '准备辩护意见', description: '起草辩护意见书', priority: 'high', daysAfter: 10 },
  ],
};

const TaskPage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const tasks = useCaseStore((state) => state.tasks);
  const addTask = useCaseStore((state) => state.addTask);
  const updateTask = useCaseStore((state) => state.updateTask);
  const addMessage = useMessageStore((state) => state.addMessage);

  const [selectedCase, setSelectedCase] = useState('');
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recommendedTasks, setRecommendedTasks] = useState<any[]>([]);
  const [alternativeLawyers, setAlternativeLawyers] = useState<any[]>([]);
  const [showConflict, setShowConflict] = useState(false);

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);
  const myCases = cases.filter((c) => c.lawyerId === currentUser?.id && c.status !== 'closed');

  const pendingTasks = myTasks.filter((t) => t.status === 'pending');
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = myTasks.filter((t) => t.status === 'completed');

  const generateTasks = () => {
    if (!selectedCase) return;

    setGenerating(true);

    setTimeout(() => {
      const caseItem = cases.find((c) => c.id === selectedCase);
      if (!caseItem) return;

      const templates = taskTemplates[caseItem.type] || taskTemplates.civil;
      const now = new Date();

      const hasConflict = Math.random() > 0.7;

      const generated = templates.map((t, index) => {
        const dueDate = new Date(now);
        dueDate.setDate(now.getDate() + t.daysAfter);
        return {
          ...t,
          id: `gen-${index}`,
          dueDate: dueDate.toISOString(),
          selected: true,
        };
      });

      setRecommendedTasks(generated);

      if (hasConflict) {
        const allLawyers = mockUsers.filter((u) => u.role === 'lawyer' && u.id !== currentUser?.id);
        const alternatives = allLawyers
          .filter((l) => {
            const specs = (l as any).specialization || [];
            return specs.includes(caseItem.type);
          })
          .map((l) => ({
            ...l,
            matchScore: Math.floor(Math.random() * 30) + 70,
            workload: Math.floor(Math.random() * 40) + 30,
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);

        setAlternativeLawyers(alternatives);
        setShowConflict(true);
      } else {
        setShowConflict(false);
      }

      setGenerating(false);
    }, 1500);
  };

  const confirmTasks = () => {
    if (!selectedCase) return;

    const caseItem = cases.find((c) => c.id === selectedCase);
    if (!caseItem) return;

    const selectedTasks = recommendedTasks.filter((t) => t.selected);

    selectedTasks.forEach((task) => {
      addTask({
        caseId: selectedCase,
        caseName: caseItem.title,
        assigneeId: currentUser?.id || '',
        assigneeName: currentUser?.name || '',
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
      });
    });

    addMessage(
      currentUser?.id || '',
      'case_assigned',
      '任务已自动分配',
      `案件「${caseItem.title}」已根据案件类型自动分配 ${selectedTasks.length} 个任务到您的工作日程。`,
      selectedCase
    );

    setShowAutoModal(false);
    setRecommendedTasks([]);
    setSelectedCase('');
  };

  const toggleTaskSelect = (taskId: string) => {
    setRecommendedTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleStatusChange = (taskId: string, status: any) => {
    updateTask(taskId, { status });
  };

  const TaskCard = ({ task }: { task: any }) => (
    <div className="p-4 border border-gray-200 rounded-xl hover:border-primary-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => {
              if (task.status === 'completed') {
                handleStatusChange(task.id, 'pending');
              } else if (task.status === 'in_progress') {
                handleStatusChange(task.id, 'completed');
              } else {
                handleStatusChange(task.id, 'in_progress');
              }
            }}
            className="mt-0.5"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : task.status === 'in_progress' ? (
              <Clock size={20} className="text-blue-500" />
            ) : (
              <Circle size={20} className="text-gray-300 hover:text-gray-400" />
            )}
          </button>
          <div>
            <h4 className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`badge ${getTaskPriorityColor(task.priority)}`}>
                {getTaskPriorityLabel(task.priority)}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Briefcase size={12} />
                {task.caseName}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                截止：{formatDate(task.dueDate)}
              </span>
            </div>
          </div>
        </div>
        <span className={`badge ${getTaskStatusColor(task.status)}`}>
          {getTaskStatusLabel(task.status)}
        </span>
      </div>
    </div>
  );

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
            <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
            <p className="text-gray-500 mt-1">根据案件类型自动分配任务，生成工作日程</p>
          </div>
        </div>
        <button
          onClick={() => setShowAutoModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles size={18} />
          智能分配任务
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Circle size={20} className="text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
              <p className="text-xs text-gray-500">待处理</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgressTasks.length}</p>
              <p className="text-xs text-gray-500">进行中</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
              <p className="text-xs text-gray-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
              <p className="text-xs text-gray-500">总任务</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Circle size={18} className="text-gray-400" />
            待处理 ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {pendingTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Circle size={32} className="mx-auto mb-2" />
                <p className="text-sm">暂无待处理任务</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            进行中 ({inProgressTasks.length})
          </h3>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {inProgressTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Clock size={32} className="mx-auto mb-2" />
                <p className="text-sm">暂无进行中任务</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            已完成 ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 size={32} className="mx-auto mb-2" />
                <p className="text-sm">暂无已完成任务</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAutoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">智能任务分配</h3>
                <p className="text-gray-500 mt-1">根据案件类型和律师专长自动生成任务</p>
              </div>
              <button
                onClick={() => {
                  setShowAutoModal(false);
                  setRecommendedTasks([]);
                  setSelectedCase('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择案件</label>
              <select
                className="input-field"
                value={selectedCase}
                onChange={(e) => {
                  setSelectedCase(e.target.value);
                  setRecommendedTasks([]);
                  setShowConflict(false);
                }}
              >
                <option value="">请选择案件</option>
                {myCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({getCaseTypeLabel(c.type)})
                  </option>
                ))}
              </select>
            </div>

            {selectedCase && recommendedTasks.length === 0 && (
              <div className="text-center py-8">
                <button
                  onClick={generateTasks}
                  disabled={generating}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {generating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      一键生成任务
                    </>
                  )}
                </button>
              </div>
            )}

            {showConflict && alternativeLawyers.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">检测到档期冲突</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      您当前档期较满，可能无法按时完成所有任务。以下是推荐的替代律师：
                    </p>
                    <div className="mt-3 space-y-2">
                      {alternativeLawyers.map((lawyer) => (
                        <div
                          key={lawyer.id}
                          className="p-3 bg-white rounded-lg border border-amber-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User size={18} className="text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{lawyer.name}</p>
                              <p className="text-xs text-gray-500">
                                专长：{lawyer.specialization?.map((s: string) => getCaseTypeLabel(s)).join('、')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <Star size={14} className="text-yellow-500" />
                              <span className="font-medium">{lawyer.matchScore}% 匹配</span>
                            </div>
                            <p className="text-xs text-gray-500">当前工作负荷 {lawyer.workload}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {recommendedTasks.length > 0 && (
              <>
                <h4 className="font-medium text-gray-900 mb-3">推荐任务列表（可勾选）</h4>
                <div className="space-y-2 mb-6">
                  {recommendedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskSelect(task.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        task.selected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {task.selected ? (
                              <Check size={20} className="text-primary-600" />
                            ) : (
                              <Circle size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className={`badge ${getTaskPriorityColor(task.priority)}`}>
                                {getTaskPriorityLabel(task.priority)}
                              </span>
                              <span className="text-gray-500">
                                预计截止：{formatDate(task.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAutoModal(false);
                      setRecommendedTasks([]);
                      setSelectedCase('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmTasks}
                    disabled={recommendedTasks.filter((t) => t.selected).length === 0}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    确认分配
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;
