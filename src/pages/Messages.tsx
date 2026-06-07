import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useMessageStore } from '../store/useMessageStore';
import { formatDateTime } from '../utils';
import { MessageType } from '../types';
import {
  MessageSquare,
  Bell,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  DollarSign,
  Gavel,
  Check,
  Trash2,
  Search,
  Filter,
  Inbox,
  Archive,
} from 'lucide-react';

const typeIcons: Record<MessageType, React.ReactNode> = {
  case_assigned: <FileText size={20} />,
  budget_warning: <AlertTriangle size={20} />,
  hearing_scheduled: <Calendar size={20} />,
  decision_uploaded: <Gavel size={20} />,
  invoice_ready: <DollarSign size={20} />,
  system: <Bell size={20} />,
};

const typeColors: Record<MessageType, string> = {
  case_assigned: 'bg-blue-100 text-blue-600',
  budget_warning: 'bg-amber-100 text-amber-600',
  hearing_scheduled: 'bg-purple-100 text-purple-600',
  decision_uploaded: 'bg-green-100 text-green-600',
  invoice_ready: 'bg-emerald-100 text-emerald-600',
  system: 'bg-gray-100 text-gray-600',
};

const typeLabels: Record<MessageType, string> = {
  case_assigned: '案件分配',
  budget_warning: '预算预警',
  hearing_scheduled: '庭审排期',
  decision_uploaded: '裁决完成',
  invoice_ready: '发票通知',
  system: '系统通知',
};

const Messages = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const messages = useMessageStore((state) => state.messages);
  const markAsRead = useMessageStore((state) => state.markAsRead);
  const markAllAsRead = useMessageStore((state) => state.markAllAsRead);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<MessageType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const myMessages = messages.filter((m) => m.userId === currentUser?.id);

  const filteredMessages = myMessages.filter((msg) => {
    if (filter === 'unread' && msg.isRead) return false;
    if (filter === 'read' && !msg.isRead) return false;
    if (typeFilter !== 'all' && msg.type !== typeFilter) return false;
    if (searchQuery && !msg.title.includes(searchQuery) && !msg.content.includes(searchQuery)) return false;
    return true;
  });

  const unreadCount = myMessages.filter((m) => !m.isRead).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllAsRead(currentUser.id);
    }
  };

  const handleMessageClick = (msg: typeof messages[0]) => {
    if (!msg.isRead) {
      markAsRead(msg.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
          <p className="text-gray-500 mt-1">
            共 {myMessages.length} 条消息，{unreadCount} 条未读
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={18} />
          全部标为已读
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索消息..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f === 'all' ? '全部' : f === 'unread' ? '未读' : '已读'}
                </button>
              ))}
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MessageType | 'all')}
              className="input-field w-auto"
            >
              <option value="all">全部类型</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => handleMessageClick(msg)}
            className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
              !msg.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[msg.type]}`}>
                {typeIcons[msg.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${!msg.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {msg.title}
                      </h4>
                      {!msg.isRead && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`badge ${typeColors[msg.type]}`}>{typeLabels[msg.type]}</span>
                  {msg.relatedId && (
                    <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      查看详情 →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <div className="card p-12 text-center">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 mb-2">暂无消息</p>
            <p className="text-sm text-gray-400">有新消息时会在这里显示</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
