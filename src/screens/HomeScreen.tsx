import {
  type ComponentType,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TeacherForgeLogo } from "../components/TeacherForgeLogo";
import { previewDisplayLine } from "../utils/sanitizeDisplayText";
import {
  AbsenceClassworkGeneratorScreen,
  AssignmentBuilderScreen,
  FeedbackDraftsScreen,
  GradeCurveCalculatorScreen,
  PracticeTestBuilderScreen,
  ProblemSetGeneratorScreen,
  StudyGuideGeneratorScreen,
  TestCorrectionFormGeneratorScreen
} from "./forms";
import { colors, radii, spacing, typography } from "../theme";
import type { SavedOutputEntry } from "../types/history";
import { RootStackParamList } from "../types/navigation";
import {
  formatSavedOutputDate,
  getSavedOutputEntries
} from "../utils/outputHistory";
import {
  GRADE_LEVEL_OPTIONS,
  SUBJECT_OPTIONS,
  loadTeacherSettings,
  saveTeacherSettings
} from "../utils/teacherSettings";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type ModeKey = keyof Omit<
  RootStackParamList,
  "HistoryDetail" | "Home" | "Settings"
>;

type ModeItem = {
  icon: keyof typeof Ionicons.glyphMap;
  id: ModeKey;
  label: string;
  modeName: SavedOutputEntry["mode"];
};

type ModeSection = {
  items: ModeItem[];
  title: "Create" | "Support";
};

type ModeScreenProps = {
  demoModeEnabled?: boolean;
  selectedHistoryEntry?: SavedOutputEntry | null;
};

const sections: ModeSection[] = [
  {
    title: "Create",
    items: [
      {
        id: "AssignmentBuilder",
        label: "Assignment Builder",
        modeName: "Assignment Builder",
        icon: "document-text-outline"
      },
      {
        id: "ProblemSetGenerator",
        label: "Problem Set",
        modeName: "Problem Set",
        icon: "grid-outline"
      },
      {
        id: "PracticeTestBuilder",
        label: "Practice Test",
        modeName: "Practice Test",
        icon: "clipboard-outline"
      },
      {
        id: "AbsenceClassworkGenerator",
        label: "Absence Classwork",
        modeName: "Absence Classwork Generator",
        icon: "calendar-outline"
      }
    ]
  },
  {
    title: "Support",
    items: [
      {
        id: "StudyGuideGenerator",
        label: "Study Guide",
        modeName: "Study Guide",
        icon: "book-outline"
      },
      {
        id: "FeedbackDrafts",
        label: "Feedback Drafts",
        modeName: "Feedback Drafts",
        icon: "chatbubble-ellipses-outline"
      },
      {
        id: "TestCorrectionFormGenerator",
        label: "Test Correction",
        modeName: "Test Correction Form Generator",
        icon: "create-outline"
      },
      {
        id: "GradeCurveCalculator",
        label: "Grade Curve",
        modeName: "Grade Curve Calculator",
        icon: "stats-chart-outline"
      }
    ]
  }
];

const modeComponents: Record<ModeKey, ComponentType<ModeScreenProps>> = {
  AssignmentBuilder: AssignmentBuilderScreen,
  ProblemSetGenerator: ProblemSetGeneratorScreen,
  PracticeTestBuilder: PracticeTestBuilderScreen,
  AbsenceClassworkGenerator: AbsenceClassworkGeneratorScreen,
  StudyGuideGenerator: StudyGuideGeneratorScreen,
  FeedbackDrafts: FeedbackDraftsScreen,
  TestCorrectionFormGenerator: TestCorrectionFormGeneratorScreen,
  GradeCurveCalculator: GradeCurveCalculatorScreen
};

const modeLabels = sections
  .flatMap((section) => section.items)
  .reduce<Record<ModeKey, string>>((accumulator, item) => {
    accumulator[item.id] = item.label;
    return accumulator;
  }, {} as Record<ModeKey, string>);

const modeKeyByModeName = sections
  .flatMap((section) => section.items)
  .reduce<Record<SavedOutputEntry["mode"], ModeKey>>((accumulator, item) => {
    accumulator[item.modeName] = item.id;
    return accumulator;
  }, {} as Record<SavedOutputEntry["mode"], ModeKey>);

type DropdownFieldProps = {
  label: string;
  onSelect: (value: string) => void;
  options: readonly string[];
  value: string;
};

