import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a02e8b8d2be54928a892be4933ee8029',
  appName: 'evidence-physio-pal',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#207090',
      showSpinner: false
    }
  }
};

export default config;