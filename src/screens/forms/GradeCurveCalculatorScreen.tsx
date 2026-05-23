import { useEffect, useState } from "react";

import {
  FormField,
  TeacherFieldGroup
} from "../../components/forms/FormControls";
import { FormScreen } from "../../components/forms/FormScreen";
import { useGenerator } from "../../hooks/useGenerator";
import { useTeacherDefaults } from "../../hooks/useTeacherDefaults";
import { demoModeSamples } from "../../data/demoModeSamples";
import type { ModeScreenProps } from "./types";

export function GradeCurveCalculatorScreen({
  demoModeEnabled,
  selectedHistoryEntry
}: ModeScreenProps) {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [rawScores, setRawScores] = useState("");
  const [targetAverage, setTargetAverage] = useState("");
  const [notes, setNotes] = useState("");
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Grade Curve Calculator");
  const sample = demoModeSamples.gradeCurveCalculator;

  useEffect(() => {
    if (!demoModeEnabled) {
      return;
    }

    setSubject((current) => current || sample.subject);
    setGradeLevel((current) => current || sample.gradeLevel);
    setRawScores((current) => current || sample.rawScores);
    setTargetAverage((current) => current || sample.targetAverage);
    setNotes((current) => current || sample.notes);
  }, [demoModeEnabled, sample, setGradeLevel, setSubject]);

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Raw Scores": rawScores,
      "Target Class Average": targetAverage,
      Notes: notes
    });
  };

  return (
    <FormScreen
      selectedHistoryEntry={selectedHistoryEntry}
      canRegenerate={canRegenerate}
      createdAt={lastSavedEntry?.createdAt}
      description="Calculate a transparent curve and generate clear language for communicating adjustments."
      error={error}
      icon="stats-chart-outline"
      isLoading={isLoading}
      mode="Grade Curve Calculator"
      onGenerate={() => void handleGenerate()}
      onRegenerate={regenerate}
      output={result}
      title="Grade Curve"
    >
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <FormField
        helperText="Use comma-separated numbers, such as 68, 74, 91, 83."
        keyboardType="numeric"
        label="Raw Scores"
        multiline
        onChangeText={setRawScores}
        placeholder="Paste scores here..."
        value={rawScores}
      />
      <FormField
        keyboardType="numeric"
        label="Target Class Average"
        onChangeText={setTargetAverage}
        placeholder="Ex: 82"
        value={targetAverage}
      />
      <FormField
        label="Optional Notes"
        multiline
        onChangeText={setNotes}
        placeholder="Ex: Drop lowest score before curving."
        value={notes}
      />
    </FormScreen>
  );
}
