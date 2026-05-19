import { useState } from "react";

import {
  FormField,
  GenerateButton,
  InlineError,
  ResultCard,
  SegmentedSelector,
  TeacherFieldGroup
} from "../../components/forms/FormControls";
import { FormScreen } from "../../components/forms/FormScreen";
import { useGenerator } from "../../hooks/useGenerator";
import { useTeacherDefaults } from "../../hooks/useTeacherDefaults";

const correctionFormatOptions = [
  { label: "Standard", value: "Standard" },
  { label: "Socratic", value: "Socratic" },
  { label: "Brief", value: "Brief" }
];

export function TestCorrectionFormGeneratorScreen() {
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
    <FormScreen description="Turn missed test items into a print-ready correction form.">
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
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Test Correction Form Generator"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}
