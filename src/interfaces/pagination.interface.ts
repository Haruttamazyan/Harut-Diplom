export interface IPaginationQuery {
  offset: number;
  limit: number;
}

export interface IPaginated<T> {
  items: T[];
  count: number;
}
