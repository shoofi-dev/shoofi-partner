import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;

export const normalizeFontSize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleWidth));

export const normalizeSpacing = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleWidth)); // for width, horizontal padding, margins

export const normalizeSpacingVertical = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scaleHeight)); // for height, vertical spacing

export const normalizeWidth = (size: number) => normalizeSpacing(size);
export const normalizeHeight = (size: number) => normalizeSpacingVertical(size);
