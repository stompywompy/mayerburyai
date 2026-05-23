import { useEffect, useState } from "react";

import { FormField, SegmentedSelector, TeacherFieldGroup } from "../../components/forms/FormControls";
import { FormScreen } from "../../components/forms/FormScreen";
import { useGenerator } from "../../hooks/useGenerator";
import { useTeacherDefaults } from "../../hooks/useTeacherDefaults";
import { demoModeSamples } from "../../data/demoModeSamples";
import type { ModeScreenProps } from "./types";

export function AssignmentBuilderScreen({
  demoModeEnabled,
  selectedHistoryEntry
}: ModeScreenProps) {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [assignmentType, setAssignmentType] = useState("Homework");
  const [learningObjective, setLearningObjective] = useState("");
  const [assignmentLength, setAssignmentLength] = useState("");
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Assignment Builder");
  const sample = demoModeSamples.assignmentBuilder;

  useEffect(() => {
    if (!demoModeEnabled) {
      return;
    }

    setSubject((current) => current || sample.subject);
    setGradeLevel((current) => current || sample.gradeLevel);
    setAssignmentType((current) => current || sample.assignmentType);
    setLearningObjective((current) => current || sample.learningObjective);
    setAssignmentLength((current) => current || sample.assignmentLength);
  }, [demoModeEnabled, sample, setGradeLevel, setSubject]);

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Assignment Type": assignmentType,
      "Learning Objective": learningObjective,
      "Assignment Length": assignmentLength
    });
  };

  return (
    <FormScreen
      selectedHistoryEntry={selectedHistoryEntry}
      canRegenerate={canRegenerate}
      createdAt={lastSavedEntry?.createdAt}
      description="Create a polished classroom assignment with clear goals, structure, and scope."
      error={error}
      icon="document-text-outline"
      isLoading={isLoading}
      mode="Assignment Builder"
      onGenerate={() => void handleGenerate()}
      onRegenerate={regenerate}
      output={result}
      title="Assignment Builder"
    >
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <SegmentedSelector
        label="Assignment Type"
        onChange={setAssignmentType}
        options={[
          { label: "Homework", value: "Homework" },
          { label: "In-Class", value: "In-Class" },
          { label: "Project", value: "Project" }
        ]}
        value={assignmentType}
      />
      <FormField
        helperText="Be specific about the expected outcomes or skills to be demonstrated."
        label="Learning Objective"
        multiline
        onChangeText={setLearningObjective}
        placeholder="e.g. Students will analyze the main themes..."
        value={learningObjective}
      />
      <FormField
        helperText="Provide a clear expectation for the depth or duration of the assignment."
        label="Assignment Length"
        onChangeText={setAssignmentLength}
        placeholder="e.g. 2 pages, 5 paragraphs, or 30 minutes"
        value={assignmentLength}
      />
    </FormScreen>
  );
}
