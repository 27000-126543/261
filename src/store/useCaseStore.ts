import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Case, Task, Timesheet, Hearing, Bill, Invoice, Document, CaseTimeline, CaseType } from '../types';
import { mockCases, mockTasks, mockTimesheets, mockHearings, mockBills, mockInvoices, mockDocuments, mockCaseTimelines } from '../data/mockData';
import { generateId, generateCaseNumber, calculateBudget, checkConflictOfInterest } from '../utils';

interface CaseState {
  cases: Case[];
  tasks: Task[];
  timesheets: Timesheet[];
  hearings: Hearing[];
  bills: Bill[];
  invoices: Invoice[];
  documents: Document[];
  timelines: CaseTimeline[];
  addCase: (data: Partial<Case>, clientName: string, lawyerName: string) => Case;
  updateCase: (id: string, data: Partial<Case>) => void;
  addTask: (data: Partial<Task>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  addTimesheet: (data: Partial<Timesheet>) => void;
  addHearing: (data: Partial<Hearing>) => void;
  addBill: (data: Partial<Bill>) => void;
  addInvoice: (data: Partial<Invoice>) => void;
  addDocument: (data: Partial<Document>) => void;
  runConflictCheck: (clientName: string, caseType: CaseType) => boolean;
  generateCaseBudget: (caseType: CaseType, complexity?: number) => number;
}

export const useCaseStore = create<CaseState>()(
  persist(
    (set, get) => ({
      cases: mockCases,
      tasks: mockTasks,
      timesheets: mockTimesheets,
      hearings: mockHearings,
      bills: mockBills,
      invoices: mockInvoices,
      documents: mockDocuments,
      timelines: mockCaseTimelines,
      addCase: (data, clientName, lawyerName) => {
        const newCase: Case = {
          id: generateId(),
          caseNumber: generateCaseNumber(data.type || 'civil'),
          title: data.title || '',
          type: data.type || 'civil',
          status: 'pending',
          description: data.description || '',
          clientId: data.clientId || '',
          clientName,
          lawyerId: data.lawyerId || '',
          lawyerName,
          budget: data.budget || 0,
          usedAmount: 0,
          conflictCheckPassed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ cases: [newCase, ...state.cases] }));
        return newCase;
      },
      updateCase: (id, data) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      addTask: (data) => {
        const newTask: Task = {
          id: generateId(),
          caseId: data.caseId || '',
          caseName: data.caseName || '',
          assigneeId: data.assigneeId || '',
          assigneeName: data.assigneeName || '',
          title: data.title || '',
          description: data.description || '',
          status: 'pending',
          priority: data.priority || 'medium',
          dueDate: data.dueDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      },
      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
      },
      addTimesheet: (data) => {
        const newTimesheet: Timesheet = {
          id: generateId(),
          caseId: data.caseId || '',
          caseName: data.caseName || '',
          lawyerId: data.lawyerId || '',
          lawyerName: data.lawyerName || '',
          workDate: data.workDate || new Date().toISOString(),
          hours: data.hours || 0,
          rate: data.rate || 0,
          amount: (data.hours || 0) * (data.rate || 0),
          description: data.description || '',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ timesheets: [newTimesheet, ...state.timesheets] }));
        const caseItem = get().cases.find(c => c.id === data.caseId);
        if (caseItem) {
          get().updateCase(data.caseId!, { usedAmount: caseItem.usedAmount + newTimesheet.amount });
        }
      },
      addHearing: (data) => {
        const newHearing: Hearing = {
          id: generateId(),
          caseId: data.caseId || '',
          caseName: data.caseName || '',
          startTime: data.startTime || new Date().toISOString(),
          endTime: data.endTime || new Date().toISOString(),
          court: data.court || '',
          judge: data.judge,
          status: 'scheduled',
          notes: data.notes,
        };
        set((state) => ({ hearings: [newHearing, ...state.hearings] }));
      },
      addBill: (data) => {
        const newBill: Bill = {
          id: generateId(),
          caseId: data.caseId || '',
          caseName: data.caseName || '',
          clientId: data.clientId || '',
          amount: data.amount || 0,
          paidAmount: 0,
          status: 'unpaid',
          dueDate: data.dueDate || new Date().toISOString(),
          issuedDate: new Date().toISOString(),
          items: data.items || [],
        };
        set((state) => ({ bills: [newBill, ...state.bills] }));
      },
      addInvoice: (data) => {
        const newInvoice: Invoice = {
          id: generateId(),
          billId: data.billId || '',
          invoiceNumber: data.invoiceNumber || generateId(),
          amount: data.amount || 0,
          status: 'pending',
          type: data.type || 'normal',
          issuedDate: new Date().toISOString(),
          recipient: data.recipient || '',
          taxId: data.taxId,
        };
        set((state) => ({ invoices: [newInvoice, ...state.invoices] }));
      },
      addDocument: (data) => {
        const newDocument: Document = {
          id: generateId(),
          caseId: data.caseId || '',
          name: data.name || '',
          type: data.type || 'other',
          size: data.size || 0,
          uploadedBy: data.uploadedBy || '',
          uploadedAt: new Date().toISOString(),
          url: data.url || '#',
        };
        set((state) => ({ documents: [newDocument, ...state.documents] }));
      },
      runConflictCheck: (clientName, caseType) => {
        return checkConflictOfInterest(clientName, caseType);
      },
      generateCaseBudget: (caseType, complexity = 1) => {
        return calculateBudget(caseType, complexity);
      },
    }),
    {
      name: 'case-storage',
    }
  )
);
