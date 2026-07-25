import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
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

  const { isLoading } = useGlobalContext();

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAFA" }}>
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  // Always render the Stack — role-based routing is handled in:
  //   sign-in.jsx (on login)
  //   (tabs)/_layout.jsx (safety-net redirect for riders)
  //   (rider)/_layout.jsx (safety-net redirect for non-riders)
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GlobalProvider>
      <RootLayoutInner />
    </GlobalProvider>
  );
}
