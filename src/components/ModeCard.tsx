import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

type ModeCardProps = {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  title: string;
};

export function ModeCard({ description, icon, onPress, title }: ModeCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons color={colors.accent} name={icon} size={24} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    flexDirection: "row",
    gap: spacing.lg,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }]
  },
  copy: {
    flex: 1,
    gap: 6
  },
  description: {
    color: colors.textMuted,
    ...typography.bodySmall
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(143, 29, 44, 0.18)",
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.md,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  title: {
    color: colors.text,
    ...typography.titleCard
  }
});
