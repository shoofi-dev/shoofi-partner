import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { DELIVERY_DRIVER_API } from "../../consts/api";
import { BASE_URL } from "../../consts/api";

export interface Order {
  _id: string;
  bookId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  storeName: string;
  status: string;
  created: string;
  pickupTime?: string;
  deliveryTime?: string;
  totalPrice: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    extras?: string[];
  }>;
  notes?: string;
  paymentMethod?: string;
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  deliveryFee?: number;
}

export interface DriverStats {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalEarnings: number;
  averageDeliveryTime: number;
  recentOrders: number;
  successRate: number;
}

export interface EarningsData {
  date: string;
  orders: number;
  earnings: number;
}

export interface ScheduleData {
  date: string;
  orders: Order[];
  totalOrders: number;
  totalEarnings: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  data?: {
    orderId?: string;
    bookId?: string;
    [key: string]: any;
  };
}

export interface DriverProfile {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  isActive: boolean;
  companyId: string;
  companyName?: string;
  vehicleInfo?: {
    type: string;
    model: string;
    plateNumber: string;
  };
  rating?: number;
  totalDeliveries?: number;
  totalEarnings?: number;
  createdAt: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  isOnline?: boolean;
  isAvailable?: boolean;
}

class DeliveryDriverStore {
  // Orders state
  orders: Order[] = [];
  activeOrders: Order[] = [];
  completedOrders: Order[] = [];
  loading: boolean = false;
  refreshing: boolean = false;
  
  // Profile state
  profile: DriverProfile | null = null;
  profileLoading: boolean = false;
  
  // Stats state
  stats: DriverStats | null = null;
  statsLoading: boolean = false;
  
  // Location and availability state
  isOnline: boolean = true;
  currentLocation: { latitude: number; longitude: number } | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed values
  get totalOrders() {
    return this.orders.length;
  }

  get activeOrdersCount() {
    return this.activeOrders.length;
  }

  get completedOrdersCount() {
    return this.completedOrders.length;
  }

