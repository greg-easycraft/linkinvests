"use client";

import { useEffect, useState } from "react";
import { MultiSelectFilter, type SelectOption } from "~/components/filters/select/MultiSelectFilter";
import { getAvailableSources } from "~/app/_actions/listings/queries";

interface SourcesInputProps {
  value: string[];
  onChange: (sources: string[]) => void;
}

export function SourcesInput({ value = [], onChange }: SourcesInputProps) {
  const [availableSources, setAvailableSources] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSources() {
      try {
        const sources = await getAvailableSources();
        setAvailableSources(sources.map(source => ({ value: source, label: source })));
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
  }, []);

  const handleChange = (newValue: string[] | undefined): void => {
    onChange(newValue ?? []);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <MultiSelectFilter
      label="Sources"
      options={availableSources}
      value={value.length > 0 ? value : undefined}
      onChange={handleChange}
      placeholder="Sélectionner une source..."
      badgeColor="bg-purple-100 text-purple-800"
    />
  );
}
