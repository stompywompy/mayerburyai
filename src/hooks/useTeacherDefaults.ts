import { useEffect, useState } from "react";

import { loadTeacherSettings } from "../utils/teacherSettings";

export function useTeacherDefaults() {
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    let isMounted = true;

    const hydrateDefaults = async () => {
      const settings = await loadTeacherSettings();

      if (!isMounted) {
        return;
      }

      setSubject((current) => current || settings.defaultSubject);
      setGradeLevel((current) => current || settings.defaultGradeLevel);
    };

    void hydrateDefaults();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    gradeLevel,
    setGradeLevel,
    setSubject,
    subject
  };
}
