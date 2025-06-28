import { BASE_URL, DELIVERY_DRIVER_API } from '../consts/api';

export interface Order {
  _id: string;
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

class DeliveryDriverService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'app-name': 'shoofi-app',
    };
  }

  // Get orders list for driver
  async getOrdersList(driverId: string, statusList?: string[], isAllWeek: boolean = false): Promise<Order[]> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_ORDERS_LIST}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          customerId: driverId,
          statusList: statusList || ['1', '2', '3', '0', '-1'],
          isAllWeek,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Get single order details
  async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_ORDER_DETAILS}/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string, additionalData?: any): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_ORDER}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          _id: orderId,
          status,
          ...additionalData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Get driver statistics
  async getDriverStats(driverId: string, startDate?: string, endDate?: string): Promise<DriverStats> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_DRIVER_STATS}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          driverId,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching driver statistics:', error);
      throw error;
    }
  }

  // Get driver earnings
  async getDriverEarnings(driverId: string, startDate?: string, endDate?: string): Promise<EarningsData[]> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_DRIVER_EARNINGS}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          driverId,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver earnings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching driver earnings:', error);
      throw error;
    }
  }

  // Update driver location
  async updateDriverLocation(driverId: string, latitude: number, longitude: number, isOnline: boolean = true): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_DRIVER_LOCATION}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          driverId,
          latitude,
          longitude,
          isOnline,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver location');
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Get nearby orders
  async getNearbyOrders(driverId: string, latitude: number, longitude: number, radius: number = 5000): Promise<Order[]> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_NEARBY_ORDERS}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          driverId,
          latitude,
          longitude,
          radius,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby orders:', error);
      throw error;
    }
  }

  // Get driver schedule
  async getDriverSchedule(driverId: string, startDate?: string, endDate?: string): Promise<ScheduleData[]> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_DRIVER_SCHEDULE}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          driverId,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching driver schedule:', error);
      throw error;
    }
  }

  // Update driver availability
  async updateDriverAvailability(driverId: string, isAvailable: boolean, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_DRIVER_AVAILABILITY}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          driverId,
          isAvailable,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver availability');
      }
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  }

  // Get driver notifications
  async getDriverNotifications(driverId: string, limit: number = 20, offset: number = 0): Promise<{
    notifications: Notification[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_NOTIFICATIONS}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          driverId,
          limit,
          offset,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching driver notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.MARK_NOTIFICATION_READ}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          notificationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get employee profile
  async getEmployeeProfile(employeeId: string): Promise<DriverProfile> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.GET_EMPLOYEE_PROFILE}/${employeeId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employee profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching employee profile:', error);
      throw error;
    }
  }

  // Update employee profile
  async updateEmployeeProfile(employeeId: string, profileData: Partial<DriverProfile>): Promise<DriverProfile> {
    try {
      const response = await fetch(`${BASE_URL}/${DELIVERY_DRIVER_API.CONTROLLER}/${DELIVERY_DRIVER_API.UPDATE_EMPLOYEE_PROFILE}/${employeeId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating employee profile:', error);
      throw error;
    }
  }
}

export default new DeliveryDriverService(); 