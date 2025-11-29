interface WorksRequiredFilterProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

export function WorksRequiredFilter({ value, onChange }: WorksRequiredFilterProps): React.ReactElement {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="works-required-filter"
        checked={value ?? false}
        onChange={(e) => onChange(e.target.checked ? true : undefined)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor="works-required-filter" className="text-sm font-medium cursor-pointer font-heading">
        Requiert travaux
      </label>
    </div>
  );
}
