import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';

export const initAndroidNativeFeatures = (options?: {
  onBackButton?: () => boolean; // return true if handled, false to allow default exit
}) => {
  if (!Capacitor.isNativePlatform()) return;

  // 1. Android Status Bar styling
  if (Capacitor.isPluginAvailable('StatusBar')) {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#020617' }).catch(() => {});
  }

  // 2. Android Hardware Back Button
  if (Capacitor.isPluginAvailable('App')) {
    CapApp.removeAllListeners().then(() => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (options?.onBackButton && options.onBackButton()) {
          // Handled by app (e.g. closed modal or went back to dashboard)
          return;
        }

        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.minimizeApp().catch(() => {});
        }
      });
    }).catch(() => {});
  }
};
