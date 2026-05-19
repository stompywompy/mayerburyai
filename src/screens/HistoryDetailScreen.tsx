import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SalisburyBrandHeader } from "../components/SalisburyBrandHeader";
import { ResultCard } from "../components/forms/FormControls";
import { colors, spacing } from "../theme";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "HistoryDetail">;

export function HistoryDetailScreen({ route }: Props) {
  const { entry } = route.params;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <SalisburyBrandHeader subtitle="Saved TeacherForge output" />
        <ResultCard
          createdAt={entry.createdAt}
          expandContent
          mode={entry.mode}
          text={entry.text}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  }
});
