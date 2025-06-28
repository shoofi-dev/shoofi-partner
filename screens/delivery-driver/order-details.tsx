import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { observer } from 'mobx-react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { StoreContext } from '../../stores';
import DeliveryDriverHeader from '../../components/delivery-driver/DeliveryDriverHeader';
import StatusBadge from '../../components/delivery-driver/StatusBadge';
import { colors } from '../../styles/colors';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  extras?: string[];
}

interface Order {
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
  items: OrderItem[];
  notes?: string;
  paymentMethod?: string;
}

const OrderDetailsScreen = observer(() => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: string };
  const { deliveryDriverStore } = useContext(StoreContext);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await deliveryDriverStore.getOrderDetails(orderId);
      setOrder(orderData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    try {
      await deliveryDriverStore.updateOrderStatus(orderId, status);
      fetchOrderDetails();
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleCallCustomer = () => {
    if (order?.customerPhone) {
      Linking.openURL(`tel:${order.customerPhone}`);
    }
  };

  const handleNavigateToCustomer = () => {
    // This would integrate with a mapping service
    Alert.alert('Navigation', 'Opening navigation to customer address...');
  };

  const handleAction = (action: string) => {
    let newStatus = '';
    let confirmMessage = '';

    switch (action) {
      case 'pickup':
        newStatus = '3';
        confirmMessage = 'Confirm that you have picked up this order?';
        break;
      case 'deliver':
        newStatus = '0';
        confirmMessage = 'Confirm that you have delivered this order?';
        break;
      case 'cancel':
        newStatus = '-1';
        confirmMessage = 'Are you sure you want to cancel this order?';
        break;
    }

    Alert.alert(
      'Confirm Action',
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateOrderStatus(newStatus) },
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

  if (loading) {
    return (
      <View style={styles.container}>
        <DeliveryDriverHeader 
          driverName="Driver"
          totalOrders={0}
          activeOrders={0}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <DeliveryDriverHeader 
          driverName="Driver"
          totalOrders={0}
          activeOrders={0}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DeliveryDriverHeader 
        driverName="Driver"
        totalOrders={0}
        activeOrders={0}
      />
      
      <ScrollView style={styles.content}>
        {/* Order Status */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <StatusBadge 
              status={order.status}
              text={getStatusText(order.status)}
              color={getStatusColor(order.status)}
            />
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
            
            <Text style={styles.label}>Phone:</Text>
            <TouchableOpacity onPress={handleCallCustomer}>
              <Text style={[styles.value, styles.phoneNumber]}>{order.customerPhone}</Text>
            </TouchableOpacity>
            
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{order.customerAddress}</Text>
          </View>
        </View>

        {/* Store Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Store:</Text>
            <Text style={styles.value}>{order.storeName}</Text>
            
            {order.pickupTime && (
              <>
                <Text style={styles.label}>Pickup Time:</Text>
                <Text style={styles.value}>{order.pickupTime}</Text>
              </>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.extras && item.extras.length > 0 && (
                    <Text style={styles.itemExtras}>{item.extras.join(', ')}</Text>
                  )}
                </View>
                <View style={styles.itemQuantity}>
                  <Text style={styles.quantityText}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₪{item.price}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>₪{order.totalPrice}</Text>
            </View>
          </View>
        </View>

        {/* Order Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Payment Information */}
        {order.paymentMethod && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Method:</Text>
              <Text style={styles.value}>{order.paymentMethod}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {['2', '3'].includes(order.status) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={handleCallCustomer}
              >
                <Text style={styles.actionButtonText}>Call Customer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.navigateButton]}
                onPress={handleNavigateToCustomer}
              >
                <Text style={styles.actionButtonText}>Navigate</Text>
              </TouchableOpacity>
              
              {order.status === '2' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.pickupButton]}
                  onPress={() => handleAction('pickup')}
                >
                  <Text style={styles.actionButtonText}>Mark as Picked Up</Text>
                </TouchableOpacity>
              )}
              
              {order.status === '3' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deliverButton]}
                  onPress={() => handleAction('deliver')}
                >
                  <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleAction('cancel')}
              >
                <Text style={styles.actionButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: colors.red,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  infoCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  itemsCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  notesCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  phoneNumber: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemExtras: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
  },
  itemQuantity: {
    marginHorizontal: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 60,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.lightGray,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  notesText: {
    fontSize: 16,
    color: colors.text,
    fontStyle: 'italic',
  },
  actionsContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: colors.green,
  },
  navigateButton: {
    backgroundColor: colors.blue,
  },
  pickupButton: {
    backgroundColor: colors.orange,
  },
  deliverButton: {
    backgroundColor: colors.green,
  },
  cancelButton: {
    backgroundColor: colors.red,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen; 