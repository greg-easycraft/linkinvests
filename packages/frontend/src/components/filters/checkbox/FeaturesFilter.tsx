"use client";

import { FEATURES_OPTIONS } from '../constants';
import type { ListingFeatures } from "~/types/filters";

interface FeaturesFilterProps {
  value?: ListingFeatures;
  onChange: (value: ListingFeatures | undefined) => void;
  label?: string;
}

export function FeaturesFilter({
  value,
  onChange,
  label = "Équipements",
}: FeaturesFilterProps): React.ReactElement {

  const handleFeatureChange = (featureKey: string, checked: boolean): void => {
    const currentFeatures = value ?? {};
    const updatedFeatures = { ...currentFeatures, [featureKey]: checked ? true : undefined };

    // Remove the feature if unchecked
    if (!checked) {
      delete updatedFeatures[featureKey as keyof typeof updatedFeatures];
    }

    // Remove features object if empty
    const hasAnyFeatures = Object.keys(updatedFeatures).length > 0;
    onChange(hasAnyFeatures ? updatedFeatures : undefined);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">{label}</label>
      <div className="space-y-2">
        {FEATURES_OPTIONS.map((feature) => {
          const isChecked = value?.[feature.key as keyof ListingFeatures] ?? false;
          const inputId = `feature-${feature.key}`;

          return (
            <div key={feature.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={inputId}
                checked={isChecked}
                onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={inputId}
                className="text-sm cursor-pointer font-medium"
              >
                {feature.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}