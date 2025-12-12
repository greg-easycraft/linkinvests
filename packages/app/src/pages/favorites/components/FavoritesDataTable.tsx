import type { Column } from './columns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface FavoritesDataTableProps {
  data: Array<any>

  columns: Array<Column<any>>

  onRowClick?: (item: any) => void
}

export function FavoritesDataTable({
  data,
  columns,
  onRowClick,
}: FavoritesDataTableProps): React.ReactElement {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            className={cn(onRowClick && 'cursor-pointer')}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {col.cell(item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
