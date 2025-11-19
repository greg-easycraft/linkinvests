"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { addressSearchSchema, type AddressSearchFormData, ENERGY_CLASS_OPTIONS } from "~/utils/validation/address-search.schema";
import type { AddressSearchInput } from "@linkinvests/shared";

interface AddressSearchFormProps {
  onSubmit: (data: AddressSearchInput) => Promise<void>;
  isLoading?: boolean;
}

export function AddressSearchForm({ onSubmit, isLoading = false }: AddressSearchFormProps) {
  const [photoFile, setPhotoFile] = useState<File | undefined>();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressSearchFormData>({
    resolver: zodResolver(addressSearchSchema),
    mode: 'onChange',
  });

  const watchEnergyClass = watch('energyClass');

  const handleFormSubmit = async (data: AddressSearchFormData) => {
    // Convert form data to AddressSearchInput
    const searchInput: AddressSearchInput = {
      dpe: data.energyClass,
      squareFootage: data.squareFootage,
      zipCode: data.zipCode,
      address: data.address?.trim() || undefined,
      photo: photoFile,
    };

    await onSubmit(searchInput);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setValue('photo', file, { shouldValidate: true, shouldDirty: true });
    } else {
      setPhotoFile(undefined);
      setValue('photo', undefined, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[var(--secundary)] border-[var(--secundary)]">
      <CardHeader>
        <CardTitle>Recherche d&apos;Adresse par Diagnostic Énergétique</CardTitle>
        <CardDescription>
          Entrez les critères de propriété pour trouver des adresses correspondantes basées sur les données de diagnostic énergétique.
          Tous les champs sauf le code postal sont optionnels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DPE Energy Class */}
          <div className="space-y-2">
            <label htmlFor="dpe" className="text-sm font-medium text-gray-700">
              Classe Énergétique DPE
            </label>
            <Select
              value={watchEnergyClass || ""}
              onValueChange={(value) =>
                setValue('energyClass', value as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G', { shouldValidate: true, shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez la classe énergétique (optionnel)" />
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
              <p className="text-sm text-red-600">{errors.energyClass.message}</p>
            )}
          </div>

          {/* Square Footage */}
          <div className="space-y-2">
            <label htmlFor="squareFootage" className="text-sm font-medium text-gray-700">
              Superficie (m²)
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
              <p className="text-sm text-red-600">{errors.squareFootage.message}</p>
            )}
          </div>

          {/* Zip Code (Required) */}
          <div className="space-y-2">
            <label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
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

          {/* Optional Photo */}
          <div className="space-y-2">
            <label htmlFor="photo" className="text-sm font-medium text-gray-700">
              Photo de la Propriété
            </label>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
            />
            <p className="text-xs text-gray-500">
              Formats : JPEG, PNG, WebP (max 10MB)
            </p>
            {photoFile && (
              <div className="text-sm text-green-600">
                Sélectionné : {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            {errors.photo && (
              <p className="text-sm text-red-600">{errors.photo.message}</p>
            )}
          </div>
          </div>

          {/* Full Width Fields */}
          {/* Optional Address - Full Width */}
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gray-700">
              Adresse Partielle
            </label>
            <Input
              id="address"
              type="text"
              placeholder="Entrez le nom de rue ou une adresse partielle (optionnel)"
              {...register('address')}
            />
            <p className="text-xs text-gray-500">
              Ajouter des informations d&apos;adresse partielle peut aider à améliorer la précision de correspondance.
            </p>
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recherche en cours...
              </>
            ) : (
              'Rechercher des Adresses'
            )}
          </Button>

          {/* Form Requirements */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>* Champs requis</p>
            <p>
              Cette recherche utilise les données de diagnostic énergétique existantes pour trouver des correspondances d&apos;adresse potentielles.
              Des critères plus spécifiques donneront des résultats plus précis.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}