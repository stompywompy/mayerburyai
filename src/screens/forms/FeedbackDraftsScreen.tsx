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

export function FeedbackDraftsScreen() {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [studentResponse, setStudentResponse] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Feedback Drafts");

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Student Response": studentResponse,
      "Original Prompt": originalPrompt
    });
  };

  return (
    <FormScreen description="Provide the prompt and student work so the app can draft targeted feedback later.">
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <FormField
        label="Paste Student Response"
        multiline
        onChangeText={setStudentResponse}
        placeholder="Paste the student's response here..."
        value={studentResponse}
      />
      <FormField
        label="Paste Original Prompt"
        multiline
        onChangeText={setOriginalPrompt}
        placeholder="Paste the original assignment or question prompt here..."
        value={originalPrompt}
      />
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Feedback Drafts"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}
