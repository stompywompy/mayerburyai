import { type ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Svg, { Circle, Path } from "react-native-svg";

import { DocumentRenderer } from "../DocumentRenderer";
import { colors, radii, spacing, typography } from "../../theme";
import type { SavedOutputEntry } from "../../types/history";
import type { GenerationMode } from "../../utils/generateContent";
import { formatSavedOutputDate } from "../../utils/outputHistory";
import { triggerPrint, type PrintVariant } from "../../utils/printDocument";
import { loadTeacherSettings } from "../../utils/teacherSettings";

type FormScreenProps = {
  canRegenerate: boolean;
  children: ReactNode;
  createdAt?: string;
  description: string;
  error: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLoading: boolean;
  mode: GenerationMode;
  onGenerate: () => void;
  onRegenerate: () => void;
  output: string;
  selectedHistoryEntry?: SavedOutputEntry | null;
  title: string;
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

function OutputEmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Svg fill="none" height={110} viewBox="0 0 160 110" width={160}>
        <Path
          d="M24 26h85a10 10 0 0 1 10 10v54a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V36a10 10 0 0 1 10-10Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth={2}
        />
        <Path d="M30 42h74" stroke="#cbd5e1" strokeLinecap="round" strokeWidth={2} />
        <Path d="M30 56h54" stroke="#cbd5e1" strokeLinecap="round" strokeWidth={2} />
        <Path d="M30 70h62" stroke="#cbd5e1" strokeLinecap="round" strokeWidth={2} />
        <Path d="M30 84h38" stroke="#cbd5e1" strokeLinecap="round" strokeWidth={2} />
        <Circle cx={131} cy={32} fill="#dbeafe" r={15} />
        <Path
          d="m131 22 2.4 5.4 5.6 2.5-5.6 2.4-2.4 5.6-2.5-5.6-5.4-2.4 5.4-2.5 2.5-5.4Z"
          fill="#3b82f6"
        />
      </Svg>
      <Text style={styles.emptyText}>Fill in the details and hit Generate</Text>
    </View>
  );
}

