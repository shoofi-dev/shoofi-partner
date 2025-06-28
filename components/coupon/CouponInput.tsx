import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StoreContext } from '../../stores';
import { CouponApplication } from '../../types/coupon';

interface CouponInputProps {
  orderAmount: number;
  userId: string;
  onCouponApplied: (couponApp: CouponApplication) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: CouponApplication;
}

const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  userId,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const { couponsStore } = useContext(StoreContext);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    try {
      const couponApp = await couponsStore.applyCoupon(
        couponCode.trim(),
        orderAmount,
        userId
      );
      onCouponApplied(couponApp);
      setCouponCode('');
      Alert.alert('Success', 'Coupon applied successfully!');
    } catch (error: any) {
      Alert.alert('Error', couponsStore.error || 'Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = () => {
    couponsStore.removeCoupon();
    onCouponRemoved();
    Alert.alert('Success', 'Coupon removed successfully!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apply Coupon</Text>
      
      {appliedCoupon ? (
        <View style={styles.appliedCoupon}>
          <View style={styles.couponInfo}>
            <Text style={styles.couponCode}>{appliedCoupon.coupon.code}</Text>
            <Text style={styles.discountText}>
              Discount: ${appliedCoupon.discountAmount.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveCoupon}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter coupon code"
            value={couponCode}
            onChangeText={setCouponCode}
            autoCapitalize="characters"
            editable={!couponsStore.loading}
          />
          <TouchableOpacity
            style={[styles.applyButton, couponsStore.loading && styles.disabledButton]}
            onPress={handleApplyCoupon}
            disabled={couponsStore.loading}
          >
            {couponsStore.loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.applyButtonText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  discountText: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CouponInput; 