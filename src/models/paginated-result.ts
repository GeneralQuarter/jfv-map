export interface PaginatedResult<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}
