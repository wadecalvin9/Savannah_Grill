import { PaystackProvider } from 'react-native-paystack-webview';
import "../../lib/alertPolyfill";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider";
import "./globals.css";


SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const [fontsLoaded, error] = useFonts({
    "QuickSand-Bold": require("../../assets/fonts/Quicksand-Bold.ttf"),
    "QuickSand-Medium": require("../../assets/fonts/Quicksand-Medium.ttf"),
    "QuickSand-Regular": require("../../assets/fonts/Quicksand-Regular.ttf"),
    "QuickSand-SemiBold": require("../../assets/fonts/Quicksand-SemiBold.ttf"),
    "QuickSand-Light": require("../../assets/fonts/Quicksand-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);



  if (!fontsLoaded && !error) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <PaystackProvider
      publicKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || (() => { throw new Error('Missing EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY') })()}
      currency="KES"                     // important for Kenya
      defaultChannels={['card', 'mobile_money', 'bank']}  // M-Pesa + card + bank
      debug={__DEV__}                    // shows helpful logs in development
    >
      <GlobalProvider>
        <RootLayoutInner />
      </GlobalProvider>

    </PaystackProvider>
    
  );
}
