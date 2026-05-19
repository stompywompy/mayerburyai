import { useEffect, useState } from "react";

import { StyleSheet, Text } from "react-native";

import {
  GenerateButton,
  InlineError,
  TeacherFieldGroup
} from "../components/forms/FormControls";
import { FormScreen } from "../components/forms/FormScreen";
import { colors, spacing, typography } from "../theme";
import {
  loadTeacherSettings,
  saveTeacherSettings
} from "../utils/teacherSettings";

export function SettingsScreen() {
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultGradeLevel, setDefaultGradeLevel] = useState("");
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
        defaultSubject
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
    <FormScreen description="Save your most common subject and grade level so new forms start with your usual classroom defaults.">
      <TeacherFieldGroup
        gradeLevel={defaultGradeLevel}
        onChangeGradeLevel={setDefaultGradeLevel}
        onChangeSubject={setDefaultSubject}
        subject={defaultSubject}
      />
      <GenerateButton
        label="Save Defaults"
        loading={isSaving}
        loadingLabel="Saving..."
        onPress={handleSave}
      />
      <InlineError message={error} />
      {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  statusMessage: {
    color: colors.accentSoft,
    ...typography.bodySmall,
    marginTop: spacing.xs
  }
});
