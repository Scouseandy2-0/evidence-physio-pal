// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a02e8b8d2be54928a892be4933ee8029',
  appName: 'evidence-physio-pal',
  webDir: 'dist',
  // Important: do NOT set server.url if you want local files.
  server: {
    // Keep a valid scheme for Android while using local assets
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#207090',
      showSpinner: false
    }
  }
};

export default config;
