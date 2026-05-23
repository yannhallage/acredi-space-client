export interface ApiCollection<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
}

export interface ApiMessage {
  message: string
}