export function FormScreen({
  canRegenerate,
  children,
  createdAt,
  description,
  error,
  icon,
  isLoading,
  mode,
  onGenerate,
  onRegenerate,
  output,
  selectedHistoryEntry,
  title
}: FormScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1100;
  const displayOutput = selectedHistoryEntry?.text ?? output;
  const displayCreatedAt = selectedHistoryEntry?.createdAt ?? createdAt;
  const hasOutput = displayOutput.trim().length > 0;
  const actionButtonsDisabled = !hasOutput || isLoading;
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

  const historyInputs = selectedHistoryEntry?.inputs;
  const subjectFromHistory =
    typeof historyInputs?.Subject === "string" ? historyInputs.Subject : "";
  const teacherFromHistory =
    typeof historyInputs?.["Teacher Name"] === "string"
      ? historyInputs["Teacher Name"]
      : "";
  const isAbsenceMode = mode === "Absence Classwork Generator";

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2400);
  };

  const handlePrint = (variant: PrintVariant = "full") => {
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

  return (
    <View style={styles.screen}>
      <View style={[styles.workspace, !isDesktop && styles.workspaceStacked]}>
        <View style={[styles.inputColumn, !isDesktop && styles.fullWidthColumn]}>
          <View style={styles.modeHeaderCard}>
            <View style={styles.modeTitleRow}>
              <View style={styles.modeIconTile}>
                <Ionicons color={colors.accent} name={icon} size={18} />
              </View>
              <Text style={styles.modeTitle}>{title}</Text>
            </View>
            <Text style={styles.modeDescription}>{description}</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: isLoading, disabled: isLoading }}
              disabled={isLoading}
              onPress={onGenerate}
              style={(state: any) => [
                styles.generateButton,
                state.hovered && !isLoading && styles.generateButtonHover,
                isLoading && styles.generateButtonDisabled,
                state.pressed && !isLoading && styles.generateButtonPressed
              ]}
            >
              <View style={styles.generateInner}>
                {isLoading ? (
                  <ActivityIndicator color={colors.accentContrast} size="small" />
                ) : (
                  <Ionicons color={colors.accentContrast} name="sparkles-outline" size={18} />
                )}
                <Text style={styles.generateLabel}>
                  {isLoading ? "Generating..." : "Generate"}
                </Text>
              </View>
            </Pressable>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>
        </View>

        <View style={[styles.outputColumn, !isDesktop && styles.fullWidthColumn]}>
          <View style={styles.outputHeader}>
            <Text style={styles.outputMode}>{title}</Text>
            <Text style={styles.outputTime}>
              {displayCreatedAt
                ? formatSavedOutputDate(displayCreatedAt)
                : "Not generated yet"}
            </Text>
          </View>

          <View style={styles.outputBodyWrap}>
            {isLoading ? (
              <View style={styles.outputLoading}>
                <ActivityIndicator color={colors.accent} size="large" />
                <Text style={styles.outputLoadingText}>Generating your document…</Text>
              </View>
            ) : !hasOutput ? (
              <OutputEmptyState />
            ) : (
              <ScrollView style={styles.outputScroll} contentContainerStyle={styles.outputContent}>
                <DocumentRenderer
                  content={displayOutput}
                  createdAt={displayCreatedAt}
                  mode={mode}
                  subject={subjectFromHistory || settingsSubject}
                  teacherName={teacherFromHistory || settingsTeacherName}
                />
              </ScrollView>
            )}
          </View>

          <View style={styles.actionBar} testID="tf-print-controls">
            <Pressable
              accessibilityRole="button"
              disabled={actionButtonsDisabled}
              onPress={() => Clipboard.setStringAsync(displayOutput)}
              style={(state: any) => [
                styles.actionButton,
                state.hovered && styles.actionButtonHover,
                actionButtonsDisabled && styles.actionButtonDisabled,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Ionicons color={colors.text} name="copy-outline" size={16} />
              <Text style={styles.actionLabel}>Copy</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={actionButtonsDisabled}
              onPress={() =>
                shareOutputAsTextFile(mode, displayOutput, displayCreatedAt)
              }
              style={(state: any) => [
                styles.actionButton,
                state.hovered && styles.actionButtonHover,
                actionButtonsDisabled && styles.actionButtonDisabled,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Ionicons color={colors.text} name="share-outline" size={16} />
              <Text style={styles.actionLabel}>Share</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={actionButtonsDisabled}
              onPress={() => handlePrint("full")}
              style={(state: any) => [
                styles.actionButton,
                state.hovered && styles.actionButtonHover,
                actionButtonsDisabled && styles.actionButtonDisabled,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Ionicons color={colors.text} name="print-outline" size={16} />
              <Text style={styles.actionLabel}>Print</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={actionButtonsDisabled}
              onPress={handleDownloadPdf}
              style={(state: any) => [
                styles.actionButton,
                state.hovered && styles.actionButtonHover,
                actionButtonsDisabled && styles.actionButtonDisabled,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Ionicons color={colors.text} name="download-outline" size={16} />
              <Text style={styles.actionLabel}>Download PDF</Text>
            </Pressable>

            {isAbsenceMode ? (
              <Pressable
                accessibilityRole="button"
                disabled={actionButtonsDisabled}
                onPress={() => handlePrint("substitute")}
                style={(state: any) => [
                  styles.actionButton,
                  state.hovered && styles.actionButtonHover,
                  actionButtonsDisabled && styles.actionButtonDisabled,
                  state.pressed && styles.actionButtonPressed
                ]}
              >
                <Ionicons color={colors.text} name="duplicate-outline" size={16} />
                <Text style={styles.actionLabel}>Substitute Copy</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canRegenerate || isLoading}
              onPress={onRegenerate}
              style={(state: any) => [
                styles.actionButton,
                styles.regenerateButton,
                state.hovered && styles.regenerateButtonHover,
                (!canRegenerate || isLoading) && styles.actionButtonDisabled,
                state.pressed && styles.actionButtonPressed
              ]}
            >
              <Ionicons color={colors.accent} name="refresh-outline" size={16} />
              <Text style={styles.regenerateLabel}>Regenerate</Text>
            </Pressable>
          </View>

          <View style={styles.watermarkBar} testID="tf-print-controls">
            <Text style={styles.watermarkText}>
              Generated by TeacherForge · AI-assisted, teacher-approved
            </Text>
          </View>

          {toastMessage ? (
            <View pointerEvents="none" style={styles.toastWrap}>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: spacing.md
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.md
  },
  actionButtonDisabled: {
    opacity: 0.45
  },
  actionButtonHover: {
    borderColor: colors.borderStrong,
    backgroundColor: "#f1f5f9"
  },
  actionButtonPressed: {
    opacity: 0.85
  },
  actionLabel: {
    color: colors.text,
    ...typography.labelSmall
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center"
  },
  emptyWrap: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    minHeight: 320,
    paddingHorizontal: spacing.lg
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
  formContent: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  fullWidthColumn: {
    flexBasis: "auto",
    flexGrow: 0,
    width: "100%"
  },
  generateButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    justifyContent: "center",
    minHeight: 52,
    width: "100%"
  },
  generateButtonDisabled: {
    opacity: 0.7
  },
  generateButtonHover: {
    backgroundColor: "#2563eb"
  },
  generateButtonPressed: {
    opacity: 0.9
  },
  generateInner: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center"
  },
  generateLabel: {
    color: colors.accentContrast,
    ...typography.button
  },
  inputColumn: {
    flex: 1,
    minWidth: 0
  },
  modeDescription: {
    color: colors.textMuted,
    ...typography.bodySmall
  },
  modeHeaderCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg
  },
  modeIconTile: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: radii.sm,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  modeTitle: {
    color: colors.text,
    ...typography.titleSection
  },
  modeTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  outputBodyWrap: {
    backgroundColor: colors.surface,
    flex: 1,
    minHeight: 320
  },
  outputLoading: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    minHeight: 320,
    padding: spacing.xl
  },
  outputLoadingText: {
    color: colors.textMuted,
    ...typography.body
  },
  outputColumn: {
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    position: "relative"
  },
  outputContent: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  outputHeader: {
    backgroundColor: colors.surfaceAlt,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  outputMode: {
    color: colors.text,
    ...typography.label
  },
  outputScroll: {
    flex: 1
  },
  outputTime: {
    color: colors.textMuted,
    ...typography.meta
  },
  regenerateButton: {
    backgroundColor: "#eff6ff"
  },
  regenerateButtonHover: {
    backgroundColor: "#dbeafe"
  },
  regenerateLabel: {
    color: colors.accent,
    ...typography.labelSmall
  },
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl
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
  watermarkBar: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  watermarkText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center"
  },
  workspace: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg,
    width: "100%"
  },
  workspaceStacked: {
    flexDirection: "column"
  }
});
