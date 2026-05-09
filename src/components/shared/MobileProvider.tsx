import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const MobileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const initMobile = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configure Status Bar
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setOverlaysWebView({ overlay: true });
          
          // Hide Splash Screen after app is loaded
          await SplashScreen.hide();
          
          console.log('Mobile platform initialized');
        } catch (error) {
          console.error('Error initializing mobile platform:', error);
        }
      }
    };

    initMobile();
  }, []);

  return <>{children}</>;
};
