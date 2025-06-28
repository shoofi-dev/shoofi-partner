import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../../styles/colors';

interface StatusBadgeProps {
  status: string;
  text: string;
  color: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  color,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
  },
});

export default StatusBadge; 