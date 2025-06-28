import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../styles/colors';

interface DeliveryDriverHeaderProps {
  driverName: string;
  totalOrders: number;
  activeOrders: number;
}

const DeliveryDriverHeader: React.FC<DeliveryDriverHeaderProps> = ({
  driverName,
  totalOrders,
  activeOrders,
}) => {
  const navigation = useNavigation();

  const handleProfilePress = () => {
    navigation.navigate('delivery-driver-profile' as never);
  };

  const handleNotificationsPress = () => {
    navigation.navigate('delivery-driver-notifications' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>Hello, {driverName}</Text>
          <Text style={styles.subtitle}>Delivery Driver</Text>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationsPress}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeOrders}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationIcon: {
    fontSize: 18,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: 16,
  },
});

export default DeliveryDriverHeader; 