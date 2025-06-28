export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_delivery';
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit: number;
  usagePerUser: number;
  start: string;
  end: string;
  applicableTo?: {
    categories?: string[];
    products?: string[];
    stores?: string[];
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponApplication {
  coupon: Coupon;
  discountAmount: number;
}

export interface CouponUsage {
  couponCode: string;
  userId: string;
  orderId: string;
  usedAt: string;
  discountAmount: number;
} 