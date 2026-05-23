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

const lessonStructureOptions = [
  { label: "Independent", value: "Independent" },
  { label: "Structured", value: "Structured" }
];

export function AbsenceClassworkGeneratorScreen({
  demoModeEnabled,
  selectedHistoryEntry
}: ModeScreenProps) {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [lessonTopic, setLessonTopic] = useState("");
  const [learningObjective, setLearningObjective] = useState("");
  const [periodLength, setPeriodLength] = useState("");
  const [lessonStructure, setLessonStructure] = useState("Structured");
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Absence Classwork Generator");
  const sample = demoModeSamples.absenceClassworkGenerator;

  useEffect(() => {
    if (!demoModeEnabled) {
      return;
    }

    setSubject((current) => current || sample.subject);
    setGradeLevel((current) => current || sample.gradeLevel);
    setLessonTopic((current) => current || sample.lessonTopic);
    setLearningObjective((current) => current || sample.learningObjective);
    setPeriodLength((current) => current || sample.periodLength);
    setLessonStructure((current) => current || sample.lessonStructure);
  }, [demoModeEnabled, sample, setGradeLevel, setSubject]);

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Today's Lesson Topic": lessonTopic,
      "Learning Objective": learningObjective,
      "Class Period Length in Minutes": periodLength,
      "Lesson Structure": lessonStructure
    });
  };

  return (
    <FormScreen
      selectedHistoryEntry={selectedHistoryEntry}
      canRegenerate={canRegenerate}
      createdAt={lastSavedEntry?.createdAt}
      description="Generate substitute-ready classwork that keeps learning on track during teacher absence."
      error={error}
      icon="calendar-outline"
      isLoading={isLoading}
      mode="Absence Classwork Generator"
      onGenerate={() => void handleGenerate()}
      onRegenerate={regenerate}
      output={result}
      title="Absence Classwork"
    >
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <FormField
        label="Today's Lesson Topic"
        onChangeText={setLessonTopic}
        placeholder="Ex: Causes of the French Revolution"
        value={lessonTopic}
      />
      <FormField
        label="Learning Objective"
        multiline
        onChangeText={setLearningObjective}
        placeholder="Describe what students should understand or complete."
        value={learningObjective}
      />
      <FormField
        keyboardType="numeric"
        label="Class Period Length"
        onChangeText={setPeriodLength}
        placeholder="Ex: 50"
        value={periodLength}
      />
      <SegmentedSelector
        label="Work Style"
        onChange={setLessonStructure}
        options={lessonStructureOptions}
        value={lessonStructure}
      />
    </FormScreen>
  );
}
