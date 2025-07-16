import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '../icon';
import themeStyle from '../../styles/theme.style';

interface CouponIconProps {
  icon: 'discount' | 'gift' | 'star' | 'heart' | 'fire';
  size?: number;
  color?: string;
}

const iconMap = {
  discount: 'tag',
  gift: 'gift',
  star: 'star',
  heart: 'heart',
  fire: 'flame',
};

const CouponIcon: React.FC<CouponIconProps> = ({ 
  icon, 
  size = 20, 
  color = themeStyle.PRIMARY_COLOR 
}) => {
  const iconName = iconMap[icon];

  return (
    <View style={styles.container}>
      <Icon 
        icon={iconName} 
        size={size} 
        color={color} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CouponIcon; 