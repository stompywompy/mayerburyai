export type DemoModeSamples = {
  absenceClassworkGenerator: {
    gradeLevel: string;
    learningObjective: string;
    lessonStructure: string;
    lessonTopic: string;
    periodLength: string;
    subject: string;
  };
  assignmentBuilder: {
    assignmentLength: string;
    assignmentType: string;
    gradeLevel: string;
    learningObjective: string;
    subject: string;
  };
  feedbackDrafts: {
    gradeLevel: string;
    originalPrompt: string;
    studentResponse: string;
    subject: string;
  };
  gradeCurveCalculator: {
    gradeLevel: string;
    notes: string;
    rawScores: string;
    subject: string;
    targetAverage: string;
  };
  practiceTestBuilder: {
    gradeLevel: string;
    pointTotal: string;
    subject: string;
    timeLimit: string;
    topicsList: string;
    unitName: string;
  };
  problemSetGenerator: {
    difficulty: string;
    gradeLevel: string;
    problemTypes: string[];
    quantity: number;
    subject: string;
    topic: string;
  };
  studyGuideGenerator: {
    gradeLevel: string;
    rawNotes: string;
    subject: string;
    topicList: string;
  };
  testCorrectionFormGenerator: {
    correctionFormat: string;
    gradeLevel: string;
    originalQuestions: string;
    subject: string;
    wrongAnswers: string;
  };
};

export const demoModeSamples: DemoModeSamples = {
  absenceClassworkGenerator: {
    gradeLevel: "11th Grade",
    learningObjective:
      "Students will analyze how rhetorical choices shape audience response in Frederick Douglass's 'What to the Slave Is the Fourth of July?' and support claims with textual evidence.",
    lessonStructure: "Structured",
    lessonTopic: "Rhetorical Analysis Workshop",
    periodLength: "50",
    subject: "AP Language"
  },
  assignmentBuilder: {
    assignmentLength: "One full class period and a 500-word written response.",
    assignmentType: "In-Class",
    gradeLevel: "11th Grade",
    learningObjective:
      "Students will evaluate how an author's diction and syntax develop tone and central argument in a nonfiction passage.",
    subject: "AP Language"
  },
  feedbackDrafts: {
    gradeLevel: "10th Grade",
    originalPrompt:
      "Write a literary analysis paragraph explaining how Shakespeare uses imagery to reveal Macbeth's state of mind in Act 2.",
    studentResponse:
      "Macbeth is really stressed in this scene and the dagger means he is confused. Shakespeare uses scary words and it shows he is nervous. This proves he has guilt about what he is about to do.",
    subject: "English"
  },
  gradeCurveCalculator: {
    gradeLevel: "12th Grade",
    notes:
      "Curve should preserve rank order. Please keep top performers near A range while bringing class average close to target.",
    rawScores: "58, 61, 64, 66, 68, 70, 72, 73, 75, 77, 79, 81, 84, 87, 92",
    subject: "Calculus",
    targetAverage: "78"
  },
  practiceTestBuilder: {
    gradeLevel: "11th Grade",
    pointTotal: "60",
    subject: "AP Language",
    timeLimit: "55 minutes",
    topicsList:
      "Rhetorical appeals, line of reasoning, evidence commentary, tone shifts, argument structure",
    unitName: "Argument and Rhetorical Analysis"
  },
  problemSetGenerator: {
    difficulty: "medium",
    gradeLevel: "9th Grade",
    problemTypes: ["multiple-choice", "short-response", "word-problems"],
    quantity: 12,
    subject: "Algebra I",
    topic: "Systems of linear equations"
  },
  studyGuideGenerator: {
    gradeLevel: "8th Grade",
    rawNotes:
      "The Senate has 100 members. The House has 435 members. Bills can start in either chamber except revenue bills. A bill must pass both chambers in identical form. The President can sign or veto. Congress can override with two-thirds vote.",
    subject: "History",
    topicList:
      "Structure of Congress, how bills become laws, checks and balances in the legislative process"
  },
  testCorrectionFormGenerator: {
    correctionFormat: "Socratic",
    gradeLevel: "10th Grade",
    originalQuestions:
      "1) Identify the strongest textual evidence supporting the narrator's change in perspective.\n2) Explain how the author uses contrast between the two settings.\n3) Determine the meaning of 'reticent' as used in paragraph 7.",
    subject: "English",
    wrongAnswers:
      "1: Selected evidence from paragraph 2 instead of paragraph 6.\n2: Gave summary only, no analysis of contrast.\n3: Defined 'reticent' as excited rather than reserved."
  }
};
