import { useState } from "react";

import type { SavedOutputEntry } from "../types/history";
import {
  type GenerationInputs,
  type GenerationMode,
  generateContent
} from "../utils/generateContent";
import { saveOutputEntry } from "../utils/outputHistory";

export function useGenerator(mode: GenerationMode) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastInputs, setLastInputs] = useState<GenerationInputs | null>(null);
  const [lastSavedEntry, setLastSavedEntry] = useState<SavedOutputEntry | null>(
    null
  );
  const [result, setResult] = useState("");

  const runGeneration = async (inputs: GenerationInputs) => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const nextResult = await generateContent(mode, inputs);
      setResult(nextResult);

      try {
        const savedEntry = await saveOutputEntry({
          inputs,
          mode,
          text: nextResult
        });
        setLastSavedEntry(savedEntry);
      } catch {
        // Save failed but content was generated — still show it
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate content."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generate = async (inputs: GenerationInputs) => {
    setLastInputs(inputs);
    await runGeneration(inputs);
  };

  const regenerate = async () => {
    if (!lastInputs) {
      return;
    }

    await runGeneration(lastInputs);
  };

  return {
    canRegenerate: lastInputs !== null,
    error,
    generate,
    isLoading,
    lastSavedEntry,
    regenerate,
    result
  };
}
