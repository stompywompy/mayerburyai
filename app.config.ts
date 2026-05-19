import "dotenv/config";

export default {
  expo: {
    name: "TeacherForge",
    slug: "teacherforge",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#0B1736"
      }
    },
    web: {
      bundler: "metro"
    },
    plugins: ["expo-asset"],
    extra: {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? ""
    }
  }
};
