import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SalisburyBrandHeader } from "../SalisburyBrandHeader";
import { colors, radii, spacing, typography } from "../../theme";

type FormScreenProps = {
  children: ReactNode;
  description: string;
};

export function FormScreen({ children, description }: FormScreenProps) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          style={styles.safeArea}
        >
          <View style={styles.headerContainer}>
            <SalisburyBrandHeader subtitle="Faculty Planning Workspace" />
            <View style={styles.badgeContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Sarum AI Ready</Text>
            </View>
          </View>

          <View style={styles.titleArea}>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.formCard}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 90, 108, 0.15)",
    borderColor: colors.accentSoft,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentSoft
  },
  statusText: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  titleArea: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500"
  },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.xxxl,
    borderWidth: 1,
    gap: spacing.xl,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1
  }
});
