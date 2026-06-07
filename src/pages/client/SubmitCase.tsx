import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { checkConflictOfInterest, generateCaseNumber, calculateInitialBudget, getCaseTypeLabel } from '../../utils';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Clock,
  Users,
  Hash,
  Shield,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

const caseTypes = [
  { value: 'commercial', label: '商业诉讼', icon: '💼', description: '公司商业纠纷、合同争议' },
  { value: 'international', label: '跨境仲裁', icon: '🌍', description: '国际贸易、跨国投资争议' },
  { value: 'intellectual', label: '知识产权', icon: '💡', description: '专利、商标、著作权纠纷' },
  { value: 'labor', label: '劳动争议', icon: '👥', description: '劳动合同、薪酬福利争议' },
  { value: 'criminal', label: '刑事辩护', icon: '⚖️', description: '刑事案件辩护与代理' },
  { value: 'family', label: '婚姻家事', icon: '🏠', description: '离婚、继承、财产分割' },
];

const caseComplexities = [
  { value: 'simple', label: '简单', multiplier: 1.0, description: '事实清楚、证据充分' },
  { value: 'medium', label: '一般', multiplier: 1.5, description: '有一定争议点' },
  { value: 'complex', label: '复杂', multiplier: 2.2, description: '涉及多方、证据较多' },
  { value: 'major', label: '重大疑难', multiplier: 3.5, description: '新型案件、社会影响大' },
];

