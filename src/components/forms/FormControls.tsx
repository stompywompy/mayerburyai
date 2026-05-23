import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { DocumentRenderer } from "../DocumentRenderer";
import { colors, radii, spacing, typography } from "../../theme";
import type { GenerationMode } from "../../utils/generateContent";
import { formatSavedOutputDate } from "../../utils/outputHistory";
import { triggerPrint } from "../../utils/printDocument";
import { loadTeacherSettings } from "../../utils/teacherSettings";
import { SUBJECT_OPTIONS } from "../../utils/teacherSettings";

type FormFieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  helperText?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type SegmentedSelectorProps = {
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
};

type CheckboxOption = {
  label: string;
  value: string;
};

type CheckboxGroupProps = {
  label: string;
  onToggle: (value: string) => void;
  options: CheckboxOption[];
  values: string[];
};

type GenerateButtonProps = {
  disabled?: boolean;
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
  onPress: () => void;
};

export function FormField({
  autoCapitalize = "sentences",
  helperText,
  keyboardType = "default",
  label,
  multiline = false,
  onChangeText,
  placeholder,
  value
}: FormFieldProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        style={[styles.input, multiline && styles.inputMultiline]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

export function SegmentedSelector({
  label,
  onChange,
  options,
  value
}: SegmentedSelectorProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => onChange(option.value)}
              style={(state: any) => [
                styles.segment,
                state.hovered && styles.segmentHover,
                selected && styles.segmentSelected
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  selected && styles.segmentLabelSelected
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CheckboxGroup({
  label,
  onToggle,
  options,
  values
}: CheckboxGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.checkboxWrap}>
        {options.map((option) => {
          const selected = values.includes(option.value);

          return (
            <Pressable
              key={option.value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => onToggle(option.value)}
              style={(state: any) => [
                styles.checkbox,
                state.hovered && styles.checkboxHover,
                selected && styles.checkboxSelected
              ]}
            >
              <View
                style={[styles.checkboxMark, selected && styles.checkboxMarkOn]}
              />
              <Text
                style={[
                  styles.checkboxLabel,
                  selected && styles.checkboxLabelSelected
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function GenerateButton({
  disabled = false,
  label = "Generate",
  loading = false,
  loadingLabel = "Generating...",
  onPress
}: GenerateButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={(state: any) => [
        styles.generateButton,
        (disabled || loading) && styles.generateButtonDisabled,
        state.hovered && styles.generateButtonHover,
        state.pressed && styles.generateButtonPressed
      ]}
    >
      <View style={styles.generateContent}>
        {loading ? (
          <ActivityIndicator color={colors.background} size="small" />
        ) : null}
        <Text style={styles.generateLabel}>
          {loading ? loadingLabel : label}
        </Text>
      </View>
    </Pressable>
  );
}

type SubjectChipRowProps = {
  onSelect: (subject: string) => void;
  value: string;
};

export function SubjectChipRow({ onSelect, value }: SubjectChipRowProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>Quick Subject Fill</Text>
      <ScrollView
        horizontal
        contentContainerStyle={styles.subjectChipRow}
        showsHorizontalScrollIndicator={false}
      >
        {SUBJECT_OPTIONS.map((subjectOption) => {
          const selected = subjectOption === value;

          return (
            <Pressable
              key={subjectOption}
              accessibilityRole="button"
              onPress={() => onSelect(subjectOption)}
              style={(state: any) => [
                styles.subjectChip,
                state.hovered && styles.subjectChipHover,
                selected && styles.subjectChipSelected
              ]}
            >
              <Text
                style={[
                  styles.subjectChipLabel,
                  selected && styles.subjectChipLabelSelected
                ]}
              >
                {subjectOption}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

type TeacherFieldGroupProps = {
  gradeLevel: string;
  onChangeGradeLevel: (value: string) => void;
  onChangeSubject: (value: string) => void;
  subject: string;
};

export function TeacherFieldGroup({
  gradeLevel,
  onChangeGradeLevel,
  onChangeSubject,
  subject
}: TeacherFieldGroupProps) {
  return (
    <>
      <SubjectChipRow onSelect={onChangeSubject} value={subject} />
      <FormField
        autoCapitalize="words"
        label="Subject"
        onChangeText={onChangeSubject}
        placeholder="Ex: Algebra I"
        value={subject}
      />
      <FormField
        autoCapitalize="words"
        label="Grade Level"
        onChangeText={onChangeGradeLevel}
        placeholder="Ex: 8th Grade"
        value={gradeLevel}
      />
    </>
  );
}

type InlineErrorProps = {
  message: string;
};

export function InlineError({ message }: InlineErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

type ResultCardProps = {
  createdAt?: string;
  expandContent?: boolean;
  mode?: GenerationMode;
  onRegenerate?: () => void;
  text: string;
};

function sanitizeFilenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function shareOutputAsTextFile(
  mode: GenerationMode,
  text: string,
  createdAt?: string
) {
  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (!isSharingAvailable) {
    return;
  }

  const baseDirectory =
    FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!baseDirectory) {
    return;
  }

  const timestamp = (createdAt ?? new Date().toISOString()).replace(
    /[:.]/g,
    "-"
  );
  const filename = `${sanitizeFilenamePart(mode)}-${timestamp}.txt`;
  const fileUri = `${baseDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, text, {
    encoding: FileSystem.EncodingType.UTF8
  });

  await Sharing.shareAsync(fileUri, {
    dialogTitle: `${mode} Output`,
    mimeType: "text/plain",
    UTI: "public.plain-text"
  });
}

export function ResultCard({
  createdAt,
  expandContent = false,
  mode,
  onRegenerate,
  text
}: ResultCardProps) {
  const [settingsTeacherName, setSettingsTeacherName] = useState("");
  const [settingsSubject, setSettingsSubject] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const hydrateSettings = async () => {
      const settings = await loadTeacherSettings();
      if (!mounted) {
        return;
      }
      setSettingsTeacherName(settings.teacherName);
      setSettingsSubject(settings.defaultSubject);
    };
    void hydrateSettings();
    return () => {
      mounted = false;
    };
  }, []);

  if (!text) {
    return null;
  }

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2400);
  };

  const handlePrint = (variant: "full" | "substitute" = "full") => {
    if (Platform.OS !== "web") {
      showToast("Print is available on the web app.");
      return;
    }

    triggerPrint(variant);
  };

  const handleDownloadPdf = () => {
    if (Platform.OS !== "web") {
      showToast("PDF export is available on the web app.");
      return;
    }

    handlePrint("full");
    showToast("Use Save as PDF in the print dialog");
  };

  const isAbsenceMode = mode === "Absence Classwork Generator";

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.resultHeading}>
          <Text style={styles.resultTitle}>Generated Output</Text>
          {createdAt ? (
            <Text style={styles.resultMeta}>
              {formatSavedOutputDate(createdAt)}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => Clipboard.setStringAsync(text)}
            style={(state: any) => [
              styles.actionButton,
              state.hovered && styles.actionButtonHover,
              state.pressed && styles.actionButtonPressed
            ]}
          >
            <Text style={styles.actionLabel}>Copy</Text>
          </Pressable>
          {mode ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => shareOutputAsTextFile(mode, text, createdAt)}
              style={(state: any) => [
                styles.actionButton,
                state.hovered && styles.actionButtonHover,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Text style={styles.actionLabel}>Share</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => handlePrint("full")}
            style={(state: any) => [
              styles.actionButton,
              state.hovered && styles.actionButtonHover,
              state.pressed && styles.actionButtonPressed
            ]}
          >
            <Text style={styles.actionLabel}>Print</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleDownloadPdf}
            style={(state: any) => [
              styles.actionButton,
              state.hovered && styles.actionButtonHover,
              state.pressed && styles.actionButtonPressed
            ]}
          >
            <Text style={styles.actionLabel}>Download PDF</Text>
          </Pressable>
          {isAbsenceMode ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => handlePrint("substitute")}
              style={(state: any) => [
                styles.actionButton,
                state.hovered && styles.actionButtonHover,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Text style={styles.actionLabel}>Substitute Copy</Text>
            </Pressable>
          ) : null}
          {onRegenerate ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRegenerate}
              style={(state: any) => [
                styles.actionButtonAccent,
                state.hovered && styles.actionButtonHover,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Text style={styles.actionLabelAccent}>Regenerate</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <ScrollView nestedScrollEnabled style={expandContent ? undefined : styles.resultScroll}>
        <View style={styles.resultBody}>
          <DocumentRenderer
            content={text}
            createdAt={createdAt}
            mode={mode ?? "Assignment Builder"}
            subject={settingsSubject}
            teacherName={settingsTeacherName}
          />
        </View>
      </ScrollView>
      {toastMessage ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: spacing.md
  },
  actionButtonAccent: {
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    borderColor: colors.accent,
    borderRadius: radii.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: spacing.md
  },
  actionButtonPressed: {
    opacity: 0.9
  },
  actionButtonHover: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt
  },
  actionLabel: {
    color: colors.text,
    ...typography.labelSmall
  },
  actionLabelAccent: {
    color: colors.accent,
    ...typography.labelSmall
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  blankLine: {
    height: spacing.sm
  },
  checkbox: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14
  },
  checkboxLabel: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: "600"
  },
  checkboxLabelSelected: {
    color: colors.text
  },
  checkboxMark: {
    backgroundColor: "transparent",
    borderColor: colors.textMuted,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 18,
    width: 18
  },
  checkboxMarkOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  checkboxSelected: {
    borderColor: colors.accent
  },
  checkboxHover: {
    borderColor: colors.border
  },
  checkboxWrap: {
    gap: spacing.md
  },
  errorBox: {
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    borderColor: colors.danger,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: spacing.md
  },
  errorText: {
    color: colors.dangerSoft,
    ...typography.bodySmall
  },
  generateButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderColor: colors.accentSoft,
    borderRadius: radii.xl,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: spacing.xs,
    minHeight: 56,
    paddingHorizontal: spacing.xl
  },
  generateButtonDisabled: {
    opacity: 0.55
  },
  generateContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center"
  },
  generateButtonPressed: {
    opacity: 0.92
  },
  generateButtonHover: {
    backgroundColor: "#2563eb"
  },
  generateLabel: {
    color: colors.accentContrast,
    ...typography.button
  },
  group: {
    gap: spacing.sm
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body.fontSize,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14
  },
  inputMultiline: {
    minHeight: 124
  },
  label: {
    color: colors.text,
    ...typography.label
  },
  resultCard: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.xs,
    padding: spacing.lg,
    position: "relative"
  },
  resultBody: {
    gap: 6,
    paddingRight: 4
  },
  resultHeader: {
    gap: spacing.md
  },
  resultHeading: {
    gap: spacing.xxs
  },
  resultMeta: {
    color: colors.textMuted,
    ...typography.meta
  },
  resultScroll: {
    maxHeight: 280
  },
  resultTitle: {
    color: colors.text,
    ...typography.label
  },
  toastText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600"
  },
  toastWrap: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: radii.md,
    bottom: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: "absolute"
  },
  segment: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  segmentLabel: {
    color: colors.textMuted,
    ...typography.labelSmall
  },
  segmentLabelSelected: {
    color: colors.accentContrast
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  segmentSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  segmentHover: {
    borderColor: colors.border
  },
  subjectChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 14
  },
  subjectChipLabel: {
    color: colors.textMuted,
    ...typography.labelSmall
  },
  subjectChipLabelSelected: {
    color: colors.accentContrast
  },
  subjectChipRow: {
    gap: spacing.xs,
    paddingRight: spacing.xl
  },
  subjectChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  subjectChipHover: {
    borderColor: colors.border
  },
});
