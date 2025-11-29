interface DivisibleFilterProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

export function DivisibleFilter({ value, onChange }: DivisibleFilterProps): React.ReactElement {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="divisible-filter"
        checked={value ?? false}
        onChange={(e) => onChange(e.target.checked ? true : undefined)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor="divisible-filter" className="text-sm font-medium cursor-pointer font-heading">
        Bien divisible
      </label>
    </div>
  );
}
