import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'grocerylist.scotex.tech',
  appName: 'Grocery List',
  webDir: 'dist/grocery-list-client/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
