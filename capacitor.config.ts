import type { CapacitorConfig } from "@capacitor/android";

const config: CapacitorConfig = {
  appId: "app.lovable.a02e8b8d2be54928a892be4933ee8029",
  appName: "physioapp",
  webDir: "dist",
  server: {
    url: "https://a02e8b8d-2be5-4928-a892-be4933ee8029.lovableproject.com?forceHideBadge=true",
    cleartext: true,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#207090",
      showSpinner: false,
    },
  },
};
export default config;
