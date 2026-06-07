import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { formatCurrency, formatDate } from '../../utils';
import {
  ChevronLeft,
  FileText,
  Clock,
  CheckCircle,
  X,
  Eye,
  Download,
  Plus,
} from 'lucide-react';

const ClientInvoices = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const invoices = useCaseStore((state) => state.invoices);
  const bills = useCaseStore((state) => state.bills);
  const cases = useCaseStore((state) => state.cases);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'issued'>('all');

  const myInvoices = invoices.filter((inv) => {
    const bill = bills.find((b) => b.id === inv.billId);
    const caseItem = cases.find((c) => c.id === bill?.caseId);
    return caseItem?.clientId === currentUser?.id;
  });

  const filteredInvoices = myInvoices.filter((inv) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return inv.status === 'pending';
    return inv.status === 'issued';
  });

  const totalAmount = myInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingCount = myInvoices.filter((inv) => inv.status === 'pending').length;
  const issuedCount = myInvoices.filter((inv) => inv.status === 'issued').length;

  const getCaseTitleByBillId = (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    const caseItem = cases.find((c) => c.id === bill?.caseId);
    return caseItem?.title || '';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued':
        return '已开具';
      case 'pending':
        return '待开具';
      case 'sent':
        return '已发送';
      case 'paid':
        return '已收讫';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
            <h1 className="text-2xl font-bold text-gray-900">发票管理</h1>
            <p className="text-gray-500 mt-1">共 {myInvoices.length} 张发票</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/client/bills')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          申请发票
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">发票总额</p>
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
              <p className="text-sm text-gray-500">待开具</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已开具</p>
              <p className="text-2xl font-bold text-green-600">{issuedCount}</p>
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
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          待开具
        </button>
        <button
          onClick={() => setFilter('issued')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'issued'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          已开具
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发票编号
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联案件
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请日期
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 text-sm">{getCaseTitleByBillId(invoice.billId)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 text-sm">{invoice.type === 'vat' ? '增值税发票' : '普通发票'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                    {formatDate(invoice.issuedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDetail(true);
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye size={14} />
                        详情
                      </button>
                      {invoice.status === 'issued' && (
                        <button
                          onClick={() => alert('正在下载发票文件...')}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Download size={14} />
                          下载
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>暂无发票记录</p>
                    <p className="text-sm mt-1">您可以在账单中心申请发票</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetail && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">发票详情</h2>
                <p className="text-sm text-gray-500 mt-1">发票编号：{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <FileText size={32} className="text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">发票</h3>
                  <p className="text-3xl font-bold text-primary-600 my-4">
                    {formatCurrency(selectedInvoice.amount)}
                  </p>
                  <span className={`badge ${getStatusColor(selectedInvoice.status)} px-4 py-1.5`}>
                    {getStatusLabel(selectedInvoice.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">关联案件</p>
                  <p className="font-semibold text-gray-900">{getCaseTitleByBillId(selectedInvoice.billId)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">发票类型</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.type === 'vat' ? '增值税发票' : '普通发票'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">申请日期</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedInvoice.issuedDate)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">开票日期</p>
                  <p className="font-semibold text-gray-900">
                    {selectedInvoice.status === 'issued' ? formatDate(selectedInvoice.issuedDate) : '待开具'}
                  </p>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">发票信息</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">发票抬头</span>
                    <span className="font-medium text-gray-900">个人</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">税号</span>
                    <span className="font-medium text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">发票内容</span>
                    <span className="font-medium text-gray-900">法律咨询服务费</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">价税合计</span>
                    <span className="font-bold text-gray-900">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedInvoice.status === 'issued' && (
                  <button
                    onClick={() => {
                      alert('正在下载发票文件...');
                      setShowDetail(false);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    下载发票
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

export default ClientInvoices;
