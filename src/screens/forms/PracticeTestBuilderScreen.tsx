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

export function PracticeTestBuilderScreen({
  demoModeEnabled,
  selectedHistoryEntry
}: ModeScreenProps) {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [unitName, setUnitName] = useState("");
  const [topicsList, setTopicsList] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [pointTotal, setPointTotal] = useState("");
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Practice Test");
  const sample = demoModeSamples.practiceTestBuilder;

  useEffect(() => {
    if (!demoModeEnabled) {
      return;
    }

    setSubject((current) => current || sample.subject);
    setGradeLevel((current) => current || sample.gradeLevel);
    setUnitName((current) => current || sample.unitName);
    setTopicsList((current) => current || sample.topicsList);
    setTimeLimit((current) => current || sample.timeLimit);
    setPointTotal((current) => current || sample.pointTotal);
  }, [demoModeEnabled, sample, setGradeLevel, setSubject]);

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Unit Name": unitName,
      "Topics List": topicsList,
      "Time Limit": timeLimit,
      "Point Total": pointTotal
    });
  };

  return (
    <FormScreen
      selectedHistoryEntry={selectedHistoryEntry}
      canRegenerate={canRegenerate}
      createdAt={lastSavedEntry?.createdAt}
      description="Assemble a balanced practice assessment with clear timing and scoring expectations."
      error={error}
      icon="clipboard-outline"
      isLoading={isLoading}
      mode="Practice Test"
      onGenerate={() => void handleGenerate()}
      onRegenerate={regenerate}
      output={result}
      title="Practice Test"
    >
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <FormField
        label="Unit Name"
        onChangeText={setUnitName}
        placeholder="Ex: Forces and Motion"
        value={unitName}
      />
      <FormField
        helperText="Use commas, bullets, or one topic per line."
        label="Topics List"
        multiline
        onChangeText={setTopicsList}
        placeholder="Newton's laws, acceleration, free-body diagrams"
        value={topicsList}
      />
      <FormField
        label="Time Limit"
        onChangeText={setTimeLimit}
        placeholder="Ex: 45 minutes"
        value={timeLimit}
      />
      <FormField
        keyboardType="numeric"
        label="Point Total"
        onChangeText={setPointTotal}
        placeholder="Ex: 50"
        value={pointTotal}
      />
    </FormScreen>
  );
}
