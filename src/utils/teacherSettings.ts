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

const TEACHER_SETTINGS_KEY = "teacherforge-teacher-settings";

export type TeacherSettings = {
  defaultGradeLevel: string;
  defaultSubject: string;
};

export const emptyTeacherSettings: TeacherSettings = {
  defaultGradeLevel: "",
  defaultSubject: ""
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
      defaultSubject: parsedValue.defaultSubject ?? ""
    };
  } catch {
    return emptyTeacherSettings;
  }
}

export async function saveTeacherSettings(settings: TeacherSettings) {
  await AsyncStorage.setItem(TEACHER_SETTINGS_KEY, JSON.stringify(settings));
}
