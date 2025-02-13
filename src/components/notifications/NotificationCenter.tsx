import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GET_USER_NOTIFICATIONS, GET_UNREAD_COUNT } from '@/graphql/queries';
import {
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_AS_READ,
  DELETE_NOTIFICATION,
  CLEAR_ALL_NOTIFICATIONS,
} from '@/graphql/mutations';
import { useSocket } from '@/hooks/useSocket';
import { NotificationType, NotificationPriority } from '@/types/notifications';

interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const socket = useSocket();

  // Fetch notifications
  const { data, loading, error, refetch } = useQuery(GET_USER_NOTIFICATIONS, {
    variables: { limit: 20, offset: 0 },
  });

  // Get unread count
  const { data: unreadData, refetch: refetchUnread } = useQuery(GET_UNREAD_COUNT);

  // Mutations
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_AS_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);
  const [clearAll] = useMutation(CLEAR_ALL_NOTIFICATIONS);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (newNotification: Notification) => {
      refetch();
      refetchUnread();

      // Show toast for high priority notifications
      if (
        [NotificationPriority.HIGH, NotificationPriority.URGENT].includes(
          newNotification.priority
        )
      ) {
        toast({
          title: newNotification.title,
          description: newNotification.message,
          duration: 5000,
        });
      }
    });

    return () => {
      socket.off('notification');
    };
  }, [socket, refetch, refetchUnread, toast]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead({ variables: { id } });
      refetchUnread();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetchUnread();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification({ variables: { id } });
      refetch();
      refetchUnread();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      refetch();
      refetchUnread();
      toast({
        title: 'Success',
        description: 'All notifications cleared',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear notifications',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'bg-red-500';
      case NotificationPriority.HIGH:
        return 'bg-orange-500';
      case NotificationPriority.MEDIUM:
        return 'bg-blue-500';
      default:
        return 'bg-secondary-500';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadData?.getUnreadNotificationsCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
            {unreadData.getUnreadNotificationsCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-12 z-50 w-96 rounded-lg bg-white shadow-lg dark:bg-secondary-800"
          >
            <div className="flex items-center justify-between border-b border-secondary-200 p-4 dark:border-secondary-700">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Notifications
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={!data?.getUserNotifications?.length}
                >
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={!data?.getUserNotifications?.length}
                >
                  Clear all
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[32rem]">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-secondary-500">Loading...</span>
                </div>
              ) : error ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-red-500">Error loading notifications</span>
                </div>
              ) : !data?.getUserNotifications?.length ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-secondary-500">No notifications</span>
                </div>
              ) : (
                <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
                  {data.getUserNotifications.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      className={`relative flex items-start gap-4 p-4 ${
                        notification.isRead
                          ? 'bg-white dark:bg-secondary-800'
                          : 'bg-secondary-50 dark:bg-secondary-700'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${getPriorityColor(
                          notification.priority
                        )}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                          {notification.message}
                        </p>
                        <span className="mt-2 text-xs text-secondary-400">
                          {format(new Date(notification.createdAt), 'PPp')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {notification.data?.url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(notification.data.url)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 