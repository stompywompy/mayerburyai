import type { SavedOutputEntry } from "../../types/history";

export type ModeScreenProps = {
  demoModeEnabled?: boolean;
  selectedHistoryEntry?: SavedOutputEntry | null;
};
