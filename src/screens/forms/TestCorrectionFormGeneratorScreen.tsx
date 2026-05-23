import { useEffect, useState } from "react";

import {
  FormField,
  SegmentedSelector,
  TeacherFieldGroup
} from "../../components/forms/FormControls";
import { FormScreen } from "../../components/forms/FormScreen";
import { useGenerator } from "../../hooks/useGenerator";
import { useTeacherDefaults } from "../../hooks/useTeacherDefaults";
import { demoModeSamples } from "../../data/demoModeSamples";
import type { ModeScreenProps } from "./types";

const correctionFormatOptions = [
  { label: "Standard", value: "Standard" },
  { label: "Socratic", value: "Socratic" },
  { label: "Brief", value: "Brief" }
];

export function TestCorrectionFormGeneratorScreen({
  demoModeEnabled,
  selectedHistoryEntry
}: ModeScreenProps) {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [originalQuestions, setOriginalQuestions] = useState("");
  const [wrongAnswers, setWrongAnswers] = useState("");
  const [correctionFormat, setCorrectionFormat] = useState("Standard");
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Test Correction Form Generator");
  const sample = demoModeSamples.testCorrectionFormGenerator;

  useEffect(() => {
    if (!demoModeEnabled) {
      return;
    }

    setSubject((current) => current || sample.subject);
    setGradeLevel((current) => current || sample.gradeLevel);
    setOriginalQuestions((current) => current || sample.originalQuestions);
    setWrongAnswers((current) => current || sample.wrongAnswers);
    setCorrectionFormat((current) => current || sample.correctionFormat);
  }, [demoModeEnabled, sample, setGradeLevel, setSubject]);

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Original Test Questions": originalQuestions,
      "Student Wrong Answers": wrongAnswers,
      "Correction Format": correctionFormat
    });
  };

  return (
    <FormScreen
      selectedHistoryEntry={selectedHistoryEntry}
      canRegenerate={canRegenerate}
      createdAt={lastSavedEntry?.createdAt}
      description="Convert missed test items into a clean correction workflow students can complete clearly."
      error={error}
      icon="create-outline"
      isLoading={isLoading}
      mode="Test Correction Form Generator"
      onGenerate={() => void handleGenerate()}
      onRegenerate={regenerate}
      output={result}
      title="Test Correction"
    >
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <FormField
        label="Original Test Questions"
        multiline
        onChangeText={setOriginalQuestions}
        placeholder="Paste the original numbered test questions..."
        value={originalQuestions}
      />
      <FormField
        helperText="Label answers by question number, such as 3: chose B."
        label="Student's Wrong Answers"
        multiline
        onChangeText={setWrongAnswers}
        placeholder="Paste incorrect answers here..."
        value={wrongAnswers}
      />
      <SegmentedSelector
        label="Correction Format"
        onChange={setCorrectionFormat}
        options={correctionFormatOptions}
        value={correctionFormat}
      />
    </FormScreen>
  );
}
