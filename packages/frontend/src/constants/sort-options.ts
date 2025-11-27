export interface SortOption {
  value: string;
  label: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {
    value: "opportunityDate_desc",
    label: "Date (plus récent)",
    sortBy: "opportunityDate",
    sortOrder: "desc",
  },
  {
    value: "opportunityDate_asc",
    label: "Date (plus ancien)",
    sortBy: "opportunityDate",
    sortOrder: "asc",
  },
];

export const LISTING_SORT_OPTIONS: SortOption[] = [
  {
    value: "opportunityDate_desc",
    label: "Date de publication (plus récent)",
    sortBy: "opportunityDate",
    sortOrder: "desc",
  },
  {
    value: "opportunityDate_asc",
    label: "Date de publication (plus ancien)",
    sortBy: "opportunityDate",
    sortOrder: "asc",
  },
  {
    value: "lastChangeDate_desc",
    label: "Dernière modification (plus récent)",
    sortBy: "lastChangeDate",
    sortOrder: "desc",
  },
  {
    value: "lastChangeDate_asc",
    label: "Dernière modification (plus ancien)",
    sortBy: "lastChangeDate",
    sortOrder: "asc",
  },
];

export const DEFAULT_SORT_VALUE = "opportunityDate_desc";
