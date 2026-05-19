import { Image, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

const SALISBURY_LOGO_URI = "https://upload.wikimedia.org/wikipedia/en/3/30/Salisbury_School_Crest.png";

type SalisburyBrandHeaderProps = {
  subtitle?: string;
};

export function SalisburyBrandHeader({
  subtitle = "Faculty Portal • TeacherForge"
}: SalisburyBrandHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logoFrame}>
        <Image
          resizeMode="contain"
          source={{ uri: SALISBURY_LOGO_URI }}
          style={styles.logo}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.kicker}>Salisbury School</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    justifyContent: "center",
    gap: 2
  },
  kicker: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  logo: {
    height: 36,
    width: 36
  },
  logoFrame: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.accent,
    borderRadius: radii.md,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    width: 48,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4
  },
  subtitle: {
    color: colors.accentSoft,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  }
});
