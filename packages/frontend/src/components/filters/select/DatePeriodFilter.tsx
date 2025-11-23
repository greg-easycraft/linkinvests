"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import type { DatePeriod, DatePeriodOption } from "~/types/filters";

interface DatePeriodFilterProps {
  value?: DatePeriod;
  onChange: (value: DatePeriod | undefined) => void;
  label?: string;
  placeholder?: string;
  datePeriodOptions?: DatePeriodOption[];
}

export function DatePeriodFilter({
  value,
  onChange,
  label = "Opportunités depuis",
  placeholder = "Toutes les opportunités",
  datePeriodOptions = DATE_PERIOD_OPTIONS,
}: DatePeriodFilterProps): React.ReactElement {

  const handleChange = (selectedValue: string): void => {
    if (selectedValue === "") {
      onChange(undefined);
    } else {
      onChange(selectedValue as DatePeriod);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">{label}</label>
      <Select
        value={value ?? ""}
        onValueChange={handleChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {datePeriodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}