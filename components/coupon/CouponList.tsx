import React, { useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StoreContext } from '../../stores';
import { Coupon } from '../../types/coupon';

interface CouponListProps {
  onCouponSelect?: (coupon: Coupon) => void;
  showExpired?: boolean;
}

const CouponList: React.FC<CouponListProps> = ({
  onCouponSelect,
  showExpired = false,
}) => {
  const { couponsStore } = useContext(StoreContext);

  useEffect(() => {
    couponsStore.getAvailableCoupons();
  }, []);

  const onRefresh = () => {
    couponsStore.getAvailableCoupons();
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => {
    const isExpired = new Date(item.end) < new Date();
    const isValid = item.isActive && !isExpired;

    if (!showExpired && isExpired) return null;

    return (
      <TouchableOpacity
        style={[
          styles.couponItem,
          !isValid && styles.expiredCoupon,
          onCouponSelect && isValid && styles.selectableCoupon,
        ]}
        onPress={() => onCouponSelect && isValid && onCouponSelect(item)}
        disabled={!isValid || !onCouponSelect}
      >
        <View style={styles.couponHeader}>
          <Text style={[styles.couponCode, !isValid && styles.expiredText]}>
            {item.code}
          </Text>
          <View style={[styles.statusBadge, !isValid && styles.expiredBadge]}>
            <Text style={styles.statusText}>
              {isExpired ? 'Expired' : isValid ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <Text style={[styles.couponType, !isValid && styles.expiredText]}>
          {item.type === 'percentage' && `${item.value}% OFF`}
          {item.type === 'fixed_amount' && `$${item.value} OFF`}
          {item.type === 'free_delivery' && 'Free Delivery'}
        </Text>

        {item.minOrderAmount && (
          <Text style={[styles.conditionText, !isValid && styles.expiredText]}>
            Min. order: ${item.minOrderAmount}
          </Text>
        )}

        {item.maxDiscount && item.type === 'percentage' && (
          <Text style={[styles.conditionText, !isValid && styles.expiredText]}>
            Max discount: ${item.maxDiscount}
          </Text>
        )}

        <Text style={[styles.validityText, !isValid && styles.expiredText]}>
          Valid until: {new Date(item.end).toLocaleDateString()}
        </Text>

        {onCouponSelect && isValid && (
          <Text style={styles.selectText}>Tap to apply</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (couponsStore.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading coupons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Coupons</Text>
      <FlatList
        data={couponsStore.availableCoupons}
        renderItem={renderCouponItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={couponsStore.loading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No coupons available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  couponItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expiredCoupon: {
    opacity: 0.6,
  },
  selectableCoupon: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  couponCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expiredText: {
    color: '#999',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  couponType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  validityText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  selectText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CouponList; 