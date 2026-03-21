/**
 * 通知状态管理 (Zustand)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Alert, AlertSeverity } from '@/types';

interface NotificationState {
  alerts: Alert[];
  unreadCount: number;
  filterSeverity: AlertSeverity | 'all';

  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  setFilter: (severity: AlertSeverity | 'all') => void;
  clearAlerts: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      alerts: [],
      unreadCount: 0,
      filterSeverity: 'all',

      setAlerts: (alerts: Alert[]) => {
        const unreadCount = alerts.filter((a) => !a.is_read).length;
        set({ alerts, unreadCount });
      },

      addAlert: (alert: Alert) => {
        const alerts = [alert, ...get().alerts];
        const unreadCount = alerts.filter((a) => !a.is_read).length;
        set({ alerts, unreadCount });
      },

      markAsRead: (alertId: string) => {
        const alerts = get().alerts.map((a) =>
          a.id === alertId ? { ...a, is_read: true } : a
        );
        const unreadCount = alerts.filter((a) => !a.is_read).length;
        set({ alerts, unreadCount });
      },

      markAllAsRead: () => {
        const alerts = get().alerts.map((a) => ({ ...a, is_read: true }));
        set({ alerts, unreadCount: 0 });
      },

      setFilter: (severity: AlertSeverity | 'all') => {
        set({ filterSeverity: severity });
      },

      clearAlerts: () => {
        set({ alerts: [], unreadCount: 0 });
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        alerts: state.alerts,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);
export const useFilteredAlerts = () => {
  const { alerts, filterSeverity } = useNotificationStore();
  if (filterSeverity === 'all') return alerts;
  return alerts.filter((a) => a.severity === filterSeverity);
};