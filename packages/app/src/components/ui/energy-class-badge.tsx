import type { EnergyClassType } from '@linkinvests/shared'
import { getEnergyClassBgColor, getEnergyClassColor } from '@/constants'

interface EnergyClassBadgeProps {
  energyClass?: EnergyClassType | string
  size?: 'sm' | 'md' | 'lg'
}

export function EnergyClassBadge({
  energyClass,
  size = 'sm',
}: EnergyClassBadgeProps): React.ReactElement {
  if (!energyClass || energyClass === 'UNKNOWN') {
    return (
      <span
        className={`
          inline-flex items-center justify-center font-bold rounded
          ${size === 'sm' ? 'w-6 h-6 text-xs' : ''}
          ${size === 'md' ? 'w-8 h-8 text-sm' : ''}
          ${size === 'lg' ? 'w-10 h-10 text-base' : ''}
          bg-gray-100 text-gray-500
        `}
      >
        NC
      </span>
    )
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center font-bold rounded
        ${size === 'sm' ? 'w-6 h-6 text-xs' : ''}
        ${size === 'md' ? 'w-8 h-8 text-sm' : ''}
        ${size === 'lg' ? 'w-10 h-10 text-base' : ''}
      `}
      style={{
        backgroundColor: getEnergyClassBgColor(energyClass),
        color: getEnergyClassColor(energyClass),
      }}
    >
      {energyClass}
    </span>
  )
}
