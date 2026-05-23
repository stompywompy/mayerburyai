import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SavedOutputEntry } from "../types/history";

const HISTORY_INDEX_KEY = "teacherforge-output-index";
const HISTORY_ENTRY_PREFIX = "teacherforge-output-entry";
const HISTORY_LIMIT = 5;

function getEntryStorageKey(id: string) {
  return `${HISTORY_ENTRY_PREFIX}:${id}`;
}

function sanitizeMode(mode: string) {
  return mode.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function sortNewestFirst(entries: SavedOutputEntry[]) {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export async function saveOutputEntry(
  entry: Omit<SavedOutputEntry, "createdAt" | "id"> & { createdAt?: string }
) {
  const createdAt = entry.createdAt ?? new Date().toISOString();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const id = `${sanitizeMode(entry.mode)}-${createdAt}-${randomSuffix}`;
  const nextEntry: SavedOutputEntry = {
    ...entry,
    createdAt,
    id
  };

  const currentEntries = await getSavedOutputEntries();
  const dedupedEntries = currentEntries.filter((item) => item.id !== id);
  const nextEntries = sortNewestFirst([nextEntry, ...dedupedEntries]).slice(
    0,
    HISTORY_LIMIT
  );
  const removedEntries = dedupedEntries.filter(
    (item) => !nextEntries.some((nextItem) => nextItem.id === item.id)
  );

  await AsyncStorage.setItem(
    getEntryStorageKey(nextEntry.id),
    JSON.stringify(nextEntry)
  );
  await AsyncStorage.setItem(
    HISTORY_INDEX_KEY,
    JSON.stringify(nextEntries.map((item) => item.id))
  );

  if (removedEntries.length > 0) {
    await AsyncStorage.multiRemove(
      removedEntries.map((item) => getEntryStorageKey(item.id))
    );
  }

  return nextEntry;
}

export async function getSavedOutputEntries() {
  const rawIndex = await AsyncStorage.getItem(HISTORY_INDEX_KEY);
  let entryIds: string[] = [];

  if (rawIndex) {
    try {
      const parsed = JSON.parse(rawIndex) as unknown;
      entryIds = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      entryIds = [];
    }
  }

  if (entryIds.length === 0) {
    return [];
  }

  const records = await AsyncStorage.multiGet(
    entryIds.map((entryId) => getEntryStorageKey(entryId))
  );

  const entries = records
    .map(([, value]) => {
      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value) as SavedOutputEntry;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is SavedOutputEntry => entry !== null);

  return sortNewestFirst(entries);
}

export function formatSavedOutputDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateString));
}
