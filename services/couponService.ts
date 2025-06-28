import { Coupon, CouponApplication } from '../types/coupon';
import { axiosInstance } from '../utils/http-interceptor';

export const couponService = {
  // Apply a coupon to an order
  applyCoupon: async (code: string, orderAmount: number, userId: string): Promise<CouponApplication> => {
    try {
      const response:any = await axiosInstance.post('/coupons/apply', {
        code: code.toUpperCase(),
        orderAmount,
        userId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Redeem a coupon (mark as used)
  redeemCoupon: async (code: string, userId: string, orderId: string, discountAmount: number): Promise<any> => {
    try {
      const response = await axiosInstance.post('/coupons/redeem', {
        code: code.toUpperCase(),
        userId,
        orderId,
        discountAmount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available coupons for a user
  getAvailableCoupons: async (): Promise<Coupon[]> => {
    try {
      const response = await axiosInstance.get('/coupons/available');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's coupon usage history
  getUserCouponHistory: async (userId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`/coupons/user/${userId}/history`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 