import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isPad = width >= 1024;

  return {
    width,
    height,
    isTablet,
    isPad,
    scale: (size: number) => isTablet ? size * 1.3 : size,
    fontSize: (size: number) => isTablet ? size * 1.2 : size,
  };
}; 