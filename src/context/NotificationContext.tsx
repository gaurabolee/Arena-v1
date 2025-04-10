import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'bell' | 'message';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadBellCount: number;
  unreadMessageCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: (type: 'bell' | 'message') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Calculate unread counts
  const unreadBellCount = notifications.filter(n => n.type === 'bell' && !n.read).length;
  const unreadMessageCount = notifications.filter(n => n.type === 'message' && !n.read).length;

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications of a type as read
  const markAllAsRead = (type: 'bell' | 'message') => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.type === type ? { ...notification, read: true } : notification
      )
    );
  };

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  useEffect(() => {
    if (currentUser) {
      // Fetch notifications for the current user
      // Example: fetchNotifications(currentUser.uid);
    }
  }, [currentUser]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadBellCount,
        unreadMessageCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 