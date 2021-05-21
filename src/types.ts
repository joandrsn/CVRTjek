export type VATQuery = {
  vat: string;
}

export type SearchQuery = {
  search: string;
}

export type cvrapiResponse = {
  slug: string;
  vat: string;
}

export type cvrapiError = {
  error: string;
}

export enum ResultOption {
  QUOTA_EXCEEDED,
  MATCH,
  NO_MATCH,
  NOT_FOUND
}

export type SearchResult = {
  result: ResultOption;
  data: cvrapiError | cvrapiResponse | undefined;
}