import type { DatePeriod } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DATE_PERIOD_OPTIONS } from '@/constants'

interface DatePeriodFilterProps {
  value?: DatePeriod
  onValueChange: (value: DatePeriod | undefined) => void
  label?: string
  placeholder?: string
}

export function DatePeriodFilter({
  value,
  onValueChange,
  label = 'Période',
  placeholder = 'Toutes les périodes',
}: DatePeriodFilterProps): React.ReactElement {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <Select
        value={value ?? 'undefined'}
        onValueChange={(v) =>
          onValueChange(v === 'undefined' ? undefined : (v as DatePeriod))
        }
      >
        <SelectTrigger>
          <SelectValue
            placeholder={placeholder}
            defaultValue={value ?? 'undefined'}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="undefined">{placeholder}</SelectItem>
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
