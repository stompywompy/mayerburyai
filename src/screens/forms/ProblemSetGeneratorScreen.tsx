import { useState } from "react";

import Slider from "@react-native-community/slider";
import { StyleSheet, Text, View } from "react-native";

import {
  CheckboxGroup,
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
import { colors, spacing, typography } from "../../theme";

const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" }
];

const problemTypeOptions = [
  { label: "Multiple Choice", value: "multiple-choice" },
  { label: "Short Response", value: "short-response" },
  { label: "Word Problems", value: "word-problems" },
  { label: "Computation", value: "computation" },
  { label: "Explanation", value: "explanation" }
];

export function ProblemSetGeneratorScreen() {
  const { gradeLevel, setGradeLevel, setSubject, subject } =
    useTeacherDefaults();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [problemTypes, setProblemTypes] = useState<string[]>([
    "multiple-choice",
    "short-response"
  ]);
  const [quantity, setQuantity] = useState(10);
  const {
    canRegenerate,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  } = useGenerator("Problem Set");

  const toggleProblemType = (value: string) => {
    setProblemTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const handleGenerate = async () => {
    await generate({
      Subject: subject,
      "Grade Level": gradeLevel,
      Topic: topic,
      Difficulty: difficulty,
      "Problem Types": problemTypes,
      Quantity: quantity
    });
  };

  return (
    <FormScreen description="Tune the mix, difficulty, and size of a targeted practice set.">
      <TeacherFieldGroup
        gradeLevel={gradeLevel}
        onChangeGradeLevel={setGradeLevel}
        onChangeSubject={setSubject}
        subject={subject}
      />
      <FormField
        label="Topic"
        onChangeText={setTopic}
        placeholder="Ex: Linear equations"
        value={topic}
      />
      <SegmentedSelector
        label="Difficulty"
        onChange={setDifficulty}
        options={difficultyOptions}
        value={difficulty}
      />
      <CheckboxGroup
        label="Problem Types"
        onToggle={toggleProblemType}
        options={problemTypeOptions}
        values={problemTypes}
      />
      <View style={styles.sliderGroup}>
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.quantityValue}>{quantity} problems</Text>
        </View>
        <Slider
          maximumTrackTintColor={colors.border}
          maximumValue={25}
          minimumTrackTintColor={colors.accent}
          minimumValue={5}
          onValueChange={(value) => setQuantity(Math.round(value))}
          step={1}
          style={styles.slider}
          thumbTintColor={colors.accent}
          value={quantity}
        />
        <View style={styles.scaleRow}>
          <Text style={styles.scaleLabel}>5</Text>
          <Text style={styles.scaleLabel}>25</Text>
        </View>
      </View>
      <GenerateButton loading={isLoading} onPress={() => void handleGenerate()} />
      <InlineError message={error} />
      <ResultCard
        createdAt={lastSavedEntry?.createdAt}
        mode="Problem Set"
        onRegenerate={canRegenerate ? regenerate : undefined}
        text={result}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.white,
    ...typography.label
  },
  quantityValue: {
    color: colors.accentSoft,
    ...typography.labelSmall
  },
  scaleLabel: {
    color: colors.textMuted,
    ...typography.meta
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  slider: {
    height: 36,
    marginHorizontal: -10
  },
  sliderGroup: {
    gap: spacing.sm
  },
  sliderHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
