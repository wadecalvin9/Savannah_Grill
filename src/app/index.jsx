import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";

export default function Index() {
  const { user, isLoading, isLoggedIn } = useGlobalContext();

  // Wait until we know if the user is logged in
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  // Not logged in → allow browsing the menu
  if (!isLoggedIn || !user) {
    return <Redirect href="/(tabs)" />;
  }

  // Logged in → send them to the correct dashboard
  const role = user.role || "customer";

  if (role === "admin") {
    return <Redirect href="/admin" />;
  }

  if (role === "rider") {
    return <Redirect href="/(rider)/dashboard" />;
  }

  if (role === "staff") {
    return <Redirect href="/(staff)/dashboard" />;
  }

  // Customer
  return <Redirect href="/(tabs)" />;
}