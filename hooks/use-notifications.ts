import { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import useWebSocket, { ReadyState } from "react-use-websocket";
import { StoreContext } from '../stores';
import { CUSTOMER_API, WS_URL } from '../consts/api';
import { APP_NAME, APP_TYPE, ROLES } from '../consts/shared';
import { registerForPushNotificationsAsync } from '../utils/notification';
import { axiosInstance } from '../utils/http-interceptor';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats;
  unreadCount: number;
  unviewedOrdersCount: number;
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  connectionStatus: string;
}

const useNotifications = (): UseNotificationsReturn => {
  const { userDetailsStore, storeDataStore, authStore, ordersStore } = useContext(StoreContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0,
    byType: {}
  });
  const [unviewedOrdersCount, setUnviewedOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Memoize WebSocket URL to prevent unnecessary reconnections
  const webSocketUrl = useMemo(() => {
    if (!userDetailsStore.userDetails?.customerId || !authStore.userToken) {
      return null;
    }
    
    const appName = userDetailsStore.isAdmin() 
      ? (storeDataStore.storeData?.appName || APP_NAME)
      : APP_NAME;
    
    return `${WS_URL}?customerId=${userDetailsStore.userDetails.customerId}&appName=${appName}&token=${authStore.userToken}&appType=${APP_TYPE}`;
  }, [
    userDetailsStore.userDetails?.customerId,
    authStore.userToken,
    userDetailsStore.isAdmin(),
    storeDataStore.storeData?.appName
  ]);

  // WebSocket connection with improved reconnection logic
  const { readyState, lastJsonMessage } = useWebSocket(webSocketUrl, {
    share: true,
    onOpen: () => {
      console.log('WebSocket connected for notifications');
      setError(null);
      reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
      
      // When WebSocket reconnects, fetch latest unviewed orders count
      if (userDetailsStore.userDetails?.customerId && userDetailsStore.isAdmin()) {
        fetchUnviewedOrdersCount();
      }
    },
    onClose: (event) => {
      console.log('WebSocket disconnected for notifications', event.code, event.reason);
      if (event.code !== 1000) { // Not a normal closure
        reconnectAttempts.current++;
        if (reconnectAttempts.current > maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    },
    shouldReconnect: (closeEvent) => {
      // Only reconnect if it's not a normal closure and we haven't exceeded max attempts
      return closeEvent.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts;
    },
    reconnectAttempts: maxReconnectAttempts,
    reconnectInterval: (attemptNumber) => Math.min(1000 * Math.pow(2, attemptNumber), 30000), // Exponential backoff with max 30s
    retryOnError: true,
  });

  // Connection status mapping
  const connectionStatus = {
    0: 'Connecting',
    1: 'Open',
    2: 'Closing',
    3: 'Closed',
  }[readyState] || 'Unknown';

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastJsonMessage) {
      const message = lastJsonMessage as any;
      
      if (message.type === 'notification') {
        // Add new notification to the list
        const newNotification: Notification = {
          _id: Date.now().toString(), // Temporary ID
          title: message.data.title,
          body: message.data.body,
          type: message.data.type,
          data: message.data.data,
          isRead: false,
          createdAt: message.data.timestamp
        };

        setNotifications(prev => [newNotification, ...prev]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          unread: prev.unread + 1,
          byType: {
            ...prev.byType,
            [message.data.type]: (prev.byType[message.data.type] || 0) + 1
          }
        }));
        
        // If this is a new order notification, also fetch unviewed orders count
        if (message.data.type === 'new_order' && userDetailsStore.isAdmin()) {
          fetchUnviewedOrdersCount();
        }
        
        console.log('stats', stats);
        // Show local notification
        showLocalNotification(newNotification);
      } else if (message.type === 'unviewed_orders_updated' && userDetailsStore.isAdmin()) {
        // Refresh unviewed orders count when an order is marked as viewed or new order arrives
        console.log('Received unviewed_orders_updated message, refreshing count');
        fetchUnviewedOrdersCount();
      } else if (message.type === 'print_order' && userDetailsStore.isAdmin()) {
        // Handle print order notification
        console.log('Received print_order message:', message.data);
        const newNotification: Notification = {
          _id: Date.now().toString(),
          title: 'طلب جديد يحتاج للطباعة',
          body: `طلب جديد رقم ${message.data.orderId} يحتاج للطباعة`,
          type: 'print_order',
          data: message.data,
          isRead: false,
          createdAt: message.data.timestamp || new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
      } else if (message.type === 'print_not_printed' && userDetailsStore.isAdmin()) {
        // Handle print not printed notification
        console.log('Received print_not_printed message:', message.data);
        const newNotification: Notification = {
          _id: Date.now().toString(),
          title: 'طلب لم يتم طباعته',
          body: `طلب رقم ${message.data.orderId} لم يتم طباعته بعد`,
          type: 'print_not_printed',
          data: message.data,
          isRead: false,
          createdAt: message.data.timestamp || new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }
  }, [lastJsonMessage]);

  // Show local notification
  const showLocalNotification = useCallback(async (notification: Notification) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }, []);

  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    if (!userDetailsStore.userDetails?.customerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications?limit=50`, {
        headers: {
          'app-name': userDetailsStore.isAdmin() ? storeDataStore.storeData?.appName : APP_NAME,
          'user-id': userDetailsStore.userDetails.customerId,
          'Authorization': `Bearer ${authStore.userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userDetailsStore.userDetails?.customerId, authStore.userToken, userDetailsStore.isAdmin(), storeDataStore.storeData?.appName]);

  // Fetch notification stats
  const fetchStats = useCallback(async () => {
    if (!userDetailsStore.userDetails?.customerId) return;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/stats`, {
        headers: {
          'app-name': userDetailsStore.isAdmin() ? storeDataStore.storeData?.appName : APP_NAME,
          'user-id': userDetailsStore.userDetails.customerId,
          'Authorization': `Bearer ${authStore.userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [userDetailsStore.userDetails?.customerId, authStore.userToken, userDetailsStore.isAdmin(), storeDataStore.storeData?.appName]);

  // Fetch unviewed orders count
  const fetchUnviewedOrdersCount = useCallback(async () => {
    console.log('fetchUnviewedOrdersCount');
    if (!userDetailsStore.userDetails?.customerId && authStore.userToken) return;

    try {
      // const api = `${process.env.EXPO_PUBLIC_API_URL}/api/order/admin/not-viewd`;
      // const response = await fetch(api, {
      //   headers: {
      //     'app-name': storeDataStore.storeData?.appName || APP_NAME,
      //     'Authorization': `Bearer ${authStore.userToken}`,
      //   },
      // });
      console.log("userDetailsStore.userDetails?.customerId",userDetailsStore.userDetails?.customerId)
      const response =  await ordersStore.getNotViewdOrders(userDetailsStore.isAdmin(ROLES.all));


        setUnviewedOrdersCount(Array.isArray(response) ? response.length : 0);
    } catch (err) {
      console.error('Error fetching unviewed orders count:', err);
    }
  }, [userDetailsStore.userDetails?.customerId, authStore.userToken, userDetailsStore.isAdmin(), storeDataStore.storeData?.appName]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'app-name': userDetailsStore.isAdmin() ? storeDataStore.storeData?.appName : APP_NAME,
          'Authorization': `Bearer ${authStore.userToken}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1
        }));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [authStore.userToken, userDetailsStore.isAdmin(), storeDataStore.storeData?.appName]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'app-name': userDetailsStore.isAdmin() ? storeDataStore.storeData?.appName : APP_NAME,
          'user-id': userDetailsStore.userDetails?.customerId,
          'Authorization': `Bearer ${authStore.userToken}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        
        setStats(prev => ({
          ...prev,
          unread: 0,
          read: prev.total
        }));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [userDetailsStore.userDetails?.customerId, authStore.userToken, userDetailsStore.isAdmin(), storeDataStore.storeData?.appName]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'app-name': userDetailsStore.isAdmin() ? storeDataStore.storeData?.appName : APP_NAME,
          'user-id': userDetailsStore.userDetails?.customerId,
          'Authorization': `Bearer ${authStore.userToken}`,
        },
      });

      if (response.ok) {
        const deletedNotification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        if (deletedNotification) {
          setStats(prev => ({
            ...prev,
            total: prev.total - 1,
            unread: deletedNotification.isRead ? prev.unread : prev.unread - 1,
            read: deletedNotification.isRead ? prev.read - 1 : prev.read,
            byType: {
              ...prev.byType,
              [deletedNotification.type]: Math.max(0, (prev.byType[deletedNotification.type] || 0) - 1)
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [userDetailsStore.userDetails?.customerId, authStore.userToken, userDetailsStore.isAdmin(), storeDataStore.storeData?.appName, notifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchStats(), fetchUnviewedOrdersCount()]);
  }, [fetchNotifications, fetchStats, fetchUnviewedOrdersCount]);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          axiosInstance
          .post(
            `${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.UPDATE_CUSTOMER_NOTIFIVATION_TOKEN}`,
            { notificationToken: token },
            {
              headers: { "Content-Type": "application/json", "app-name":  APP_NAME }
            }
          )
          // You might want to send this token to your server
          console.log('Push notification token:', token);
        }
      } catch (error) {
        console.error('Failed to register for push notifications:', error);
      }
    };
    if(authStore.isLoggedIn() && userDetailsStore.userDetails?.customerId){
      initializeNotifications();
    }
  }, [userDetailsStore.userDetails?.customerId]);


  // Initialize push notifications
  useEffect(() => {


    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      fetchUnviewedOrdersCount();
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap
      const notificationData = response.notification.request.content.data;
      // Navigate to appropriate screen based on notification data
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, refresh notifications and unviewed orders
        refreshNotifications();
        
        // Also fetch unviewed orders count separately to ensure it's up to date
        if (userDetailsStore.userDetails?.customerId && userDetailsStore.isAdmin()) {
          fetchUnviewedOrdersCount();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [refreshNotifications, userDetailsStore.userDetails?.customerId, userDetailsStore.isAdmin(), fetchUnviewedOrdersCount]);

  // Fetch notifications when user is available
  useEffect(() => {
    if (userDetailsStore.userDetails?.customerId) {
      refreshNotifications();
    }
  }, [userDetailsStore.userDetails?.customerId, refreshNotifications]);

  // Periodic refresh of unviewed orders count for admin users
  useEffect(() => {
    if (!userDetailsStore.userDetails?.customerId || !userDetailsStore.isAdmin()) {
      return;
    }

    // Initial fetch
    fetchUnviewedOrdersCount();

    // Set up periodic refresh every 30 seconds
    // const interval = setInterval(() => {
    //   fetchUnviewedOrdersCount();
    // }, 30000); // 30 seconds

    // return () => clearInterval(interval);
  }, [userDetailsStore.userDetails?.customerId, userDetailsStore.isAdmin(), fetchUnviewedOrdersCount]);

  return {
    notifications,
    stats,
    unreadCount: stats.unread,
    unviewedOrdersCount,
    totalUnreadCount: stats.unread + unviewedOrdersCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    connectionStatus,
  };
};

export default useNotifications; 