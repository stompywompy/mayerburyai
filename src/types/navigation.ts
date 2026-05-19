import type { SavedOutputEntry } from "./history";

export type RootStackParamList = {
  Home: undefined;
  AssignmentBuilder: undefined;
  ProblemSetGenerator: undefined;
  PracticeTestBuilder: undefined;
  StudyGuideGenerator: undefined;
  FeedbackDrafts: undefined;
  GradeCurveCalculator: undefined;
  TestCorrectionFormGenerator: undefined;
  AbsenceClassworkGenerator: undefined;
  HistoryDetail: { entry: SavedOutputEntry };
  Settings: undefined;
};
