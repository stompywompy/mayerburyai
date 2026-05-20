export type GenerationMode =
  | "Assignment Builder"
  | "Problem Set"
  | "Practice Test"
  | "Study Guide"
  | "Feedback Drafts"
  | "Grade Curve Calculator"
  | "Test Correction Form Generator"
  | "Absence Classwork Generator";

export type GenerationInputs = Record<
  string,
  string | number | string[] | undefined
>;

const modeInstructions: Record<GenerationMode, string> = {
  "Assignment Builder":
    "Return a student-facing assignment prompt, a rubric with criteria and point values, and a differentiated version, all clearly labeled with headers.",
  "Problem Set":
    "Return numbered problems of the requested type and difficulty, followed by a clearly separated Answer Key section.",
  "Practice Test":
    "Return a formatted test with instructions, point values per question, a mix of MCQ and open response, then a separate Answer Key.",
  "Study Guide":
    "Return sections labeled Key Terms, Core Concepts, Example Questions, and Memory Hooks.",
  "Feedback Drafts":
    "Return Estimated Score, three labeled Strengths, three labeled Revision Targets, and one Model Sentence.",
  "Grade Curve Calculator":
    "Return the original score list with each student numbered, the calculated curve adjustment method used, every student's new curved score, the new class average, a letter grade breakdown table, and a short plain-English paragraph the teacher can copy and share with students explaining how the curve was applied and why. Choose the curve method that best hits the target average from these options: square root curve, flat add, or scale to target. Use pipe-delimited table rows for both score tables and the letter grade breakdown, with headers like Student | Original Score | Curved Score | Letter Grade. Do not use Markdown separator rows.",
  "Test Correction Form Generator":
    "Return a fully formatted correction form personalized to the student's specific wrong answers, with a header section for student name/date/class, one correction block per wrong answer in the selected format, and a reflection prompt at the bottom asking the student what study strategy they will change. The correction format options are Standard, Socratic, and Brief. Format it cleanly so a teacher can copy and print it directly.",
  "Absence Classwork Generator":
    "Return a complete substitute-ready lesson packet including a one-paragraph note to the substitute with instructions, a warm-up activity timed to 5-10 minutes, a main independent or small-group task that is genuinely educational and directly tied to the learning objective and fills the bulk of the period, a clearly labeled exit ticket or end-of-class deliverable the substitute collects, and a teacher-facing note at the bottom summarizing what students should have completed so the returning teacher knows exactly where the class left off. Format it so the teacher can copy and hand it directly to the main office."
};

function formatInputValue(value: string | number | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "(none)";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim() ? value.trim() : "(blank)";
  }

  return "(blank)";
}

export function buildPrompt(mode: GenerationMode, inputs: GenerationInputs) {
  const formattedInputs = Object.entries(inputs)
    .map(([label, value]) => `- ${label}: ${formatInputValue(value)}`)
    .join("\n");

  return [
    "You are TeacherForge, an AI assistant for educators.",
    `Mode: ${mode}`,
    "",
    "Instruction:",
    modeInstructions[mode],
    "",
    "Produce a complete, self-contained response using the teacher inputs below.",
    "If any field is blank, make a reasonable classroom-safe assumption and continue.",
    "Return plain text only. Do not use Markdown code fences.",
    "",
    "Teacher Inputs:",
    formattedInputs
  ].join("\n");
}
