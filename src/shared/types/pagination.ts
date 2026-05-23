export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SearchParams extends PaginationParams {
  search?: string
}
