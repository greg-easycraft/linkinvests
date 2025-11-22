import { EnergyClass } from "@linkinvests/shared";
import { ENERGY_CLASS_INFO } from "~/constants/energy-classes";


export const EnergyClassBadge = ({ energyClass }: { energyClass: EnergyClass }) => {
    const energyClassInfo = ENERGY_CLASS_INFO[energyClass as EnergyClass];
    return (
        <div className={`
        inline-flex items-center rounded-full 
        px-2.5 py-0.5 text-xs font-semibold 
        bg-${energyClassInfo?.color ?? '[var(--primary)]'}
      `}>
            {energyClass}
        </div>
    )
}