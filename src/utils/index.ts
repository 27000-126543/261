import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateCaseNumber = (type: string): string => {
  const year = new Date().getFullYear();
  const prefix = type.toUpperCase().substring(0, 2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}-${prefix}-${random}`;
};

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd', { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getCaseTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    civil: '民事案件',
    commercial: '商事案件',
    criminal: '刑事案件',
    labor: '劳动争议',
    intellectual: '知识产权',
    international: '国际仲裁',
  };
  return labels[type] || type;
};

export const getCaseStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待处理',
    active: '进行中',
    hearing: '庭审中',
    arbitration: '仲裁中',
    closed: '已结案',
  };
  return labels[status] || status;
};

export const getCaseStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    hearing: 'bg-purple-100 text-purple-800',
    arbitration: 'bg-indigo-100 text-indigo-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getTaskPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return labels[priority] || priority;
};

export const getTaskPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export const getTaskStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return labels[status] || status;
};

export const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getBillStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    unpaid: '未支付',
    partial: '部分支付',
    paid: '已支付',
  };
  return labels[status] || status;
};

export const getBillStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getDocumentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    evidence: '证据材料',
    pleading: '诉讼文书',
    ruling: '裁决文书',
    contract: '合同文件',
    other: '其他文件',
  };
  return labels[type] || type;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    client: '客户',
    lawyer: '律师',
    partner: '合伙人',
    arbitrator: '仲裁员',
    finance: '财务',
  };
  return labels[role] || role;
};

export const checkConflictOfInterest = (clientName: string, caseType: string): boolean => {
  const conflictCases = ['史密斯公司', 'Johnson Corp', '宏达集团'];
  const conflictTypes = ['international', 'commercial'];
  const hasClientConflict = conflictCases.some(c => clientName.includes(c));
  const hasTypeConflict = conflictTypes.includes(caseType) && Math.random() > 0.7;
  return !(hasClientConflict || hasTypeConflict);
};

export const calculateBudget = (caseType: string, complexity: number = 1): number => {
  const baseBudgets: Record<string, number> = {
    civil: 50000,
    commercial: 150000,
    criminal: 200000,
    labor: 20000,
    intellectual: 100000,
    international: 300000,
  };
  return (baseBudgets[caseType] || 50000) * complexity;
};

export const calculateInitialBudget = (caseType: string, complexity: string, estimatedAmount: number): number => {
  const complexityMultipliers: Record<string, number> = {
    simple: 1.0,
    medium: 1.5,
    complex: 2.2,
    major: 3.5,
  };
  const base = calculateBudget(caseType, complexityMultipliers[complexity] || 1.5);
  const amountFactor = Math.max(0, Math.min(1, estimatedAmount / 10000000));
  return Math.round(base * (1 + amountFactor * 0.5));
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
