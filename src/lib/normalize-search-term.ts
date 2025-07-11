export function normalizeSearchTerm(term: string): string {
  return term
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function normalizeSearchTerms(terms: string[]): string[] {
  return terms.map(normalizeSearchTerm);
}
