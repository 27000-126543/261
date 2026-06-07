import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useMessageStore } from '../../store/useMessageStore';
import { formatCurrency, formatDate, getBillStatusLabel, getBillStatusColor } from '../../utils';
import {
  ChevronLeft,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  X,
  Plus,
} from 'lucide-react';

const ClientBills = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const bills = useCaseStore((state) => state.bills);
  const cases = useCaseStore((state) => state.cases);
  const addInvoice = useCaseStore((state) => state.addInvoice);
  const addMessage = useMessageStore((state) => state.addMessage);

  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const myBills = bills.filter((b) => {
    const caseItem = cases.find((c) => c.id === b.caseId);
    return caseItem?.clientId === currentUser?.id;
  });

  const filteredBills = myBills.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const totalAmount = myBills.reduce((sum, b) => sum + b.amount, 0);
  const unpaidAmount = myBills.filter((b) => b.status === 'unpaid').reduce((sum, b) => sum + b.amount, 0);
  const paidAmount = myBills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);

  const handleRequestInvoice = (bill: any) => {
    const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);
    addInvoice({
      invoiceNumber,
      billId: bill.id,
      amount: bill.amount,
      status: 'pending',
      type: 'normal',
      recipient: currentUser?.name || '',
    });
    addMessage(
      currentUser?.id || '',
      'invoice_ready',
      '发票申请已提交',
      `您已成功提交账单的发票申请，发票编号：${invoiceNumber}，我们将尽快为您开具。`,
      bill.id,
      'bill'
    );
    alert('发票申请已提交，我们将尽快为您开具！');
  };

  const getCaseTitle = (caseId: string) => {
    const caseItem = cases.find((c) => c.id === caseId);
    return caseItem?.title || '';
  };

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
            <h1 className="text-2xl font-bold text-gray-900">账单中心</h1>
            <p className="text-gray-500 mt-1">共 {myBills.length} 笔账单</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">账单总额</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待支付</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(unpaidAmount)}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已支付</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('unpaid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unpaid'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          待支付
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'paid'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          已支付
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账单编号
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联案件
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账单日期
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">BILL-{bill.id.slice(0, 6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 text-sm">{getCaseTitle(bill.caseId)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{formatCurrency(bill.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getBillStatusColor(bill.status)}`}>
                      {getBillStatusLabel(bill.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                    {formatDate(bill.issuedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowDetail(true);
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye size={14} />
                        详情
                      </button>
                      {bill.status === 'paid' && (
                        <button
                          onClick={() => handleRequestInvoice(bill)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={14} />
                          申请发票
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>暂无账单记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetail && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">账单详情</h2>
                <p className="text-sm text-gray-500 mt-1">账单编号：BILL-{selectedBill.id.slice(0, 6).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">关联案件</p>
                  <p className="font-semibold text-gray-900">{getCaseTitle(selectedBill.caseId)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">账单状态</p>
                  <span className={`badge ${getBillStatusColor(selectedBill.status)}`}>
                    {getBillStatusLabel(selectedBill.status)}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">账单金额</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedBill.amount)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">账单日期</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedBill.issuedDate)}</p>
                </div>
              </div>

              {selectedBill.details && (
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">费用明细</h3>
                  <div className="space-y-3">
                    {selectedBill.details.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.description}</p>
                          {item.hours && (
                            <p className="text-xs text-gray-500">{item.hours} 小时 × {formatCurrency(item.rate)}/小时</p>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBill.notes && (
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">备注说明</h3>
                  <p className="text-gray-600">{selectedBill.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                {selectedBill.status === 'unpaid' && (
                  <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                    <DollarSign size={18} />
                    立即支付
                  </button>
                )}
                {selectedBill.status === 'paid' && (
                  <button
                    onClick={() => {
                      handleRequestInvoice(selectedBill);
                      setShowDetail(false);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    申请发票
                  </button>
                )}
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
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

export default ClientBills;