  // Orders methods
  getOrdersFromServer = async (driverId: string, statusList?: string[], isAllWeek: boolean = false) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_ORDERS_LIST}`,
        {
          customerId: driverId,
          statusList: statusList || ['1', '2', '3', '0', '-1'],
          isAllWeek,
        }
      )
      .then(function (response: any) {
        return response;
      });
  };

  getOrders = async (driverId: string, statusList?: string[], isAllWeek: boolean = false) => {
    this.loading = true;
    try {
      const ordersData = await this.getOrdersFromServer(driverId, statusList, isAllWeek);
      runInAction(() => {
        this.orders = ordersData || [];
        this.activeOrders = this.orders.filter(order => ['2', '3'].includes(order.status));
        this.completedOrders = this.orders.filter(order => ['0', '-1'].includes(order.status));
      });
      return ordersData;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  refreshOrders = async (driverId: string, statusList?: string[], isAllWeek: boolean = false) => {
    this.refreshing = true;
    try {
      const ordersData = await this.getOrdersFromServer(driverId, statusList, isAllWeek);
      runInAction(() => {
        this.orders = ordersData || [];
        this.activeOrders = this.orders.filter(order => ['2', '3'].includes(order.status));
        this.completedOrders = this.orders.filter(order => ['0', '-1'].includes(order.status));
      });
      return ordersData;
    } catch (error) {
      console.error('Error refreshing orders:', error);
      throw error;
    } finally {
      runInAction(() => {
        this.refreshing = false;
      });
    }
  };

  getOrderDetailsFromServer = async (orderId: string) => {
    return axiosInstance
      .get(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_ORDER_DETAILS}/${orderId}`
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  getOrderDetails = async (orderId: string) => {
    try {
      const orderData = await this.getOrderDetailsFromServer(orderId);
      return orderData;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  };

  updateOrderStatusServer = async (orderId: string, status: string, additionalData?: any) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_ORDER}`,
        {
          _id: orderId,
          status,
          ...additionalData,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  updateOrderStatus = async (orderId: string, status: string, additionalData?: any) => {
    try {
      await this.updateOrderStatusServer(orderId, status, additionalData);
      // Refresh orders after status update
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // Profile methods
  getProfileFromServer = async (driverId: string) => {
    return axiosInstance
      .get(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_EMPLOYEE_PROFILE}/${driverId}`
      )
      .then(function (response: any) {
        return response;
      });
  };

  getProfile = async (driverId: string) => {
    this.profileLoading = true;
    try {
      const profileData = await this.getProfileFromServer(driverId);
      console.log("profileData", profileData);
      runInAction(() => {
        this.profile = profileData;
        if (profileData?.currentLocation) {
          this.currentLocation = profileData.currentLocation;
        }
        if (profileData?.isActive !== undefined) {
          this.isOnline = profileData.isActive;
        }
      });
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    } finally {
      runInAction(() => {
        this.profileLoading = false;
      });
    }
  };

  updateProfileServer = async (driverId: string, profileData: Partial<DriverProfile>) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_EMPLOYEE_PROFILE}/${driverId}`,
        profileData
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  updateProfile = async (driverId: string, profileData: Partial<DriverProfile>) => {
    try {
      const updatedProfile = await this.updateProfileServer(driverId, profileData);
      runInAction(() => {
        this.profile = updatedProfile;
      });
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Stats methods
  getStatsFromServer = async (driverId: string, startDate?: string, endDate?: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_DRIVER_STATS}`,
        {
          driverId,
          startDate,
          endDate,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  getStats = async (driverId: string, startDate?: string, endDate?: string) => {
    this.statsLoading = true;
    try {
      const statsData = await this.getStatsFromServer(driverId, startDate, endDate);
      runInAction(() => {
        this.stats = statsData;
      });
      return statsData;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    } finally {
      runInAction(() => {
        this.statsLoading = false;
      });
    }
  };

  // Location methods
  updateLocationServer = async (driverId: string, latitude: number, longitude: number, isOnline: boolean = true) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_DRIVER_LOCATION}`,
        {
          driverId,
          latitude,
          longitude,
          isOnline,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  updateLocation = async (driverId: string, latitude: number, longitude: number, isOnline: boolean = true) => {
    try {
      await this.updateLocationServer(driverId, latitude, longitude, isOnline);
      runInAction(() => {
        this.currentLocation = { latitude, longitude };
        this.isOnline = isOnline;
      });
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  // Availability methods
  updateAvailabilityServer = async (driverId: string, isAvailable: boolean, reason?: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_DRIVER_AVAILABILITY}`,
        {
          driverId,
          isAvailable,
          reason,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  updateAvailability = async (driverId: string, isAvailable: boolean, reason?: string) => {
    try {
      await this.updateAvailabilityServer(driverId, isAvailable, reason);
      runInAction(() => {
        if (this.profile) {
          this.profile.isAvailable = isAvailable;
        }
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  };

  // Nearby orders methods
  getNearbyOrdersFromServer = async (driverId: string, latitude: number, longitude: number, radius: number = 5000) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_NEARBY_ORDERS}`,
        {
          driverId,
          latitude,
          longitude,
          radius,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  getNearbyOrders = async (driverId: string, latitude: number, longitude: number, radius: number = 5000) => {
    try {
      const nearbyOrders = await this.getNearbyOrdersFromServer(driverId, latitude, longitude, radius);
      return nearbyOrders;
    } catch (error) {
      console.error('Error fetching nearby orders:', error);
      throw error;
    }
  };

  // Earnings methods
  getEarningsFromServer = async (driverId: string, startDate?: string, endDate?: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_DRIVER_EARNINGS}`,
        {
          driverId,
          startDate,
          endDate,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  getEarnings = async (driverId: string, startDate?: string, endDate?: string) => {
    try {
      const earningsData = await this.getEarningsFromServer(driverId, startDate, endDate);
      return earningsData;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  };

  // Schedule methods
  getScheduleFromServer = async (driverId: string, startDate?: string, endDate?: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_DRIVER_SCHEDULE}`,
        {
          driverId,
          startDate,
          endDate,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  getSchedule = async (driverId: string, startDate?: string, endDate?: string) => {
    try {
      const scheduleData = await this.getScheduleFromServer(driverId, startDate, endDate);
      return scheduleData;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  };

  // Notifications methods
  getNotificationsFromServer = async (driverId: string, limit: number = 20, offset: number = 0) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_NOTIFICATIONS}`,
        {
          driverId,
          limit,
          offset,
        }
      )
      .then(function (response: any) {
        return response;
      });
  };

  getNotifications = async (driverId: string, limit: number = 20, offset: number = 0) => {
    try {
      const notificationsData = await this.getNotificationsFromServer(driverId, limit, offset);
      return notificationsData;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  };

  markNotificationReadServer = async (notificationId: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.MARK_NOTIFICATION_READ}`,
        {
          notificationId,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  markNotificationRead = async (notificationId: string) => {
    try {
      const result = await this.markNotificationReadServer(notificationId);
      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  createNotificationFromServer = async (recipientId: string, title: string, message: string, type: string = 'system', data: any = {}) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.CREATE_NOTIFICATION}`,
        {
          recipientId,
          title,
          message,
          type,
          data,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  createNotification = async (recipientId: string, title: string, message: string, type: string = 'system', data: any = {}) => {
    try {
      const result = await this.createNotificationFromServer(recipientId, title, message, type, data);
      return result;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Order action methods
  approveOrderServer = async (orderId: string, driverId: string, bookId: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.APPROVE_ORDER}`,
        {
          orderId,
          driverId,
          bookId,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  approveOrder = async (orderId: string, driverId: string, bookId: string) => {
    try {
      const result = await this.approveOrderServer(orderId, driverId, bookId);
      // Update local order status
      runInAction(() => {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
          order.status = '2'; // Approved status
        }
      });
      return result;
    } catch (error) {
      console.error('Error approving order:', error);
      throw error;
    }
  };

  cancelOrderServer = async (orderId: string, driverId: string, bookId: string, reason?: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.CANCEL_ORDER}`,
        {
          orderId,
          driverId,
          bookId,
          reason,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  cancelOrder = async (orderId: string, driverId: string, bookId: string, reason?: string) => {
    try {
      const result = await this.cancelOrderServer(orderId, driverId, bookId, reason);
      // Update local order status
      runInAction(() => {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
          order.status = '-1'; // Cancelled status
        }
      });
      return result;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  };

  startOrderServer = async (orderId: string, driverId: string, bookId: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.START_ORDER}`,
        {
          orderId,
          driverId,
          bookId,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  startOrder = async (orderId: string, driverId: string, bookId: string) => {
    try {
      const result = await this.startOrderServer(orderId, driverId, bookId);
      // Update local order status
      runInAction(() => {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
          order.status = '3'; // In progress status
        }
      });
      return result;
    } catch (error) {
      console.error('Error starting order:', error);
      throw error;
    }
  };

  completeOrderServer = async (orderId: string, driverId: string, bookId: string) => {
    return axiosInstance
      .post(
        `${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.COMPLETE_ORDER}`,
        {
          orderId,
          driverId,
          bookId,
        }
      )
      .then(function (response: any) {
        return response.data;
      });
  };

  completeOrder = async (orderId: string, driverId: string, bookId: string) => {
    try {
      const result = await this.completeOrderServer(orderId, driverId, bookId);
      // Update local order status
      runInAction(() => {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
          order.status = '0'; // Completed status
        }
      });
      return result;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  };

  // Utility methods
  setIsOnline = (online: boolean) => {
    this.isOnline = online;
  };

  setCurrentLocation = (location: { latitude: number; longitude: number } | null) => {
    this.currentLocation = location;
  };

  resetStore = () => {
    runInAction(() => {
      this.orders = [];
      this.activeOrders = [];
      this.completedOrders = [];
      this.profile = null;
      this.stats = null;
      this.currentLocation = null;
      this.isOnline = true;
      this.loading = false;
      this.refreshing = false;
      this.profileLoading = false;
      this.statsLoading = false;
    });
  };
}

export const deliveryDriverStore = new DeliveryDriverStore(); 