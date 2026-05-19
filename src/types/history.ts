import type { GenerationInputs, GenerationMode } from "../utils/generateContent";

export type SavedOutputEntry = {
  createdAt: string;
  id: string;
  inputs?: GenerationInputs;
  mode: GenerationMode;
  text: string;
};
