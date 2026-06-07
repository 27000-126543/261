import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { formatDate, formatDateTime } from '../../utils';
import {
  Calendar,
  Clock,
  ChevronLeft,
  Check,
  AlertCircle,
  Star,
  MapPin,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const courts = [
  { id: 'court-1', name: '北京市第一中级人民法院', address: '石景山区', busy: '8:00-17:00' },
  { id: 'court-2', name: '北京知识产权法院', address: '海淀区', busy: '8:30-17:00' },
  { id: 'court-3', name: '朝阳区人民法院', address: '朝阳区', busy: '8:00-17:30' },
  { id: 'court-4', name: '北京仲裁委员会', address: '朝阳区', busy: '9:00-18:00' },
];

const timeSlots = [
  { start: 9, label: '09:00-11:00', duration: 2 },
  { start: 11, label: '11:00-12:00', duration: 1 },
  { start: 14, label: '14:00-16:00', duration: 2 },
  { start: 16, label: '16:00-17:30', duration: 1.5 },
];

interface RecommendedSlot {
  date: Date;
  dateStr: string;
  timeSlot: typeof timeSlots[0];
  court: typeof courts[0];
  score: number;
  conflicts: string[];
}

const SchedulePage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const cases = useCaseStore((state) => state.cases);
  const hearings = useCaseStore((state) => state.hearings);
  const addHearing = useCaseStore((state) => state.addHearing);
  const addMessage = useMessageStore((state) => state.addMessage);

  const [selectedCase, setSelectedCase] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(courts[0].id);
  const [recommendations, setRecommendations] = useState<RecommendedSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<RecommendedSlot | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const myCases = cases.filter((c) => c.lawyerId === currentUser?.id && c.status !== 'closed');
  const myHearings = hearings.filter((h) => h.caseId === selectedCase);

  const generateRecommendations = () => {
    if (!selectedCase) return;
    
    setGenerating(true);
    
    setTimeout(() => {
      const recs: RecommendedSlot[] = [];
      const today = new Date();
      const court = courts.find((c) => c.id === selectedCourt)!;

      for (let dayOffset = 3; dayOffset <= 14; dayOffset++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + dayOffset);
        
        if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue;

        for (const slot of timeSlots) {
          const startTime = new Date(checkDate);
          startTime.setHours(slot.start, 0, 0, 0);
          
          const endTime = new Date(checkDate);
          endTime.setHours(slot.start + slot.duration, 0, 0, 0);

          const conflicts: string[] = [];
          let score = 100;

          const hasConflict = myHearings.some((h) => {
            const hStart = new Date(h.startTime);
            const hEnd = new Date(h.endTime);
            return (
              (startTime >= hStart && startTime < hEnd) ||
              (endTime > hStart && endTime <= hEnd) ||
              (startTime <= hStart && endTime >= hEnd)
            );
          });

          if (hasConflict) {
            conflicts.push('您已有其他庭审安排');
            score -= 60;
          }

          const dayOfWeek = checkDate.getDay();
          if (dayOfWeek === 1 || dayOfWeek === 5) {
            score -= 10;
          }

          if (slot.start === 9) {
            score += 15;
          } else if (slot.start === 14) {
            score += 10;
          }

          if (Math.random() > 0.7) {
            conflicts.push('该时段法院预约较多');
            score -= 15;
          }

          if (dayOffset <= 7) {
            score -= 5;
          }

          if (score > 40) {
            recs.push({
              date: checkDate,
              dateStr: checkDate.toISOString().split('T')[0],
              timeSlot: slot,
              court,
              score,
              conflicts,
            });
          }
        }
      }

      recs.sort((a, b) => b.score - a.score);
      setRecommendations(recs.slice(0, 6));
      setGenerating(false);
    }, 1000);
  };

  const handleSchedule = () => {
    if (!selectedSlot || !selectedCase) return;

    setLoading(true);

    setTimeout(() => {
      const caseItem = cases.find((c) => c.id === selectedCase);
      if (!caseItem) return;

      const startTime = new Date(selectedSlot.date);
      startTime.setHours(selectedSlot.timeSlot.start, 0, 0, 0);

      const endTime = new Date(selectedSlot.date);
      endTime.setHours(selectedSlot.timeSlot.start + selectedSlot.timeSlot.duration, 0, 0, 0);

      addHearing({
        caseId: selectedCase,
        caseName: caseItem.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        court: selectedSlot.court.name,
        status: 'scheduled',
      });

      addMessage(
        currentUser?.id || '',
        'hearing_scheduled',
        '庭审排期已确认',
        `案件「${caseItem.title}」的庭审已排期：${formatDateTime(startTime.toISOString())}，地点：${selectedSlot.court.name}，该时间段已锁定。`,
        selectedCase
      );

      addMessage(
        caseItem.clientId,
        'hearing_scheduled',
        '庭审时间已确定',
        `您的案件「${caseItem.title}」已确定庭审时间：${formatDateTime(startTime.toISOString())}，地点：${selectedSlot.court.name}，请准时参加。`,
        selectedCase
      );

      setLoading(false);
      setShowConfirm(false);
      setSelectedSlot(null);
      navigate('/lawyer');
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-amber-600 bg-amber-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '推荐';
    if (score >= 60) return '可选';
    return '一般';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/lawyer')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">庭审排期推荐</h1>
          <p className="text-gray-500 mt-1">系统根据法院空档和律师档期自动推荐最优时间</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">排期设置</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择案件</label>
                <select
                  className="input-field"
                  value={selectedCase}
                  onChange={(e) => {
                    setSelectedCase(e.target.value);
                    setRecommendations([]);
                    setSelectedSlot(null);
                  }}
                >
                  <option value="">请选择需要排期的案件</option>
                  {myCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择法院/仲裁机构</label>
                <select
                  className="input-field"
                  value={selectedCourt}
                  onChange={(e) => {
                    setSelectedCourt(e.target.value);
                    setRecommendations([]);
                    setSelectedSlot(null);
                  }}
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateRecommendations}
                disabled={!selectedCase || generating}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    智能推荐中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    智能推荐排期
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">已安排的庭审</h3>
            <div className="space-y-3">
              {myHearings.map((h) => (
                <div
                  key={h.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{h.caseName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(h.startTime)}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={12} />
                        {h.court}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {myHearings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">暂无已安排的庭审</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={20} className="text-gold-500" />
              推荐时间列表
            </h3>

            {recommendations.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">选择案件和法院后点击"智能推荐排期"</p>
                <p className="text-sm text-gray-400 mt-2">系统将自动分析法院空档和您的档期</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((slot, index) => (
                  <div
                    key={`${slot.dateStr}-${slot.timeSlot.start}-${index}`}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedSlot?.dateStr === slot.dateStr && selectedSlot?.timeSlot.start === slot.timeSlot.start
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex flex-col items-center justify-center text-white">
                          <span className="text-lg font-bold">{slot.date.getDate()}</span>
                          <span className="text-xs opacity-80">{slot.date.toLocaleDateString('zh-CN', { month: 'short' })}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {formatDate(slot.dateStr)}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(slot.score)}`}>
                              {getScoreLabel(slot.score)} {slot.score}分
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {slot.timeSlot.label}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {slot.court.name}
                            </span>
                          </div>
                          {slot.conflicts.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                              <AlertCircle size={12} />
                              {slot.conflicts.join('、')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        {selectedSlot?.dateStr === slot.dateStr && selectedSlot?.timeSlot.start === slot.timeSlot.start ? (
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check size={18} className="text-white" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">已选择排期时间</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {formatDate(selectedSlot.dateStr)} {selectedSlot.timeSlot.label} - {selectedSlot.court.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">确认后该时间段将被锁定，不可再安排其他庭审</p>
                  </div>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Check size={16} />
                    确认排期
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">确认庭审排期</h3>
              <p className="text-gray-500 mt-2">请确认以下排期信息，确认后将锁定该时间段</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">案件</span>
                <span className="font-medium text-gray-900">
                  {cases.find((c) => c.id === selectedCase)?.title}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">日期</span>
                <span className="font-medium text-gray-900">
                  {selectedSlot && formatDate(selectedSlot.dateStr)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">时间</span>
                <span className="font-medium text-gray-900">
                  {selectedSlot?.timeSlot.label}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">地点</span>
                <span className="font-medium text-gray-900">
                  {selectedSlot?.court.name}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSchedule}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    确认中...
                  </>
                ) : (
                  '确认排期'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
