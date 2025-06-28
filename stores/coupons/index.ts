import { makeAutoObservable, runInAction } from "mobx";
import { Coupon, CouponApplication } from '../../types/coupon';
import { axiosInstance } from "../../utils/http-interceptor";

class CouponsStore {
  selections = {};
  availableCoupons: Coupon[] = [];
  appliedCoupon: CouponApplication | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Apply a coupon to an order
  async applyCoupon(code: string, orderAmount: number, userId: string): Promise<CouponApplication> {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await axiosInstance.post('/coupons/apply', {
        code: code.toUpperCase(),
        orderAmount,
        userId
      });


      const data: any = response;
      
      runInAction(() => {
        this.appliedCoupon = data;
        this.loading = false;
      });

      return data;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Remove applied coupon
  removeCoupon() {
    this.appliedCoupon = null;
    this.error = null;
  }

  // Redeem a coupon (mark as used)
  async redeemCoupon(code: string, userId: string, orderId: string, discountAmount: number): Promise<any> {
    try {
      const response = await axiosInstance.post('/coupons/redeem', {
        code: code.toUpperCase(),
        userId,
        orderId,
        discountAmount
      });

      const data: any = response;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get available coupons for a user
  async getAvailableCoupons(): Promise<Coupon[]> {
    this.loading = true;
    this.error = null;

    try {
      const response = await axiosInstance.get('/coupons/available');
      
      const data: any = response;
      
      runInAction(() => {
        this.availableCoupons = data;
        this.loading = false;
      });

      return data;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Get user's coupon usage history
  async getUserCouponHistory(userId: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get(`/coupons/user/${userId}/history`);
      
      const data: any = response;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Clear error
  clearError() {
    this.error = null;
  }
}

export const couponsStore = new CouponsStore();
export { CouponsStore };
