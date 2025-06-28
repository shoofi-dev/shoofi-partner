import React from 'react';
import {
  View,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

type GGlassBGProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blurAmount?: number;
  borderRadius?: number;
};

const GlassBG: React.FC<GGlassBGProps> = ({
  children,
  style,
  blurAmount = 20,
  borderRadius = 0,
}) => {
  const isAndroid = Platform.OS === 'android';
  const isBlurSupported = !isAndroid || Number(Platform.Version) >= 31;

  return (
    <View style={[styles.container, { borderRadius, overflow: 'hidden' }, style]}>
      {isBlurSupported && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="regular"
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.15)"
        />
      )}
      
      {/* Always apply semi-transparent overlay for contrast on white */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0, 0, 0, 0.1)' }, // adjust opacity if needed
        ]}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

export default GlassBG;
