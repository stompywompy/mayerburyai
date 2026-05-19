import { useState } from "react";

import {
  GenerateButton,
  InlineError,
  ResultCard,
  SegmentedSelector,
  TeacherFieldGroup,
  FormField
} from "../../components/forms/FormControls";
import { FormScreen } from "../../components/forms/FormScreen";
import { useGenerator } from "../../hooks/useGenerator";
import { useTeacherDefaults } from "../../hooks/useTeacherDefaults";

export function AssignmentBuilderScreen() {
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
    <FormScreen description="Set the essentials for a polished, professional classroom assignment.">
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
        placeholder="e.g. Students will be able to analyze the main themes..."
        value={learningObjective}
      />
      <FormField
        helperText="Provide a clear expectation for the depth or duration of the assignment."
        label="Assignment Length"
        onChangeText={setAssignmentLength}
        placeholder="e.g. 2 pages, 5 paragraphs, or 30 minutes"
        value={assignmentLength}
      />
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Assignment Builder"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}
