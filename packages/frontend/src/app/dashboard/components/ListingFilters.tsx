"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { DepartmentsInput } from "~/components/ui/departments-input";
import { ZipCodeInput } from "~/components/ui/zip-code-input";
import { Input } from "~/components/ui/input";
import { OpportunityType } from "@linkinvests/shared";
import type { DatePeriod, EnergyClass, ListingFilters as IListingFilters } from "~/types/filters";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ViewToggle } from "./ViewToggle";

type ViewType = "list" | "map";

interface ListingFiltersProps {
  filters: IListingFilters;
  onFiltersChange: (filters: IListingFilters) => void;
  onFiltersApply: (filters: IListingFilters) => void;
  onReset: () => void;
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  currentType: OpportunityType;
  onTypeChange: (type: OpportunityType) => void;
}

// @ts-expect-error - TODO: Add real estate listing and divorce types
const TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "Succession",
  [OpportunityType.LIQUIDATION]: "Liquidation",
  [OpportunityType.ENERGY_SIEVE]: "Passoire énergétique",
  [OpportunityType.REAL_ESTATE_LISTING]: "Annonce immobilière",
  [OpportunityType.AUCTION]: "Vente aux enchères",
  // [OpportunityType.DIVORCE]: "Divorce",
};

// Custom order for dropdown display - Succession last
const TYPE_DISPLAY_ORDER: OpportunityType[] = [
  OpportunityType.LIQUIDATION,
  OpportunityType.ENERGY_SIEVE,
  OpportunityType.REAL_ESTATE_LISTING,
  OpportunityType.AUCTION,
  OpportunityType.SUCCESSION, // Last
];

// Transaction types for listings
const TRANSACTION_TYPE_OPTIONS = [
  { value: 'VENTE', label: 'Vente' },
  { value: 'VENTE_EN_L_ETAT_FUTUR_D_ACHEVEMENT', label: 'VEFA' },
  { value: 'VENTE_AUX_ENCHERES', label: 'Enchères' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'LOCATION_VENTE', label: 'Location-vente' },
];

// Property types for listings
const PROPERTY_TYPE_OPTIONS = [
  { value: 'APP', label: 'Appartement' },
  { value: 'MAI', label: 'Maison' },
  { value: 'TER', label: 'Terrain' },
  { value: 'LOC', label: 'Local commercial' },
  { value: 'IMM', label: 'Immeuble' },
  { value: 'GAR', label: 'Garage/Parking' },
  { value: 'CAV', label: 'Cave' },
  { value: 'BOX', label: 'Box' },
];

// Energy classes with labels (reusing from EnergyDiagnosticFilters)
const ENERGY_CLASSES: { value: EnergyClass; label: string; color: string }[] = [
  { value: 'A', label: 'A (Très économe)', color: 'text-green-600' },
  { value: 'B', label: 'B (Économe)', color: 'text-green-500' },
  { value: 'C', label: 'C (Conventionnel)', color: 'text-yellow-500' },
  { value: 'D', label: 'D (Peu économe)', color: 'text-orange-400' },
  { value: 'E', label: 'E (Peu économe)', color: 'text-orange-600' },
  { value: 'F', label: 'F (Énergivore)', color: 'text-red-500' },
  { value: 'G', label: 'G (Très énergivore)', color: 'text-red-700' },
];

// Features options
const FEATURES_OPTIONS = [
  { key: 'balcony', label: 'Balcon' },
  { key: 'terrace', label: 'Terrasse' },
  { key: 'garden', label: 'Jardin' },
  { key: 'garage', label: 'Garage' },
  { key: 'parking', label: 'Parking' },
  { key: 'elevator', label: 'Ascenseur' },
];

