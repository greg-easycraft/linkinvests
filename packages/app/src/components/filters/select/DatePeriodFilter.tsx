import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DATE_PERIOD_OPTIONS } from '@/constants'
import type { DatePeriod } from '@/types'

interface DatePeriodFilterProps {
  value?: DatePeriod
  onValueChange: (value: DatePeriod | undefined) => void
}

export function DatePeriodFilter({
  value,
  onValueChange,
}: DatePeriodFilterProps): React.ReactElement {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Période</label>
      <Select
        value={value ?? 'undefined'}
        onValueChange={(v) =>
          onValueChange(v === 'undefined' ? undefined : (v as DatePeriod))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Toutes les périodes" defaultValue={value ?? 'undefined'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="undefined">Toutes les périodes</SelectItem>
          {DATE_PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
