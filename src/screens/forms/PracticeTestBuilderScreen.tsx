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

export function PracticeTestBuilderScreen() {
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
    <FormScreen description="Outline the scope and constraints for a balanced practice test.">
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
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Practice Test"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}