function DropdownField({ label, onSelect, options, value }: DropdownFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={(state: any) => [
          styles.dropdownTrigger,
          state.hovered && styles.dropdownTriggerHover,
          state.pressed && styles.dropdownTriggerPressed
        ]}
      >
        <Text style={styles.dropdownValue}>{value || "Select an option"}</Text>
        <Ionicons color={colors.textMuted} name={open ? "chevron-up" : "chevron-down"} size={16} />
      </Pressable>
      {open ? (
        <View style={styles.dropdownMenu}>
          <ScrollView nestedScrollEnabled style={styles.dropdownMenuScroll}>
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                style={(state: any) => [
                  styles.dropdownOption,
                  state.hovered && styles.dropdownOptionHover,
                  option === value && styles.dropdownOptionActive,
                  state.pressed && styles.dropdownOptionPressed
                ]}
              >
                <Text style={styles.dropdownOptionLabel}>{option}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const [selectedMode, setSelectedMode] = useState<ModeKey>("AssignmentBuilder");
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<SavedOutputEntry | null>(
    null
  );
  const [historyEntries, setHistoryEntries] = useState<SavedOutputEntry[]>([]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultGradeLevel, setDefaultGradeLevel] = useState("");
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [welcomeBannerVisible, setWelcomeBannerVisible] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const gradientOpacity = useRef(new Animated.Value(0)).current;

  const sidebarWidth = width >= 1200 ? 292 : width >= 900 ? 252 : 220;
  const ActiveModeScreen = useMemo(() => modeComponents[selectedMode], [selectedMode]);
  const panelWidth = Math.min(460, Math.max(320, width * 0.42));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(gradientOpacity, {
          toValue: 1,
          duration: 14000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(gradientOpacity, {
          toValue: 0,
          duration: 14000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true
        })
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [gradientOpacity]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const [settings, entries] = await Promise.all([
        loadTeacherSettings(),
        getSavedOutputEntries()
      ]);

      if (!isMounted) {
        return;
      }

      setDefaultSubject(settings.defaultSubject);
      setDefaultGradeLevel(settings.defaultGradeLevel);
      setDemoModeEnabled(settings.demoModeEnabled);
      setWelcomeBannerVisible(!settings.welcomeBannerDismissed);
      setTeacherName(settings.teacherName);
      setSchoolName(settings.schoolName);
      setHistoryEntries(entries);
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSettings = async () => {
    await saveTeacherSettings({
      defaultGradeLevel,
      defaultSubject,
      demoModeEnabled,
      schoolName,
      teacherName,
      welcomeBannerDismissed: !welcomeBannerVisible
    });
    setSaveStatus("Settings saved");

    setTimeout(() => setSaveStatus(""), 1200);
  };

  const dismissWelcomeBanner = async () => {
    setWelcomeBannerVisible(false);
    await saveTeacherSettings({
      welcomeBannerDismissed: true
    });
  };

  const handleSelectHistory = (entry: SavedOutputEntry) => {
    const modeKey = modeKeyByModeName[entry.mode];

    if (modeKey) {
      setSelectedMode(modeKey);
    }

    setSelectedHistoryEntry(entry);
    setHistoryOpen(false);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={[styles.sidebar, { width: sidebarWidth }]}>
          <View
            style={[
              styles.sidebarGradientBase,
              Platform.OS === "web"
                ? ({
                    backgroundImage:
                      "linear-gradient(180deg, #334155 0%, #0f172a 60%, #1e3a8a 100%)"
                  } as any)
                : null
            ]}
          />
          <Animated.View
            style={[
              styles.sidebarGradientShift,
              { opacity: gradientOpacity },
              Platform.OS === "web"
                ? ({
                    backgroundImage:
                      "linear-gradient(140deg, #1e293b 0%, #1d4ed8 52%, #0f172a 100%)"
                  } as any)
                : null
            ]}
          />

          <View style={styles.sidebarContent}>
            <View style={styles.brandBlock}>
              <View style={styles.brandRow}>
                <View style={styles.logoTile}>
                  <TeacherForgeLogo color={colors.accent} size={38} />
                </View>
                <Text style={styles.brandTitle}>TeacherForge</Text>
              </View>
              <Text style={styles.tagline}>Your AI teaching assistant</Text>
            </View>

            <View style={styles.navWrap}>
              {sections.map((section) => (
                <View key={section.title} style={styles.sectionGroup}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.sectionItems}>
                    {section.items.map((item) => {
                      const active = item.id === selectedMode;

                      return (
                        <Pressable
                          key={item.id}
                          accessibilityRole="button"
                          onPress={() => {
                            setSelectedMode(item.id);
                            setSelectedHistoryEntry(null);
                          }}
                          style={(state: any) => [
                            styles.navItem,
                            state.hovered && styles.navItemHover,
                            active && styles.navItemActive,
                            state.pressed && styles.navItemPressed
                          ]}
                        >
                          <Ionicons
                            color={active ? colors.accent : "#cbd5e1"}
                            name={item.icon}
                            size={18}
                          />
                          <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.mainPane}>
          {welcomeBannerVisible ? (
            <View style={styles.welcomeBanner}>
              <Text style={styles.welcomeBannerText}>
                Welcome to TeacherForge — AI-powered tools built for Salisbury School teachers
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void dismissWelcomeBanner()}
                style={(state: any) => [
                  styles.welcomeDismissButton,
                  state.hovered && styles.welcomeDismissButtonHover,
                  state.pressed && styles.welcomeDismissButtonPressed
                ]}
              >
                <Text style={styles.welcomeDismissLabel}>Dismiss</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={styles.mainHeader}>
            <Text style={styles.mainTitle}>{modeLabels[selectedMode]}</Text>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setHistoryOpen(true)}
                style={(state: any) => [
                  styles.headerAction,
                  state.hovered && styles.headerActionHover,
                  state.pressed && styles.headerActionPressed
                ]}
              >
                <Ionicons color={colors.textMuted} name="time-outline" size={19} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSettingsOpen(true)}
                style={(state: any) => [
                  styles.headerAction,
                  state.hovered && styles.headerActionHover,
                  state.pressed && styles.headerActionPressed
                ]}
              >
                <Ionicons color={colors.textMuted} name="settings-outline" size={20} />
              </Pressable>
            </View>
          </View>

          <View style={styles.modeViewport}>
            <ActiveModeScreen
              demoModeEnabled={demoModeEnabled}
              selectedHistoryEntry={selectedHistoryEntry}
            />
          </View>
        </View>
      </View>

      {settingsOpen || historyOpen ? (
        <Pressable
          onPress={() => {
            setSettingsOpen(false);
            setHistoryOpen(false);
          }}
          style={styles.backdrop}
        />
      ) : null}

      {settingsOpen ? (
        <View style={[styles.slidePanel, { width: panelWidth }]}> 
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Settings</Text>
            <Pressable onPress={() => setSettingsOpen(false)} style={styles.closeBtn}>
              <Ionicons color={colors.textMuted} name="close" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.panelContent}>
            <DropdownField
              label="Default Subject"
              onSelect={setDefaultSubject}
              options={SUBJECT_OPTIONS}
              value={defaultSubject}
            />
            <DropdownField
              label="Default Grade Level"
              onSelect={setDefaultGradeLevel}
              options={GRADE_LEVEL_OPTIONS}
              value={defaultGradeLevel}
            />
            <View style={styles.fieldGroup}>
              <Text style={styles.dropdownLabel}>Teacher Name</Text>
              <TextInput
                onChangeText={setTeacherName}
                placeholder="e.g. Ms. Avery"
                placeholderTextColor={colors.textMuted}
                style={styles.textField}
                value={teacherName}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.dropdownLabel}>School Name</Text>
              <TextInput
                onChangeText={setSchoolName}
                placeholder="e.g. Salisbury School"
                placeholderTextColor={colors.textMuted}
                style={styles.textField}
                value={schoolName}
              />
            </View>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextGroup}>
                <Text style={styles.dropdownLabel}>Demo Mode</Text>
                <Text style={styles.toggleHint}>
                  Prefill all 8 mode forms with Salisbury School sample data.
                </Text>
              </View>
              <Switch
                onValueChange={setDemoModeEnabled}
                trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
                value={demoModeEnabled}
              />
            </View>

            <Pressable
              onPress={() => void saveSettings()}
              style={(state: any) => [
                styles.saveBtn,
                state.hovered && styles.saveBtnHover,
                state.pressed && styles.saveBtnPressed
              ]}
            >
              <Text style={styles.saveBtnLabel}>Save</Text>
            </Pressable>
            {saveStatus ? <Text style={styles.saveStatus}>{saveStatus}</Text> : null}
          </ScrollView>
        </View>
      ) : null}

      {historyOpen ? (
        <View style={[styles.slidePanel, { width: panelWidth }]}> 
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>History</Text>
            <Pressable onPress={() => setHistoryOpen(false)} style={styles.closeBtn}>
              <Ionicons color={colors.textMuted} name="close" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.panelContent}>
            {historyEntries.length === 0 ? (
              <Text style={styles.emptyHistory}>No saved outputs yet.</Text>
            ) : (
              historyEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => handleSelectHistory(entry)}
                  style={(state: any) => [
                    styles.historyCard,
                    state.hovered && styles.historyCardHover,
                    state.pressed && styles.historyCardPressed
                  ]}
                >
                  <Text style={styles.historyMode}>{entry.mode}</Text>
                  <Text style={styles.historyMeta}>
                    {(entry.inputs?.Subject as string | undefined) || "Subject not set"} · {formatSavedOutputDate(entry.createdAt)}
                  </Text>
                  <Text numberOfLines={2} style={styles.historyPreview}>
                    {previewDisplayLine(entry.text)}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20
  },
  brandBlock: {
    borderBottomColor: "rgba(148, 163, 184, 0.22)",
    borderBottomWidth: 1,
    gap: spacing.sm,
    paddingBottom: spacing.lg
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  brandTitle: {
    color: colors.white,
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 26,
    fontWeight: "700"
  },
  closeBtn: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  dropdownLabel: {
    color: colors.text,
    ...typography.labelSmall
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 6,
    maxHeight: 180
  },
  dropdownMenuScroll: {
    maxHeight: 180
  },
  dropdownOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  dropdownOptionActive: {
    backgroundColor: "#eff6ff"
  },
  dropdownOptionHover: {
    backgroundColor: colors.surfaceAlt
  },
  dropdownOptionLabel: {
    color: colors.text,
    ...typography.bodySmall
  },
  dropdownOptionPressed: {
    opacity: 0.85
  },
  dropdownTrigger: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  dropdownTriggerHover: {
    borderColor: colors.borderStrong
  },
  dropdownTriggerPressed: {
    opacity: 0.9
  },
  dropdownValue: {
    color: colors.text,
    ...typography.bodySmall
  },
  dropdownWrap: {
    gap: 6,
    zIndex: 10
  },
  emptyHistory: {
    color: colors.textMuted,
    ...typography.bodySmall
  },
  fieldGroup: {
    gap: 6
  },
  headerAction: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  headerActionHover: {
    backgroundColor: colors.surfaceAlt
  },
  headerActionPressed: {
    opacity: 0.85
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 6,
    padding: spacing.md
  },
  historyCardHover: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt
  },
  historyCardPressed: {
    opacity: 0.9
  },
  historyMeta: {
    color: colors.textMuted,
    ...typography.meta
  },
  historyMode: {
    color: colors.text,
    ...typography.labelSmall
  },
  historyPreview: {
    color: colors.text,
    ...typography.bodySmall
  },
  logoTile: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: radii.lg,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  mainHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 74,
    paddingHorizontal: spacing.xl
  },
  mainPane: {
    backgroundColor: colors.surface,
    flex: 1
  },
  mainTitle: {
    color: colors.text,
    ...typography.titleSection,
    fontSize: 22,
    fontWeight: "700"
  },
  modeViewport: {
    backgroundColor: colors.surface,
    flex: 1
  },
  navItem: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  navItemActive: {
    backgroundColor: "#dbeafe"
  },
  navItemHover: {
    backgroundColor: "rgba(219, 234, 254, 0.22)"
  },
  navItemPressed: {
    opacity: 0.88
  },
  navLabel: {
    color: "#cbd5e1",
    flex: 1,
    ...typography.bodySmall,
    fontWeight: "600",
    lineHeight: 20
  },
  navLabelActive: {
    color: colors.accent
  },
  navWrap: {
    flex: 1,
    gap: spacing.xl,
    paddingTop: spacing.lg
  },
  panelContent: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  panelHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  panelTitle: {
    color: colors.text,
    ...typography.titleSection
  },
  safeArea: {
    backgroundColor: colors.surface,
    flex: 1
  },
  saveBtn: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    justifyContent: "center",
    minHeight: 46
  },
  saveBtnHover: {
    backgroundColor: "#2563eb"
  },
  saveBtnLabel: {
    color: colors.accentContrast,
    ...typography.button
  },
  saveBtnPressed: {
    opacity: 0.9
  },
  saveStatus: {
    color: colors.accent,
    ...typography.meta
  },
  sectionGroup: {
    gap: spacing.xs
  },
  sectionItems: {
    gap: 4
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase"
  },
  shell: {
    backgroundColor: colors.surface,
    flex: 1,
    flexDirection: "row"
  },
  sidebar: {
    backgroundColor: colors.navy,
    gap: spacing.lg,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
    position: "relative"
  },
  sidebarContent: {
    flex: 1,
    gap: spacing.lg,
    position: "relative",
    zIndex: 2
  },
  sidebarGradientBase: {
    backgroundColor: "#1e293b",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 0
  },
  sidebarGradientShift: {
    backgroundColor: "#1d4ed8",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1
  },
  slidePanel: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 30
  },
  tagline: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18
  },
  toggleHint: {
    color: colors.textMuted,
    ...typography.meta
  },
  toggleRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  toggleTextGroup: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.md
  },
  textField: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall
  },
  welcomeBanner: {
    alignItems: "center",
    backgroundColor: "#ecfeff",
    borderBottomColor: "#bae6fd",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md
  },
  welcomeBannerText: {
    color: "#0f172a",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  welcomeDismissButton: {
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: spacing.md
  },
  welcomeDismissButtonHover: {
    backgroundColor: "#bfdbfe"
  },
  welcomeDismissButtonPressed: {
    opacity: 0.9
  },
  welcomeDismissLabel: {
    color: "#1e3a8a",
    ...typography.labelSmall
  }
});
