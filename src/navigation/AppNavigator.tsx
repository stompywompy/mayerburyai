import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeScreen } from "../screens/HomeScreen";
import { HistoryDetailScreen } from "../screens/HistoryDetailScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import {
  AbsenceClassworkGeneratorScreen,
  AssignmentBuilderScreen,
  FeedbackDraftsScreen,
  GradeCurveCalculatorScreen,
  PracticeTestBuilderScreen,
  ProblemSetGeneratorScreen,
  StudyGuideGeneratorScreen,
  TestCorrectionFormGeneratorScreen
} from "../screens/forms";
import { colors, typography } from "../theme";
import { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          ...typography.titleScreen
        }
      }}
    >
      <Stack.Screen
        component={HomeScreen}
        name="Home"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={HistoryDetailScreen}
        name="HistoryDetail"
        options={{ title: "Saved Output" }}
      />
      <Stack.Screen
        component={SettingsScreen}
        name="Settings"
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        component={AssignmentBuilderScreen}
        name="AssignmentBuilder"
        options={{ title: "Assignment Builder" }}
      />
      <Stack.Screen
        component={ProblemSetGeneratorScreen}
        name="ProblemSetGenerator"
        options={{ title: "Problem Set Generator" }}
      />
      <Stack.Screen
        component={PracticeTestBuilderScreen}
        name="PracticeTestBuilder"
        options={{ title: "Practice Test Builder" }}
      />
      <Stack.Screen
        component={StudyGuideGeneratorScreen}
        name="StudyGuideGenerator"
        options={{ title: "Study Guide Generator" }}
      />
      <Stack.Screen
        component={FeedbackDraftsScreen}
        name="FeedbackDrafts"
        options={{ title: "Feedback Drafts" }}
      />
      <Stack.Screen
        component={GradeCurveCalculatorScreen}
        name="GradeCurveCalculator"
        options={{ title: "Grade Curve Calculator" }}
      />
      <Stack.Screen
        component={TestCorrectionFormGeneratorScreen}
        name="TestCorrectionFormGenerator"
        options={{ title: "Test Correction Form Generator" }}
      />
      <Stack.Screen
        component={AbsenceClassworkGeneratorScreen}
        name="AbsenceClassworkGenerator"
        options={{ title: "Absence Classwork Generator" }}
      />
    </Stack.Navigator>
  );
}
