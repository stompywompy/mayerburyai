export type ItemChoice = {
  letter: string;
  text: string;
};

export type ResolvedQuestionItem = {
  stem: string;
  choices: ItemChoice[];
};

/** Split inline "stem A) one B) two" into stem + lettered choices. */
export function splitInlineChoices(text: string): ResolvedQuestionItem | null {
  const normalized = text.replace(/\s+/g, " ").trim();
  const parts = normalized.split(/\s+(?=[A-E][).]\s*)/i);

  if (parts.length < 2) {
    return null;
  }

  const stem = parts[0].trim();
  const choices: ItemChoice[] = [];

  for (let index = 1; index < parts.length; index += 1) {
    const match = parts[index].match(/^([A-E])[).]\s*(.+)$/i);
    if (match?.[1] && match[2]) {
      choices.push({
        letter: match[1].toUpperCase(),
        text: match[2].trim()
      });
    }
  }

  if (choices.length < 2) {
    return null;
  }

  return { stem, choices };
}

export function resolveItemDisplay(item: {
  text: string;
  choices?: ItemChoice[];
}): ResolvedQuestionItem {
  if (item.choices && item.choices.length > 0) {
    return { stem: item.text.trim(), choices: item.choices };
  }

  const inline = splitInlineChoices(item.text);
  if (inline) {
    return inline;
  }

  return { stem: item.text, choices: [] };
}

export function isQuestionSection(title: string) {
  return /problems?|questions?/i.test(title);
}