const SubmitCase = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const addCase = useCaseStore((state) => state.addCase);
  const addMessage = useMessageStore((state) => state.addMessage);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [conflictResult, setConflictResult] = useState<boolean | null>(null);
  const [generatedCaseNumber, setGeneratedCaseNumber] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState(0);

  const [formData, setFormData] = useState({
    caseType: '',
    caseTitle: '',
    caseDescription: '',
    oppositeParty: '',
    complexity: 'medium',
    estimatedAmount: 0,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (conflictResult !== null) setConflictResult(null);
  };

  const checkConflict = () => {
    setLoading(true);
    setTimeout(() => {
      const result = checkConflictOfInterest(formData.oppositeParty, formData.caseType);
      setConflictResult(result);
      setLoading(false);

      if (result) {
        const caseNumber = generateCaseNumber(formData.caseType);
        const budget = calculateInitialBudget(formData.caseType, formData.complexity, formData.estimatedAmount);
        setGeneratedCaseNumber(caseNumber);
        setEstimatedBudget(budget);
      }
    }, 1500);
  };

  const submitCase = () => {
    setLoading(true);
    setTimeout(() => {
      const newCase = addCase(
        {
          caseNumber: generatedCaseNumber,
          title: formData.caseTitle,
          type: formData.caseType as any,
          description: formData.caseDescription,
          clientId: currentUser?.id || '',
          budget: estimatedBudget,
        },
        currentUser?.name || '',
        '待分配'
      );

      addMessage(
        currentUser?.id || '',
        'case_assigned',
        '案件委托提交成功',
        `您的案件「${formData.caseTitle}」已提交，案件编号：${generatedCaseNumber}。我们将尽快为您指派律师。`,
        newCase.id
      );

      addMessage(
        'partner-1',
        'case_assigned',
        '新案件待分配',
        `客户「${currentUser?.name}」提交了新案件「${formData.caseTitle}」，请及时分配律师。`,
        newCase.id
      );

      setLoading(false);
      navigate('/client/cases');
    }, 1500);
  };

  const nextStep = () => {
    if (step === 1 && formData.caseType && formData.oppositeParty) {
      checkConflict();
    }
    if (step === 2 && conflictResult) {
      setStep(3);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/client')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        返回工作台
      </button>

      <div className="card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">提交案件委托</h1>
          <p className="text-gray-500 mt-2">请填写案件信息，系统将自动进行利益冲突检测</p>
        </div>

        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  step >= s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s ? <CheckCircle size={20} /> : s}
              </div>
              <span
                className={`ml-3 font-medium ${
                  step >= s ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {s === 1 ? '案件信息' : s === 2 ? '冲突检测' : '确认提交'}
              </span>
              {s < 3 && (
                <div
                  className={`w-20 h-1 mx-4 rounded ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                选择案件类型
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {caseTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('caseType', type.value)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      formData.caseType === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  案件名称
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入案件名称"
                  value={formData.caseTitle}
                  onChange={(e) => handleInputChange('caseTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  对方当事人
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入对方当事人名称"
                  value={formData.oppositeParty}
                  onChange={(e) => handleInputChange('oppositeParty', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                案件描述
              </label>
              <textarea
                className="input-field min-h-[120px]"
                placeholder="请简要描述案件情况..."
                value={formData.caseDescription}
                onChange={(e) => handleInputChange('caseDescription', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  案件复杂度
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {caseComplexities.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleInputChange('complexity', c.value)}
                      className={`p-3 border rounded-lg text-left text-sm transition-all ${
                        formData.complexity === c.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{c.label}</div>
                      <div className="text-xs text-gray-500">{c.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  争议金额（元）
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="请输入争议金额"
                  value={formData.estimatedAmount || ''}
                  onChange={(e) => handleInputChange('estimatedAmount', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                disabled={!formData.caseType || !formData.oppositeParty || !formData.caseTitle}
                className="btn-primary flex items-center gap-2"
              >
                下一步 <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-medium text-gray-900 mb-4">案件信息确认</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">案件类型：</span>
                  <span className="text-gray-900 font-medium">
                    {getCaseTypeLabel(formData.caseType)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">案件名称：</span>
                  <span className="text-gray-900 font-medium">{formData.caseTitle}</span>
                </div>
                <div>
                  <span className="text-gray-500">对方当事人：</span>
                  <span className="text-gray-900 font-medium">{formData.oppositeParty}</span>
                </div>
                <div>
                  <span className="text-gray-500">案件复杂度：</span>
                  <span className="text-gray-900 font-medium">
                    {caseComplexities.find((c) => c.value === formData.complexity)?.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8">
              {loading ? (
                <div className="text-center">
                  <Loader2 size={48} className="mx-auto text-primary-600 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">利益冲突检测中...</h3>
                  <p className="text-gray-500 mt-2">正在检索历史案件库，请稍候</p>
                </div>
              ) : conflictResult === null ? (
                <div className="text-center">
                  <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">进行利益冲突检测</h3>
                  <p className="text-gray-500 mt-2 mb-4">系统将自动检索是否存在利益冲突</p>
                  <button onClick={checkConflict} className="btn-primary">
                    开始检测
                  </button>
                </div>
              ) : conflictResult ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-green-700">检测通过</h3>
                  <p className="text-gray-500 mt-2">未发现利益冲突，可以继续委托</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Hash size={20} className="text-primary-600" />
                        <span className="text-sm text-gray-500">案件编号</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{generatedCaseNumber}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign size={20} className="text-gold-600" />
                        <span className="text-sm text-gray-500">预估预算</span>
                      </div>
                      <p className="text-lg font-bold text-gold-600">
                        ¥{estimatedBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={40} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-red-700">检测到利益冲突</h3>
                  <p className="text-gray-500 mt-2">
                    抱歉，本所存在与对方当事人相关的未结案件，根据律师执业规范，无法接受您的委托。
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary mt-4"
                  >
                    返回修改
                  </button>
                </div>
              )}
            </div>

            {conflictResult && (
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  上一步
                </button>
                <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                  下一步 <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={40} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">确认提交案件委托</h3>
              <p className="text-gray-500 mt-2">请确认以下信息无误后提交</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">案件编号</span>
                <span className="font-mono font-bold text-primary-600">{generatedCaseNumber}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">案件名称</span>
                <span className="font-medium text-gray-900">{formData.caseTitle}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">案件类型</span>
                <span className="font-medium text-gray-900">
                  {getCaseTypeLabel(formData.caseType)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">对方当事人</span>
                <span className="font-medium text-gray-900">{formData.oppositeParty}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">案件复杂度</span>
                <span className="font-medium text-gray-900">
                  {caseComplexities.find((c) => c.value === formData.complexity)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">争议金额</span>
                <span className="font-medium text-gray-900">
                  ¥{formData.estimatedAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 bg-gold-50 -mx-6 -mb-6 px-6 rounded-b-xl mt-4">
                <span className="text-gray-700 font-medium">预估律师费用</span>
                <span className="text-2xl font-bold text-gold-600">
                  ¥{estimatedBudget.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Users size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">律师指派说明</p>
                <p className="mt-1">提交后，我们将根据案件类型和复杂度，在3个工作日内为您指派最合适的律师。您可以随时在案件详情中查看进度。</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="btn-secondary">
                上一步
              </button>
              <button
                onClick={submitCase}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    确认提交
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitCase;
