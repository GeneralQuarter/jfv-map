export type SearchEntry = {
  id: string;
  primaryText: string;
  secondaryText?: string;
  tertiaryText?: string;
  searchTerms: string[];
}

export type SearchEntryGroup = {
  id: string;
  headerText: string;
  entries: SearchEntry[];
}