export function ListingFilters({
  filters,
  onFiltersChange,
  onFiltersApply,
  onReset,
  viewType,
  onViewTypeChange,
  currentType,
  onTypeChange,
}: ListingFiltersProps): React.ReactElement {

  // filters is already IListingFilters type
  const listingFilters = filters;

  // Debounce filter changes and auto-apply after 500ms of no changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFiltersApply(filters);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, onFiltersApply]);

  const handleDepartmentChange = (selectedValues: string[]): void => {
    onFiltersChange({ ...filters, departments: selectedValues } as IListingFilters);
  };

  const handleZipCodeChange = (zipCodes: string[]): void => {
    onFiltersChange({ ...filters, zipCodes } as IListingFilters);
  };

  const handleTypeChange = (value: string): void => {
    if (value && Object.values(OpportunityType).includes(value as OpportunityType)) {
      onTypeChange(value as OpportunityType);
    }
  };

  const handleDatePeriodChange = (value: string): void => {
    const datePeriod = value === "" ? undefined : (value as DatePeriod);
    onFiltersChange({ ...filters, datePeriod, dateRange: undefined } as IListingFilters);
  };

  // Transaction type handlers
  const handleTransactionTypeChange = (value: string): void => {
    const currentTypes = listingFilters.transactionTypes ?? [];
    const updatedTypes = currentTypes.includes(value)
      ? currentTypes.filter(t => t !== value)
      : [...currentTypes, value];

    onFiltersChange({ ...filters, transactionTypes: updatedTypes.length > 0 ? updatedTypes : undefined } as IListingFilters);
  };

  // Property type handlers
  const handlePropertyTypeChange = (value: string): void => {
    const currentTypes = listingFilters.propertyTypes ?? [];
    const updatedTypes = currentTypes.includes(value)
      ? currentTypes.filter(t => t !== value)
      : [...currentTypes, value];

    onFiltersChange({ ...filters, propertyTypes: updatedTypes.length > 0 ? updatedTypes : undefined } as IListingFilters);
  };

  // Range handlers
  const handlePriceRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = listingFilters.priceRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;
    onFiltersChange({ ...filters, priceRange: rangeToSet } as IListingFilters);
  };

  const handleSquareFootageRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = listingFilters.squareFootageRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;
    onFiltersChange({ ...filters, squareFootageRange: rangeToSet } as IListingFilters);
  };

  const handleLandAreaRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = listingFilters.landAreaRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;
    onFiltersChange({ ...filters, landAreaRange: rangeToSet } as IListingFilters);
  };

  const handleRoomsRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = listingFilters.roomsRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;
    onFiltersChange({ ...filters, roomsRange: rangeToSet } as IListingFilters);
  };

  const handleBedroomsRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = listingFilters.bedroomsRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;
    onFiltersChange({ ...filters, bedroomsRange: rangeToSet } as IListingFilters);
  };

  const handleConstructionYearRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = listingFilters.constructionYearRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;
    onFiltersChange({ ...filters, constructionYearRange: rangeToSet } as IListingFilters);
  };

  // Energy class handlers (DPE)
  const handleDpeChange = (energyClass: EnergyClass, checked: boolean): void => {
    const currentClasses = listingFilters.dpe ?? [];
    const updatedClasses = checked
      ? [...currentClasses, energyClass]
      : currentClasses.filter(c => c !== energyClass);

    onFiltersChange({ ...filters, dpe: updatedClasses.length > 0 ? updatedClasses : undefined } as IListingFilters);
  };

  // Features handlers
  const handleFeatureChange = (featureKey: string, checked: boolean): void => {
    const currentFeatures = listingFilters.features ?? {};
    const updatedFeatures = { ...currentFeatures, [featureKey]: checked ? true : undefined };

    // Remove the feature if unchecked
    if (!checked) {
      delete updatedFeatures[featureKey as keyof typeof updatedFeatures];
    }

    // Remove features object if empty
    const hasAnyFeatures = Object.keys(updatedFeatures).length > 0;
    onFiltersChange({ ...filters, features: hasAnyFeatures ? updatedFeatures : undefined } as IListingFilters);
  };

  return (
    <Card className="bg-[var(--secundary)] text-[var(--primary)] h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        {/* View Toggle */}
        <div>
          <ViewToggle value={viewType} onValueChange={onViewTypeChange} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Type Filter - Single select */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Type d&apos;opportunité</label>
            <Select
              value={currentType}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {TYPE_DISPLAY_ORDER.map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Type de transaction</label>
            <Select onValueChange={handleTransactionTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {listingFilters.transactionTypes && listingFilters.transactionTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {listingFilters.transactionTypes.map((type) => {
                  const option = TRANSACTION_TYPE_OPTIONS.find(o => o.value === type);
                  return (
                    <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {option?.label ?? type}
                      <button
                        onClick={() => handleTransactionTypeChange(type)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Type de bien</label>
            <Select onValueChange={handlePropertyTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {listingFilters.propertyTypes && listingFilters.propertyTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {listingFilters.propertyTypes.map((type) => {
                  const option = PROPERTY_TYPE_OPTIONS.find(o => o.value === type);
                  return (
                    <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {option?.label ?? type}
                      <button
                        onClick={() => handlePropertyTypeChange(type)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Prix (€)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Prix min"
                value={listingFilters.priceRange?.min ?? ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Prix max"
                value={listingFilters.priceRange?.max ?? ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Square Footage Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Surface (m²)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={listingFilters.squareFootageRange?.min ?? ''}
                onChange={(e) => handleSquareFootageRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={listingFilters.squareFootageRange?.max ?? ''}
                onChange={(e) => handleSquareFootageRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Land Area Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Surface terrain (m²)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={listingFilters.landAreaRange?.min ?? ''}
                onChange={(e) => handleLandAreaRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={listingFilters.landAreaRange?.max ?? ''}
                onChange={(e) => handleLandAreaRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Rooms Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Nombre de pièces</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={listingFilters.roomsRange?.min ?? ''}
                onChange={(e) => handleRoomsRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={listingFilters.roomsRange?.max ?? ''}
                onChange={(e) => handleRoomsRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Bedrooms Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Nombre de chambres</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={listingFilters.bedroomsRange?.min ?? ''}
                onChange={(e) => handleBedroomsRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={listingFilters.bedroomsRange?.max ?? ''}
                onChange={(e) => handleBedroomsRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Construction Year Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Année de construction</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={listingFilters.constructionYearRange?.min ?? ''}
                onChange={(e) => handleConstructionYearRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={listingFilters.constructionYearRange?.max ?? ''}
                onChange={(e) => handleConstructionYearRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* DPE Filter - Energy classes checkboxes */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Diagnostic énergétique (DPE)</label>
            <div className="space-y-2">
              {ENERGY_CLASSES.map((energyClass) => {
                const isChecked = listingFilters.dpe?.includes(energyClass.value) ?? false;
                return (
                  <div key={energyClass.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`dpe-${energyClass.value}`}
                      checked={isChecked}
                      onChange={(e) => handleDpeChange(energyClass.value, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`dpe-${energyClass.value}`}
                      className={`text-sm cursor-pointer ${energyClass.color} font-medium`}
                    >
                      {energyClass.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Filter - Boolean checkboxes */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Équipements</label>
            <div className="space-y-2">
              {FEATURES_OPTIONS.map((feature) => {
                const isChecked = listingFilters.features?.[feature.key as keyof typeof listingFilters.features] ?? false;
                return (
                  <div key={feature.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`feature-${feature.key}`}
                      checked={isChecked}
                      onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`feature-${feature.key}`}
                      className="text-sm cursor-pointer font-medium"
                    >
                      {feature.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Filter - Custom input with search */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Départements</label>
            <DepartmentsInput
              value={filters.departments?.map(String) ?? []}
              onChange={handleDepartmentChange}
              placeholder="Rechercher par numéro ou nom..."
            />
          </div>

          {/* Zip Code Filter - Custom input */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Codes postaux</label>
            <ZipCodeInput
              value={filters.zipCodes ?? []}
              onChange={handleZipCodeChange}
              placeholder="Entrez un code postal"
            />
          </div>

          {/* Date Period Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Opportunités depuis</label>
            <Select
              value={filters.datePeriod ?? ""}
              onValueChange={handleDatePeriodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les opportunités" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      {/* Fixed Action Buttons */}
      <div className="flex-shrink-0 p-6 pt-0">
        <div className="flex gap-2">
          <Button onClick={onReset} variant="outline" className="flex-1">
            Réinitialiser
          </Button>
        </div>
      </div>
    </Card>
  );
}