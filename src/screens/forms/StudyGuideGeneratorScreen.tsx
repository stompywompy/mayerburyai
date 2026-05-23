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

export function StudyGuideGeneratorScreen({
  demoModeEnabled,
  selectedHistoryEntry
}: ModeScreenProps) {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [topicList, setTopicList] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Study Guide");
  const sample = demoModeSamples.studyGuideGenerator;

  useEffect(() => {
    if (!demoModeEnabled) {
      return;
    }

    setSubject((current) => current || sample.subject);
    setGradeLevel((current) => current || sample.gradeLevel);
    setTopicList((current) => current || sample.topicList);
    setRawNotes((current) => current || sample.rawNotes);
  }, [demoModeEnabled, sample, setGradeLevel, setSubject]);

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Topic List": topicList,
      "Raw Notes": rawNotes
    });
  };

  return (
    <FormScreen
      selectedHistoryEntry={selectedHistoryEntry}
      canRegenerate={canRegenerate}
      createdAt={lastSavedEntry?.createdAt}
      description="Turn topics and notes into a student-ready study guide with organized review sections."
      error={error}
      icon="book-outline"
      isLoading={isLoading}
      mode="Study Guide"
      onGenerate={() => void handleGenerate()}
      onRegenerate={regenerate}
      output={result}
      title="Study Guide"
    >
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <FormField
        helperText="List the main ideas, standards, or sections to cover."
        label="Topic List"
        multiline
        onChangeText={setTopicList}
        placeholder="Cells, photosynthesis, cellular respiration"
        value={topicList}
      />
      <FormField
        helperText="Paste lecture notes, class discussion notes, or source material."
        label="Paste Raw Notes"
        multiline
        onChangeText={setRawNotes}
        placeholder="Paste raw notes here..."
        value={rawNotes}
      />
    </FormScreen>
  );
}
