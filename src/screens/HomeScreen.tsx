import { useEffect, useRef, useState } from "react";

import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModeCard } from "../components/ModeCard";
import { SalisburyBrandHeader } from "../components/SalisburyBrandHeader";
import { modeCards } from "../data/modes";
import { colors, motion, radii, spacing, typography } from "../theme";
import type { SavedOutputEntry } from "../types/history";
import { RootStackParamList } from "../types/navigation";
import {
  formatSavedOutputDate,
  getSavedOutputEntries
} from "../utils/outputHistory";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type HomeTab = "history" | "modes";

export function HomeScreen({ navigation }: Props) {
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<HomeTab>("modes");
  const [historyEntries, setHistoryEntries] = useState<SavedOutputEntry[]>([]);
  const cardAnimations = useRef(
    modeCards.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      const nextEntries = await getSavedOutputEntries();

      if (isMounted) {
        setHistoryEntries(nextEntries);
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused || activeTab !== "modes") {
      return;
    }

    cardAnimations.forEach((animation) => animation.setValue(0));

    const staggeredAnimation = Animated.stagger(
      motion.cardStagger,
      cardAnimations.map((animation) =>
        Animated.timing(animation, {
          duration: motion.cardDuration,
          toValue: 1,
          useNativeDriver: true
        })
      )
    );

    staggeredAnimation.start();

    return () => {
      staggeredAnimation.stop();
    };
  }, [activeTab, cardAnimations, isFocused]);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topNav}>
          <SalisburyBrandHeader subtitle="Faculty Portal & AI Toolkit" />
          <View style={styles.navActions}>
            <View style={styles.portalBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.portalBadgeText}>Faculty Active</Text>
            </View>
            <Pressable
              accessibilityLabel="Open settings"
              accessibilityRole="button"
              onPress={() => navigation.navigate("Settings")}
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.settingsButtonPressed
              ]}
            >
              <Ionicons color={colors.white} name="settings-outline" size={20} />
            </Pressable>
          </View>
        </View>

        <View style={styles.welcomeBanner}>
          <Text style={styles.eyebrow}>Crimson & Black Standards</Text>
          <Text style={styles.title}>Salisbury School Classroom Forge</Text>
          <Text style={styles.subtitle}>
            Select a specialized generation module below to create structured, high-quality assignments, practice tests, and curriculum resources aligned with Salisbury academic excellence.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons color={colors.accentSoft} name="shield-checkmark" size={16} />
              <Text style={styles.statChipText}>Tradition & Excellence</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons color={colors.accentSoft} name="school" size={16} />
              <Text style={styles.statChipText}>Project-Based Learning</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons color={colors.accentSoft} name="flash" size={16} />
              <Text style={styles.statChipText}>Sarum AI Powered</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("modes")}
            style={[
              styles.tabButton,
              activeTab === "modes" && styles.tabButtonActive
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === "modes" && styles.tabLabelActive
              ]}
            >
              Active Generation Modules
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("history")}
            style={[
              styles.tabButton,
              activeTab === "history" && styles.tabButtonActive
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === "history" && styles.tabLabelActive
              ]}
            >
              Faculty Output History
            </Text>
          </Pressable>
        </View>

        {activeTab === "modes" ? (
          <View style={styles.cardList}>
            {modeCards.map((card, index) => {
              const animatedStyle = {
                opacity: cardAnimations[index],
                transform: [
                  {
                    translateY: cardAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [motion.cardOffset, 0]
                    })
                  }
                ]
              };

              return (
                <Animated.View key={card.route} style={animatedStyle}>
                  <ModeCard
                    description={card.description}
                    icon={card.icon}
                    onPress={() => navigation.navigate(card.route)}
                    title={card.title}
                  />
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <View style={styles.cardList}>
            {historyEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No saved outputs yet</Text>
                <Text style={styles.emptyText}>
                  Generate content in any mode and the latest five outputs will
                  appear here.
                </Text>
              </View>
            ) : (
              historyEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  onPress={() => navigation.navigate("HistoryDetail", { entry })}
                  style={({ pressed }) => [
                    styles.historyCard,
                    pressed && styles.historyCardPressed
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyMode}>{entry.mode}</Text>
                    <Text style={styles.historyDate}>
                      {formatSavedOutputDate(entry.createdAt)}
                    </Text>
                  </View>
                  <Text numberOfLines={3} style={styles.historyPreview}>
                    {entry.text}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardList: {
    gap: spacing.md
  },
  content: {
    gap: spacing.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl
  },
  topNav: {
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
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  portalBadge: {
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
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentSoft
  },
  portalBadgeText: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  welcomeBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.xxxl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 6
  },
  statChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.xxl,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xl
  },
  emptyText: {
    color: colors.textMuted,
    ...typography.bodySmall
  },
  emptyTitle: {
    color: colors.white,
    ...typography.titleSection
  },
  eyebrow: {
    color: colors.accentSoft,
    ...typography.eyebrow,
    textTransform: "uppercase"
  },
  historyCard: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderRadius: radii.xxl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: 18
  },
  historyCardPressed: {
    opacity: 0.92
  },
  historyDate: {
    color: colors.textMuted,
    ...typography.meta
  },
  historyHeader: {
    gap: 6
  },
  historyMode: {
    color: colors.white,
    ...typography.titleCard
  },
  historyPreview: {
    color: colors.textMuted,
    ...typography.bodySmall
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  settingsButtonPressed: {
    opacity: 0.9
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.body,
    maxWidth: 560
  },
  tabButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  tabLabel: {
    color: colors.textMuted,
    ...typography.labelSmall
  },
  tabLabelActive: {
    color: colors.accentContrast
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  title: {
    color: colors.white,
    ...typography.titleHero
  }
});
