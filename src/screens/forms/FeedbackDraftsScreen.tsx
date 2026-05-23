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

export function FeedbackDraftsScreen({
  demoModeEnabled,
  selectedHistoryEntry
}: ModeScreenProps) {
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
  const sample = demoModeSamples.feedbackDrafts;

  useEffect(() => {
    if (!demoModeEnabled) {
      return;
    }

    setSubject((current) => current || sample.subject);
    setGradeLevel((current) => current || sample.gradeLevel);
    setStudentResponse((current) => current || sample.studentResponse);
    setOriginalPrompt((current) => current || sample.originalPrompt);
  }, [demoModeEnabled, sample, setGradeLevel, setSubject]);

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Student Response": studentResponse,
      "Original Prompt": originalPrompt
    });
  };

  return (
    <FormScreen
      selectedHistoryEntry={selectedHistoryEntry}
      canRegenerate={canRegenerate}
      createdAt={lastSavedEntry?.createdAt}
      description="Draft targeted, constructive feedback from student work and the original assignment prompt."
      error={error}
      icon="chatbubble-ellipses-outline"
      isLoading={isLoading}
      mode="Feedback Drafts"
      onGenerate={() => void handleGenerate()}
      onRegenerate={regenerate}
      output={result}
      title="Feedback Drafts"
    >
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
    </FormScreen>
  );
}
