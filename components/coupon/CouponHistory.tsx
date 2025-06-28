import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StoreContext } from '../../stores';

interface CouponHistoryProps {
  userId: string;
}

interface CouponHistoryItem {
  _id: string;
  couponCode: string;
  orderId: string;
  usedAt: string;
  discountAmount: number;
  order?: {
    total: number;
    items: any[];
  };
}

const CouponHistory: React.FC<CouponHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<CouponHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { couponsStore } = useContext(StoreContext);

  const fetchHistory = async () => {
    try {
      const userHistory = await couponsStore.getUserCouponHistory(userId);
      setHistory(userHistory);
    } catch (error) {
      console.error('Error fetching coupon history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderHistoryItem = ({ item }: { item: CouponHistoryItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.couponCode}>{item.couponCode}</Text>
        <Text style={styles.discountAmount}>
          -${item.discountAmount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.historyDetails}>
        <Text style={styles.orderInfo}>
          Order #{item.orderId.slice(-8).toUpperCase()}
        </Text>
        <Text style={styles.dateText}>
          {new Date(item.usedAt).toLocaleDateString()} at{' '}
          {new Date(item.usedAt).toLocaleTimeString()}
        </Text>
      </View>

      {item.order && (
        <View style={styles.orderSummary}>
          <Text style={styles.orderTotal}>
            Order Total: ${item.order.total.toFixed(2)}
          </Text>
          <Text style={styles.savingsText}>
            You saved: ${item.discountAmount.toFixed(2)} (
            {((item.discountAmount / item.order.total) * 100).toFixed(1)}%)
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coupon History</Text>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No coupon usage history</Text>
            <Text style={styles.emptySubtext}>
              Your coupon usage will appear here
            </Text>
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
  historyItem: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  historyDetails: {
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  orderTotal: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  savingsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default CouponHistory; 