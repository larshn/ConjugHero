import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// PWA setup for web
if (Platform.OS === 'web') {
  // Add manifest link to head
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = '/manifest.json';
  document.head.appendChild(manifestLink);

  // Add theme-color meta tag
  const themeColor = document.createElement('meta');
  themeColor.name = 'theme-color';
  themeColor.content = '#3B82F6';
  document.head.appendChild(themeColor);

  // Add apple-touch-icon for iOS
  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = '/assets/icon-192.png';
  document.head.appendChild(appleIcon);

  // Add apple-mobile-web-app-capable for iOS
  const appleMeta = document.createElement('meta');
  appleMeta.name = 'apple-mobile-web-app-capable';
  appleMeta.content = 'yes';
  document.head.appendChild(appleMeta);

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('ConjugHero SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('ConjugHero SW registration failed:', error);
        });
    });
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
