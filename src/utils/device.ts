import { Capacitor } from '@capacitor/core';

export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
};

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android' || /android/i.test(navigator.userAgent);
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  const maxDimension = Math.max(window.innerWidth, window.innerHeight);
  // Typical tablet: shortest side >= 600px, aspect ratio tablet-like, or width >= 768px
  return minDimension >= 600 && maxDimension >= 960;
};
