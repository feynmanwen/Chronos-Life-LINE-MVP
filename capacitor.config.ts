import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chronos.life',
  appName: 'Chronos Life',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#020617'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617'
    }
  }
};

export default config;
