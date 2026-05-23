import "dotenv/config";

function normalizeAnthropicApiKey(raw: string | undefined): string {
  const key = (raw ?? "").trim().replace(/^["']|["']$/g, "");

  if (key.startsWith("Sk-ant-")) {
    return `sk-ant-${key.slice("Sk-ant-".length)}`;
  }

  return key;
}

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
      bundler: "metro",
      name: "TeacherForge"
    },
    plugins: ["expo-asset"],
    extra: {
      anthropicApiKey: normalizeAnthropicApiKey(process.env.ANTHROPIC_API_KEY)
    }
  }
};
