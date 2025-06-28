import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { observer } from 'mobx-react';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { StoreContext } from '../../stores';
import DeliveryDriverHeader from '../../components/delivery-driver/DeliveryDriverHeader';
import OrderCard from '../../components/delivery-driver/OrderCard';
import StatusBadge from '../../components/delivery-driver/StatusBadge';
import { colors } from '../../styles/colors';

const DeliveryDriverDashboard = observer(() => {
  const navigation = useNavigation();
  const { deliveryDriverStore, userDetailsStore } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (userDetailsStore.userDetails?.customerId) {
      deliveryDriverStore.getOrders(userDetailsStore.userDetails.customerId);
      deliveryDriverStore.getProfile(userDetailsStore.userDetails.customerId);
      deliveryDriverStore.getStats(userDetailsStore.userDetails.customerId);
    }
  }, [userDetailsStore.userDetails?.customerId]);

  const onRefresh = () => {
    if (userDetailsStore.userDetails?.customerId) {
      deliveryDriverStore.refreshOrders(userDetailsStore.userDetails.customerId);
    }
  };

  const handleOrderAction = async (order: any, action: string) => {
    let confirmMessage = '';

    switch (action) {
      case 'pickup':
        confirmMessage = 'Confirm that you have picked up this order?';
        break;
      case 'deliver':
        confirmMessage = 'Confirm that you have delivered this order?';
        break;
      case 'cancel':
        confirmMessage = 'Are you sure you want to cancel this order?';
        break;
    }

    Alert.alert(
      'Confirm Action',
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              const driverId = userDetailsStore.userDetails?.customerId;
              const bookId = order.bookId;
              
              if (!driverId || !bookId) {
                Alert.alert('Error', 'Missing driver ID or book ID');
                return;
              }

              switch (action) {
                case 'pickup':
                  await deliveryDriverStore.startOrder(order._id, driverId, bookId);
                  break;
                case 'deliver':
                  await deliveryDriverStore.completeOrder(order._id, driverId, bookId);
                  break;
                case 'cancel':
                  await deliveryDriverStore.cancelOrder(order._id, driverId, bookId);
                  break;
              }
              
              if (userDetailsStore.userDetails?.customerId) {
                deliveryDriverStore.getOrders(userDetailsStore.userDetails.customerId);
              }
              Alert.alert('Success', 'Order status updated successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to update order status');
            }
          }
        },
      ]
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case '1': return 'Pending';
      case '2': return 'Assigned';
      case '3': return 'Picked Up';
      case '0': return 'Delivered';
      case '-1': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '1': return colors.orange;
      case '2': return colors.blue;
      case '3': return colors.purple;
      case '0': return colors.green;
      case '-1': return colors.red;
      default: return colors.gray;
    }
  };

  return (
    <View style={styles.container}>
      <DeliveryDriverHeader 
        driverName={deliveryDriverStore.profile?.fullName || userDetailsStore.userDetails?.name || 'Driver'}
        totalOrders={deliveryDriverStore.totalOrders}
        activeOrders={deliveryDriverStore.activeOrdersCount}
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({deliveryDriverStore.activeOrdersCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({deliveryDriverStore.completedOrdersCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.ordersContainer}
        refreshControl={
          <RefreshControl refreshing={deliveryDriverStore.refreshing} onRefresh={onRefresh} />
        }
      >
        {deliveryDriverStore.loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : activeTab === 'active' ? (
          deliveryDriverStore.activeOrders.length > 0 ? (
            deliveryDriverStore.activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onAction={handleOrderAction}
                showActions={true}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active orders</Text>
            </View>
          )
        ) : (
          deliveryDriverStore.completedOrders.length > 0 ? (
            deliveryDriverStore.completedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onAction={handleOrderAction}
                showActions={false}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No completed orders</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  activeTabText: {
    color: colors.white,
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
  },
});

export default DeliveryDriverDashboard; 