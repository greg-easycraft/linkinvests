import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import type { AddressSearchInput } from '@/api/addresses.api'
import type { EnergyClass } from '@/types'
import type { AddressSearchFormData } from '@/utils/validation/address-search.schema'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ENERGY_CLASS_OPTIONS,
  addressSearchSchema,
} from '@/utils/validation/address-search.schema'

interface AddressSearchFormProps {
  onSubmit: (data: AddressSearchInput) => Promise<void>
  isLoading?: boolean
}

export function AddressSearchForm({
  onSubmit,
  isLoading = false,
}: AddressSearchFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressSearchFormData>({
    resolver: zodResolver(addressSearchSchema),
    mode: 'onChange',
  })

  const watchEnergyClass = watch('energyClass')

  const handleFormSubmit = async (data: AddressSearchFormData) => {
    const searchInput: AddressSearchInput = {
      energyClass: data.energyClass,
      squareFootage: data.squareFootage,
      zipCode: data.zipCode,
      address: data.address?.trim() || undefined,
    }

    await onSubmit(searchInput)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Recherche d'Adresse par Diagnostic Énergétique</CardTitle>
        <CardDescription>
          Entrez les critères de propriété pour trouver des adresses
          correspondantes basées sur les données de diagnostic énergétique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DPE Energy Class */}
            <div className="space-y-2">
              <label htmlFor="energyClass" className="text-sm font-medium">
                Classe Énergétique DPE <span className="text-red-500">*</span>
              </label>
              <Select
                value={watchEnergyClass}
                onValueChange={(value) =>
                  setValue('energyClass', value as EnergyClass, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la classe énergétique" />
                </SelectTrigger>
                <SelectContent>
                  {ENERGY_CLASS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={`font-medium ${option.color}`}>
                        Classe {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.energyClass && (
                <p className="text-sm text-red-600">
                  {errors.energyClass.message}
                </p>
              )}
            </div>

            {/* Square Footage */}
            <div className="space-y-2">
              <label htmlFor="squareFootage" className="text-sm font-medium">
                Superficie (m²) <span className="text-red-500">*</span>
              </label>
              <Input
                id="squareFootage"
                type="number"
                min="1"
                step="1"
                placeholder="Entrez la superficie en mètres carrés"
                {...register('squareFootage', { valueAsNumber: true })}
              />
              {errors.squareFootage && (
                <p className="text-sm text-red-600">
                  {errors.squareFootage.message}
                </p>
              )}
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <label htmlFor="zipCode" className="text-sm font-medium">
                Code Postal <span className="text-red-500">*</span>
              </label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Entrez le code postal à 5 chiffres"
                maxLength={5}
                {...register('zipCode')}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600">{errors.zipCode.message}</p>
              )}
            </div>

            {/* Optional Address */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Adresse Partielle
              </label>
              <Input
                id="address"
                type="text"
                placeholder="Nom de rue ou adresse partielle (optionnel)"
                {...register('address')}
              />
              <p className="text-xs text-muted-foreground">
                Ajouter une adresse partielle peut améliorer la précision.
              </p>
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recherche en cours...
              </>
            ) : (
              'Rechercher des Adresses'
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            <p>
              <span className="text-red-500">*</span> Champs requis
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
