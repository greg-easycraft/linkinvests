import type { EnergyClassType } from '@/types'
import { UNKNOWN_ENERGY_CLASS } from '@/types'
import { ENERGY_CLASS_OPTIONS } from '@/constants'

interface EnergyClassFilterProps {
  value?: Array<EnergyClassType>
  onValueChange: (value: Array<EnergyClassType> | undefined) => void
  /** If true, only show E, F, G classes (for energy sieves) */
  energySievesOnly?: boolean
}

export function EnergyClassFilter({
  value,
  onValueChange,
  energySievesOnly = false,
}: EnergyClassFilterProps): React.ReactElement {
  const currentValue = value ?? []
  const options = energySievesOnly
    ? ENERGY_CLASS_OPTIONS.filter((opt) => ['E', 'F', 'G'].includes(opt.value))
    : ENERGY_CLASS_OPTIONS

  const handleToggle = (energyClass: EnergyClassType) => {
    const newValues = currentValue.includes(energyClass)
      ? currentValue.filter((v) => v !== energyClass)
      : [...currentValue, energyClass]

    onValueChange(newValues.length > 0 ? newValues : undefined)
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Classe énergétique
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`
              w-8 h-8 rounded font-bold text-sm transition-all
              ${
                currentValue.includes(option.value)
                  ? 'ring-2 ring-offset-2 ring-primary'
                  : 'opacity-60 hover:opacity-100'
              }
            `}
            style={{
              backgroundColor: option.bgColor,
              color: option.color,
            }}
          >
            {option.label}
          </button>
        ))}
        {!energySievesOnly && (
          <button
            onClick={() => handleToggle(UNKNOWN_ENERGY_CLASS)}
            className={`
              px-2 h-8 rounded font-bold text-sm transition-all bg-gray-100 text-gray-600
              ${
                currentValue.includes(UNKNOWN_ENERGY_CLASS)
                  ? 'ring-2 ring-offset-2 ring-primary'
                  : 'opacity-60 hover:opacity-100'
              }
            `}
          >
            NC
          </button>
        )}
      </div>
    </div>
  )
}
