import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../types/navigation";

type ModeName = keyof Omit<
  RootStackParamList,
  "HistoryDetail" | "Home" | "Settings"
>;

export type ModeCard = {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: ModeName;
  title: string;
};

export const modeCards: ModeCard[] = [
  {
    route: "AssignmentBuilder",
    title: "Assignment Builder",
    description: "Shape polished assignments with clear structure and intent.",
    icon: "document-text-outline"
  },
  {
    route: "ProblemSetGenerator",
    title: "Problem Set Generator",
    description: "Assemble targeted practice problems for any lesson flow.",
    icon: "grid-outline"
  },
  {
    route: "PracticeTestBuilder",
    title: "Practice Test Builder",
    description: "Draft assessment-ready test sets with a balanced scope.",
    icon: "clipboard-outline"
  },
  {
    route: "StudyGuideGenerator",
    title: "Study Guide Generator",
    description: "Organize key concepts into focused student review guides.",
    icon: "book-outline"
  },
  {
    route: "FeedbackDrafts",
    title: "Feedback Drafts",
    description: "Prepare thoughtful, concise feedback language for students.",
    icon: "chatbubble-ellipses-outline"
  },
  {
    route: "GradeCurveCalculator",
    title: "Grade Curve Calculator",
    description: "Curve raw scores and explain the adjustment clearly.",
    icon: "stats-chart-outline"
  },
  {
    route: "TestCorrectionFormGenerator",
    title: "Test Correction Form Generator",
    description: "Create printable correction forms from missed test items.",
    icon: "create-outline"
  },
  {
    route: "AbsenceClassworkGenerator",
    title: "Absence Classwork Generator",
    description: "Build substitute-ready classwork for a full period.",
    icon: "calendar-outline"
  }
];
