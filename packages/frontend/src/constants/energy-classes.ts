import { EnergyClass } from "@linkinvests/shared";

// Energy class colors and labels
export const ENERGY_CLASS_INFO: Record<EnergyClass, { color: string; label: string }> = {
    'A': { color: 'green-600', label: 'Très performant' },
    'B': { color: 'green-500', label: 'Performant' },
    'C': { color: 'yellow-500', label: 'Assez performant' },
    'D': { color: 'orange-500', label: 'Peu performant' },
    'E': { color: 'orange-500', label: 'Peu performant' },
    'F': { color: 'red-500', label: 'Très peu performant' },
    'G': { color: 'red-600', label: 'Extrêmement peu performant' },
};