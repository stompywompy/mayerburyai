import { useEffect, useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";

import { TeacherFieldGroup } from "../components/forms/FormControls";
import { colors, radii, spacing, typography } from "../theme";
import {
  loadTeacherSettings,
  saveTeacherSettings
} from "../utils/teacherSettings";

export function SettingsScreen() {
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultGradeLevel, setDefaultGradeLevel] = useState("");
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDefaults = async () => {
      const settings = await loadTeacherSettings();

      if (!isMounted) {
        return;
      }

      setDefaultSubject(settings.defaultSubject);
      setDefaultGradeLevel(settings.defaultGradeLevel);
      setDemoModeEnabled(settings.demoModeEnabled);
      setTeacherName(settings.teacherName);
      setSchoolName(settings.schoolName);
      setWelcomeBannerDismissed(settings.welcomeBannerDismissed);
    };

    void loadDefaults();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setStatusMessage("");

    try {
      await saveTeacherSettings({
        defaultGradeLevel,
        defaultSubject,
        demoModeEnabled,
        schoolName,
        teacherName,
        welcomeBannerDismissed
      });
      setStatusMessage("Defaults saved for future form sessions.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save defaults."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Teacher Defaults</Text>
          <Text style={styles.description}>
            Save your usual subject and grade level to prefill future mode forms.
          </Text>
        </View>

        <View style={styles.formCard}>
          <TeacherFieldGroup
            gradeLevel={defaultGradeLevel}
            onChangeGradeLevel={setDefaultGradeLevel}
            onChangeSubject={setDefaultSubject}
            subject={defaultSubject}
          />
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextGroup}>
              <Text style={styles.toggleLabel}>Demo Mode</Text>
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
            accessibilityRole="button"
            disabled={isSaving}
            onPress={handleSave}
            style={(state: any) => [
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
              state.pressed && styles.saveButtonPressed
            ]}
          >
            <Text style={styles.saveLabel}>{isSaving ? "Saving..." : "Save Defaults"}</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl
  },
  description: {
    color: colors.textMuted,
    ...typography.bodySmall
  },
  errorText: {
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.dangerSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodySmall
  },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    justifyContent: "center",
    minHeight: 52,
    width: "100%"
  },
  saveButtonDisabled: {
    opacity: 0.7
  },
  saveButtonPressed: {
    opacity: 0.9
  },
  saveLabel: {
    color: colors.accentContrast,
    ...typography.button
  },
  screen: {
    backgroundColor: colors.surface,
    flex: 1
  },
  statusMessage: {
    color: colors.accent,
    ...typography.bodySmall
  },
  title: {
    color: colors.text,
    ...typography.titleSection
  },
  toggleHint: {
    color: colors.textMuted,
    ...typography.meta
  },
  toggleLabel: {
    color: colors.text,
    ...typography.label
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
  }
});
