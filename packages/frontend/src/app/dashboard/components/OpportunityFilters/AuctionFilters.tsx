"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { DepartmentsInput } from "~/components/ui/departments-input";
import { ZipCodeInput } from "~/components/ui/zip-code-input";
import { Input } from "~/components/ui/input";
import { OpportunityType } from "@linkinvests/shared";
import type { DatePeriod, AuctionFilters as IAuctionFilters } from "~/types/filters";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ViewToggle } from "../ViewToggle";

type ViewType = "list" | "map";

interface AuctionFiltersProps {
  filters: IAuctionFilters;
  onFiltersChange: (filters: IAuctionFilters) => void;
  onFiltersApply: (filters: IAuctionFilters) => void;
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

// Common auction types
const AUCTION_TYPE_OPTIONS = [
  { value: 'judicial', label: 'Vente judiciaire' },
  { value: 'voluntary', label: 'Vente volontaire' },
  { value: 'notarial', label: 'Vente notariale' },
  { value: 'domainial', label: 'Vente domaniale' },
];

// Common property types
const PROPERTY_TYPE_OPTIONS = [
  { value: 'house', label: 'Maison' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'land', label: 'Terrain' },
  { value: 'commercial', label: 'Local commercial' },
  { value: 'industrial', label: 'Industriel' },
  { value: 'garage', label: 'Garage/Parking' },
];

export function AuctionFilters({
  filters,
  onFiltersChange,
  onFiltersApply,
  onReset,
  viewType,
  onViewTypeChange,
  currentType,
  onTypeChange,
}: AuctionFiltersProps): React.ReactElement {

  // filters is already IAuctionFilters type
  const auctionFilters = filters;

  // Debounce filter changes and auto-apply after 500ms of no changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFiltersApply(filters);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, onFiltersApply]);

  const handleDepartmentChange = (selectedValues: string[]): void => {
    onFiltersChange({ ...filters, departments: selectedValues } as IAuctionFilters);
  };

  const handleZipCodeChange = (zipCodes: string[]): void => {
    onFiltersChange({ ...filters, zipCodes } as IAuctionFilters);
  };

  const handleTypeChange = (value: string): void => {
    if (value && Object.values(OpportunityType).includes(value as OpportunityType)) {
      onTypeChange(value as OpportunityType);
    }
  };

  const handleDatePeriodChange = (value: string): void => {
    const datePeriod = value === "" ? undefined : (value as DatePeriod);
    onFiltersChange({ ...filters, datePeriod, dateRange: undefined } as IAuctionFilters); // Clear old dateRange when using period
  };

  const handleAuctionTypeChange = (value: string): void => {
    const currentTypes = auctionFilters.auctionTypes ?? [];
    const updatedTypes = currentTypes.includes(value)
      ? currentTypes.filter(t => t !== value)
      : [...currentTypes, value];

    onFiltersChange({ ...filters, auctionTypes: updatedTypes.length > 0 ? updatedTypes : undefined } as IAuctionFilters);
  };

  const handlePropertyTypeChange = (value: string): void => {
    const currentTypes = auctionFilters.propertyTypes ?? [];
    const updatedTypes = currentTypes.includes(value)
      ? currentTypes.filter(t => t !== value)
      : [...currentTypes, value];

    onFiltersChange({ ...filters, propertyTypes: updatedTypes.length > 0 ? updatedTypes : undefined } as IAuctionFilters);
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = auctionFilters.priceRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, priceRange: rangeToSet } as IAuctionFilters);
  };

  const handleReservePriceRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = auctionFilters.reservePriceRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, reservePriceRange: rangeToSet } as IAuctionFilters);
  };

  const handleSquareFootageRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = auctionFilters.squareFootageRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, squareFootageRange: rangeToSet } as IAuctionFilters);
  };

  const handleRoomsRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = auctionFilters.roomsRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, roomsRange: rangeToSet } as IAuctionFilters);
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

          {/* Auction Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Type d&apos;enchère</label>
            <Select onValueChange={handleAuctionTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                {AUCTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {auctionFilters.auctionTypes && auctionFilters.auctionTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {auctionFilters.auctionTypes.map((type) => {
                  const option = AUCTION_TYPE_OPTIONS.find(o => o.value === type);
                  return (
                    <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {option?.label ?? type}
                      <button
                        onClick={() => handleAuctionTypeChange(type)}
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
            {auctionFilters.propertyTypes && auctionFilters.propertyTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {auctionFilters.propertyTypes.map((type) => {
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
                value={auctionFilters.priceRange?.min ?? ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Prix max"
                value={auctionFilters.priceRange?.max ?? ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Reserve Price Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block font-heading">Prix de réserve (€)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={auctionFilters.reservePriceRange?.min ?? ''}
                onChange={(e) => handleReservePriceRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={auctionFilters.reservePriceRange?.max ?? ''}
                onChange={(e) => handleReservePriceRangeChange('max', e.target.value)}
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
                value={auctionFilters.squareFootageRange?.min ?? ''}
                onChange={(e) => handleSquareFootageRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={auctionFilters.squareFootageRange?.max ?? ''}
                onChange={(e) => handleSquareFootageRangeChange('max', e.target.value)}
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
                value={auctionFilters.roomsRange?.min ?? ''}
                onChange={(e) => handleRoomsRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={auctionFilters.roomsRange?.max ?? ''}
                onChange={(e) => handleRoomsRangeChange('max', e.target.value)}
              />
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