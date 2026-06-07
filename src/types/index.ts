export type UserRole = 'client' | 'lawyer' | 'partner' | 'arbitrator' | 'finance';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  specialization?: string[];
  hourlyRate?: number;
}

export type CaseStatus = 'pending' | 'active' | 'hearing' | 'arbitration' | 'closed';
export type CaseType = 'civil' | 'commercial' | 'criminal' | 'labor' | 'intellectual' | 'international';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  type: CaseType;
  status: CaseStatus;
  description: string;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  arbitratorId?: string;
  budget: number;
  usedAmount: number;
  conflictCheckPassed: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  caseId: string;
  caseName: string;
  assigneeId: string;
  assigneeName: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
}

export interface Timesheet {
  id: string;
  caseId: string;
  caseName: string;
  lawyerId: string;
  lawyerName: string;
  workDate: string;
  hours: number;
  rate: number;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Hearing {
  id: string;
  caseId: string;
  caseName: string;
  startTime: string;
  endTime: string;
  court: string;
  judge?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Bill {
  id: string;
  caseId: string;
  caseName: string;
  clientId: string;
  amount: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
  dueDate: string;
  issuedDate: string;
  items: BillItem[];
}

export interface Invoice {
  id: string;
  billId: string;
  invoiceNumber: string;
  amount: number;
  status: 'pending' | 'issued' | 'sent' | 'paid';
  type: 'vat' | 'normal';
  issuedDate: string;
  recipient: string;
  taxId?: string;
}

export type MessageType = 'case_assigned' | 'budget_warning' | 'hearing_scheduled' | 'decision_uploaded' | 'invoice_ready' | 'system';

export interface Message {
  id: string;
  userId: string;
  type: MessageType;
  title: string;
  content: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  caseId: string;
  name: string;
  type: 'evidence' | 'pleading' | 'ruling' | 'contract' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface CaseTimeline {
  id: string;
  caseId: string;
  title: string;
  description: string;
  date: string;
  type: 'status' | 'task' | 'hearing' | 'document' | 'payment';
}
