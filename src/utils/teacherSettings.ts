import AsyncStorage from "@react-native-async-storage/async-storage";

export const SUBJECT_OPTIONS = [
  "English",
  "Math",
  "History",
  "Science",
  "Latin",
  "Spanish",
  "Art History",
  "Philosophy"
] as const;

export const GRADE_LEVEL_OPTIONS = [
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
  "AP"
] as const;

const TEACHER_SETTINGS_KEY = "teacherforge-teacher-settings";

export type TeacherSettings = {
  defaultGradeLevel: string;
  defaultSubject: string;
  demoModeEnabled: boolean;
  schoolName: string;
  teacherName: string;
  welcomeBannerDismissed: boolean;
};

export const emptyTeacherSettings: TeacherSettings = {
  defaultGradeLevel: "",
  defaultSubject: "",
  demoModeEnabled: false,
  schoolName: "",
  teacherName: "",
  welcomeBannerDismissed: false
};

export async function loadTeacherSettings() {
  const rawValue = await AsyncStorage.getItem(TEACHER_SETTINGS_KEY);

  if (!rawValue) {
    return emptyTeacherSettings;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<TeacherSettings>;

    return {
      defaultGradeLevel: parsedValue.defaultGradeLevel ?? "",
      defaultSubject: parsedValue.defaultSubject ?? "",
      demoModeEnabled: parsedValue.demoModeEnabled ?? false,
      schoolName: parsedValue.schoolName ?? "",
      teacherName: parsedValue.teacherName ?? "",
      welcomeBannerDismissed: parsedValue.welcomeBannerDismissed ?? false
    };
  } catch {
    return emptyTeacherSettings;
  }
}

export async function saveTeacherSettings(settings: Partial<TeacherSettings>) {
  const existing = await loadTeacherSettings();
  const merged = {
    ...existing,
    ...settings
  };
  await AsyncStorage.setItem(TEACHER_SETTINGS_KEY, JSON.stringify(merged));
}
