"use client";

import { Input } from "~/components/ui/input";
import { OpportunityType } from "@linkinvests/shared";
import type { AuctionFilters as IAuctionFilters } from "~/types/filters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { BaseFilters } from "./BaseFilters";
import { RENTAL_STATUS_OPTIONS } from "~/constants/filters";

interface AuctionFiltersProps {
  filters: IAuctionFilters;
  onFiltersChange: (filters: IAuctionFilters) => void;
}

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
}: AuctionFiltersProps): React.ReactElement {

  const handleAuctionTypeChange = (value: string): void => {
    const currentTypes = filters.auctionTypes ?? [];
    const updatedTypes = currentTypes.includes(value)
      ? currentTypes.filter(t => t !== value)
      : [...currentTypes, value];

    onFiltersChange({ ...filters, auctionTypes: updatedTypes.length > 0 ? updatedTypes : undefined } as IAuctionFilters);
  };

  const handlePropertyTypeChange = (value: string): void => {
    const currentTypes = filters.propertyTypes ?? [];
    const updatedTypes = currentTypes.includes(value)
      ? currentTypes.filter(t => t !== value)
      : [...currentTypes, value];

    onFiltersChange({ ...filters, propertyTypes: updatedTypes.length > 0 ? updatedTypes : undefined } as IAuctionFilters);
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = filters.priceRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, priceRange: rangeToSet } as IAuctionFilters);
  };

  const handleReservePriceRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = filters.reservePriceRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, reservePriceRange: rangeToSet } as IAuctionFilters);
  };

  const handleSquareFootageRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = filters.squareFootageRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, squareFootageRange: rangeToSet } as IAuctionFilters);
  };

  const handleRoomsRangeChange = (field: 'min' | 'max', value: string): void => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = filters.roomsRange ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onFiltersChange({ ...filters, roomsRange: rangeToSet } as IAuctionFilters);
  };

  const handleRentalStatusChange = (value: string): void => {
    const booleanValue = value === 'true' ? true : value === 'false' ? false : undefined;
    onFiltersChange({ ...filters, isSoldRented: booleanValue } as IAuctionFilters);
  };

  const CustomFilters = (
    <>
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
        {filters.auctionTypes && filters.auctionTypes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {filters.auctionTypes.map((type) => {
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

      {/* Rental Status Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block font-heading">Statut locatif</label>
        <Select
          value={filters.isSoldRented !== undefined ? String(filters.isSoldRented) : undefined}
          onValueChange={handleRentalStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les statuts..." />
          </SelectTrigger>
          <SelectContent>
            {RENTAL_STATUS_OPTIONS.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filters.isSoldRented !== undefined && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              {RENTAL_STATUS_OPTIONS.find(o => o.value === filters.isSoldRented)?.label}
              <button
                onClick={() => handleRentalStatusChange('')}
                className="ml-1 text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </span>
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
        {filters.propertyTypes && filters.propertyTypes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {filters.propertyTypes.map((type) => {
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
            value={filters.priceRange?.min ?? ''}
            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Prix max"
            value={filters.priceRange?.max ?? ''}
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
            value={filters.reservePriceRange?.min ?? ''}
            onChange={(e) => handleReservePriceRangeChange('min', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.reservePriceRange?.max ?? ''}
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
            value={filters.squareFootageRange?.min ?? ''}
            onChange={(e) => handleSquareFootageRangeChange('min', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.squareFootageRange?.max ?? ''}
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
            value={filters.roomsRange?.min ?? ''}
            onChange={(e) => handleRoomsRangeChange('min', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.roomsRange?.max ?? ''}
            onChange={(e) => handleRoomsRangeChange('max', e.target.value)}
          />
        </div>
      </div>
    </>
  );

  return (
    <BaseFilters
      currentType={OpportunityType.AUCTION}
      filters={filters}
      onFiltersChange={onFiltersChange}
      ExtraFilters={CustomFilters}
    />
  );
}