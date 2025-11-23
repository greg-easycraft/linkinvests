"use client";

export interface CheckboxOption<T = string> {
  value: T;
  label: string;
  color?: string; // Optional CSS class for colored labels
}

interface MultiCheckboxFilterProps<T = string> {
  label: string;
  options: readonly CheckboxOption<T>[];
  value?: T[];
  onChange: (value: T[] | undefined) => void;
  idPrefix?: string; // Prefix for input IDs to ensure uniqueness
}

export function MultiCheckboxFilter<T extends string = string>({
  label,
  options,
  value = [],
  onChange,
  idPrefix = 'checkbox',
}: MultiCheckboxFilterProps<T>): React.ReactElement {

  const handleCheckboxChange = (optionValue: T, checked: boolean): void => {
    const currentValues = value ?? [];
    const updatedValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter(v => v !== optionValue);

    onChange(updatedValues.length > 0 ? updatedValues : undefined);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">{label}</label>
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = value?.includes(option.value) ?? false;
          const inputId = `${idPrefix}-${String(option.value)}`;

          return (
            <div key={String(option.value)} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={inputId}
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={inputId}
                className={`text-sm cursor-pointer font-medium ${option.color || ''}`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}