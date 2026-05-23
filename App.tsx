import "react-native-gesture-handler";

import { Platform } from "react-native";
import { useEffect } from "react";

if (Platform.OS === "web") {
  require("katex/dist/katex.min.css");
}

import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { colors } from "./src/theme";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.accent,
    text: colors.text,
    border: colors.border
  }
};

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    document.title = "TeacherForge | Salisbury School";
    const existingIcon =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]');

    if (existingIcon) {
      existingIcon.href = "/favicon.svg";
      return;
    }

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = "/favicon.svg";
    document.head.appendChild(link);
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
