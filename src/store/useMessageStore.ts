import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, MessageType } from '../types';
import { mockMessages } from '../data/mockData';
import { generateId } from '../utils';

interface MessageState {
  messages: Message[];
  addMessage: (userId: string, type: MessageType, title: string, content: string, relatedId?: string, relatedType?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
  deleteMessage: (id: string) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: mockMessages,
      addMessage: (userId, type, title, content, relatedId, relatedType) => {
        const newMessage: Message = {
          id: generateId(),
          userId,
          type,
          title,
          content,
          relatedId,
          relatedType,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ messages: [newMessage, ...state.messages] }));
      },
      markAsRead: (id) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, isRead: true } : m
          ),
        }));
      },
      markAllAsRead: (userId) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.userId === userId ? { ...m, isRead: true } : m
          ),
        }));
      },
      getUnreadCount: (userId) => {
        return get().messages.filter((m) => m.userId === userId && !m.isRead).length;
      },
      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        }));
      },
    }),
    {
      name: 'message-storage',
    }
  )
);
