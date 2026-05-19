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

export function StudyGuideGeneratorScreen() {
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

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      "Topic List": topicList,
      "Raw Notes": rawNotes
    });
  };

  return (
    <FormScreen description="Gather focus topics or raw classroom notes for a student-ready study guide.">
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
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Study Guide"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}
