export interface SearchResponse<T> {
  opportunities: Array<T>
  page: number
  pageSize: number
}

export interface CountResponse {
  count: number
}
