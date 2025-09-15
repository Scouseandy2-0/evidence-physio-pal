import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a02e8b8d2be54928a892be4933ee8029',
  appName: 'evidence-physio-pal',
  webDir: 'dist',
  server: {
    url: 'https://a02e8b8d-2be5-4928-a892-be4933ee8029.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;