import React from 'react';
import {
  Text as ReactText,
  StyleSheet,
  PixelRatio,
  Dimensions,
  TextStyle,
} from 'react-native';
import { getCurrentLang } from '../../../translations/i18n';
import themeStyle from '../../../styles/theme.style';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = Math.min(SCREEN_WIDTH / 375, 1.2); // cap at 1.2 (or 1.3, tweak as needed)

const normalizeFontSize = (size: number): number => {
  if (typeof size !== 'number') return 14; // fallback
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export type TProps = {
  children: any;
  style?: TextStyle | TextStyle[];
  type?: any;
  numberOfLines?: number;
};

const Text = ({ children, style = {}, type, numberOfLines = null }: TProps) => {
  const flatStyle = StyleSheet.flatten(style) || {};
  const {
    color = themeStyle.TEXT_PRIMARY_COLOR,
    fontFamily = getCurrentLang() === 'ar' ? 'ar-SemiBold' : 'he-SemiBold',
    textAlign = 'right',
    fontSize = themeStyle.FONT_SIZE_SM,
    ...rest
  } = flatStyle;

  const finalStyle: TextStyle = {
    ...rest, // include margins, paddings, etc.
    color,
    fontFamily,
    textAlign,
    direction: 'ltr',
    fontSize: fontSize ? normalizeFontSize(fontSize) : undefined,
  };

  return <ReactText lineBreakMode="tail" numberOfLines={numberOfLines} style={finalStyle}>{children}</ReactText>;
};

export default Text;
