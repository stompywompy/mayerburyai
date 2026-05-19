import { useState } from "react";

import {
  FormField,
  GenerateButton,
  InlineError,
  ResultCard,
  TeacherFieldGroup
} from "../../components/forms/FormControls";
import { FormScreen } from "../../components/forms/FormScreen";
import { useGenerator } from "../../hooks/useGenerator";
import { useTeacherDefaults } from "../../hooks/useTeacherDefaults";

export function GradeCurveCalculatorScreen() {
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
    <FormScreen description="Calculate a transparent class curve and generate teacher-ready explanation language.">
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
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Grade Curve Calculator"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}
