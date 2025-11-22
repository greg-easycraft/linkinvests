import { EnergyClass } from "@linkinvests/shared";
import { z } from "zod";

export const addressSearchSchema = z.object({
  // DPE energy class (A-G rating) - optional
  energyClass: z.enum(EnergyClass),

  // Square footage in square meters - optional, must be positive
  squareFootage: z
    .number()
    .positive("La superficie doit être un nombre positif"),

  // 5-digit postal code - required
  zipCode: z
    .string()
    .min(1, "Le code postal est requis")
    .regex(/^\d{5}$/, "Le code postal doit contenir exactement 5 chiffres"),

  // Optional partial address for additional matching
  address: z.string().optional(),

  // Optional photo file for reference
  photo: z
    .instanceof(File)
    .refine((file) => {
      if (!file) return true; // Optional field
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      return allowedTypes.includes(file.type);
    }, "La photo doit être une image JPEG, PNG ou WebP")
    .refine((file) => {
      if (!file) return true; // Optional field
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    }, "La photo doit faire moins de 10MB")
    .optional(),
});

export type AddressSearchFormData = z.infer<typeof addressSearchSchema>;

// Energy classes constant for form select options
export const ENERGY_CLASS_OPTIONS: { value: EnergyClass; label: string; color: string }[] = [
  { value: EnergyClass.A, label: 'A', color: 'text-green-600' },
  { value: EnergyClass.B, label: 'B', color: 'text-green-500' },
  { value: EnergyClass.C, label: 'C', color: 'text-yellow-500' },
  { value: EnergyClass.D, label: 'D', color: 'text-yellow-600' },
  { value: EnergyClass.E, label: 'E', color: 'text-orange-500' },
  { value: EnergyClass.F, label: 'F', color: 'text-red-500' },
  { value: EnergyClass.G, label: 'G', color: 'text-red-600' },
];