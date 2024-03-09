import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.llp.associates.crc',
  appName: 'CRC Associates LLP',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '42203963600-gdvmohrf4jh24vmqtmf3qd6ku97n5l5i.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
