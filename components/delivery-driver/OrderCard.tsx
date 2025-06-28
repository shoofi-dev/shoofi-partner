import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StatusBadge from './StatusBadge';
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
}

interface OrderCardProps {
  order: Order;
  onAction: (order: Order, action: string) => void;
  showActions?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAction,
  showActions = true,
}) => {
  const navigation = useNavigation();

  const handleViewDetails = () => {
    navigation.navigate('delivery-driver-order-details' as never, { orderId: order._id } as never);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getActionButtons = () => {
    if (!showActions) return null;

    switch (order.status) {
      case '2': // Assigned
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pickupButton]}
              onPress={() => onAction(order, 'pickup')}
            >
              <Text style={styles.actionButtonText}>Pick Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onAction(order, 'cancel')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      case '3': // Picked Up
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deliverButton]}
              onPress={() => onAction(order, 'deliver')}
            >
              <Text style={styles.actionButtonText}>Deliver</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleViewDetails}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order._id?.slice(-6)}</Text>
          <Text style={styles.orderTime}>
            {formatDate(order.created)} at {formatTime(order.created)}
          </Text>
        </View>
        <StatusBadge
          status={order.status}
          text={getStatusText(order.status)}
          color={getStatusColor(order.status)}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.customerPhone}>{order.customerPhone}</Text>
          <Text style={styles.customerAddress} numberOfLines={2}>
            {order.customerAddress}
          </Text>
        </View>

        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{order.storeName}</Text>
          {order.pickupTime && (
            <Text style={styles.pickupTime}>Pickup: {order.pickupTime}</Text>
          )}
        </View>

        <View style={styles.itemsPreview}>
          <Text style={styles.itemsLabel}>Items:</Text>
          {order.items?.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              • {item.quantity}x {item.name}
            </Text>
          ))}
          {order.items?.length > 2 && (
            <Text style={styles.moreItemsText}>
              +{order.items?.length - 2} more items
            </Text>
          )}
        </View>

        {order.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText} numberOfLines={2}>
              {order.notes}
            </Text>
          </View>
        )}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>₪{order.totalPrice}</Text>
        </View>
      </View>

      {getActionButtons()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: colors.gray,
  },
  content: {
    padding: 16,
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
  storeInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  pickupTime: {
    fontSize: 14,
    color: colors.orange,
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
  },
  notesContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderCard; 