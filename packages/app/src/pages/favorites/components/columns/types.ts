export interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
}
