export class Events {
  trigger(): void {}
}

export class TFile {}

export function getAllTags(cache: { allTags?: string[] }): string[] {
  return cache.allTags ?? [];
}
