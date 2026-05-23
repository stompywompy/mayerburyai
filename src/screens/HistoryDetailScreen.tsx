import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ResultCard } from "../components/forms/FormControls";
import { colors, radii, spacing, typography } from "../theme";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "HistoryDetail">;

export function HistoryDetailScreen({ route }: Props) {
  const { entry } = route.params;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Saved TeacherForge Output</Text>
        </View>
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
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl
  },
  headerCard: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  screen: {
    backgroundColor: colors.surface,
    flex: 1
  },
  title: {
    color: colors.text,
    ...typography.titleSection
  }
});
