export interface NoteFilterSettings {
  includedFolders: string[];
  excludedFolders: string[];
  includedTags: string[];
  excludedTags: string[];
}

export function matchesNoteFilters(path: string, tags: string[], settings: NoteFilterSettings): boolean {
  if (settings.excludedFolders.some((folder) => isPathInFolder(path, folder))) return false;
  if (settings.includedFolders.length > 0 && !settings.includedFolders.some((folder) => isPathInFolder(path, folder))) {
    return false;
  }

  const normalizedTags = tags.map(normalizeTag).filter(Boolean);
  if (settings.excludedTags.some((tag) => normalizedTags.some((noteTag) => tagMatches(noteTag, tag)))) return false;
  if (settings.includedTags.length > 0 &&
      !settings.includedTags.some((tag) => normalizedTags.some((noteTag) => tagMatches(noteTag, tag)))) {
    return false;
  }
  return true;
}

function isPathInFolder(path: string, folder: string): boolean {
  const normalizedPath = normalizePath(path);
  const normalizedFolder = normalizePath(folder).replace(/^\/+|\/+$/g, "");
  return normalizedFolder.length > 0 &&
    (normalizedPath === normalizedFolder || normalizedPath.startsWith(`${normalizedFolder}/`));
}

function normalizePath(value: string): string {
  return value.trim().replace(/\\/g, "/").replace(/\/{2,}/g, "/");
}

function normalizeTag(value: string): string {
  return value.trim().replace(/^#/, "").toLocaleLowerCase();
}

function tagMatches(noteTag: string, filterTag: string): boolean {
  const normalizedFilter = normalizeTag(filterTag);
  return normalizedFilter.length > 0 &&
    (noteTag === normalizedFilter || noteTag.startsWith(`${normalizedFilter}/`));
}
