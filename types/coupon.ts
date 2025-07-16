export interface Coupon {
  _id: string;
  code: string;
  nameAR: string;
  nameHE: string;
  icon: 'discount' | 'gift' | 'star' | 'heart' | 'fire';
  type: 'percentage' | 'fixed_amount' | 'free_delivery';
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit: number;
  usagePerUser: number;
  start: string;
  end: string;
  applicableTo?: {
    allStores?: boolean;
    generalCategories?: string[];
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