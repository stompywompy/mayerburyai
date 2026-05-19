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

const lessonStructureOptions = [
  { label: "Independent", value: "Independent" },
  { label: "Structured", value: "Structured" }
];

export function AbsenceClassworkGeneratorScreen() {
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
    <FormScreen description="Build a substitute-ready lesson packet that keeps the class moving while you are out.">
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
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Absence Classwork Generator"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}
