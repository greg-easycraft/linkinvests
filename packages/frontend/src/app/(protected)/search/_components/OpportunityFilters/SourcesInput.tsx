"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getAvailableSources } from "~/app/_actions/listings/queries";

interface SourcesInputProps {
  value: string[];
  onChange: (sources: string[]) => void;
}

export function SourcesInput({ value = [], onChange }: SourcesInputProps) {
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSources() {
      try {
        const sources = await getAvailableSources();
        setAvailableSources(sources);
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
  }, []);

  const handleSourceChange = (sourceValue: string) => {
    const updatedSources = value.includes(sourceValue)
      ? value.filter(s => s !== sourceValue)
      : [...value, sourceValue];

    onChange(updatedSources.length > 0 ? updatedSources : []);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select onValueChange={handleSourceChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une source..." />
        </SelectTrigger>
        <SelectContent>
          {availableSources.map((source) => (
            <SelectItem key={source} value={source}>
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((source) => (
            <span
              key={source}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
            >
              {source}
              <button
                onClick={() => handleSourceChange(source)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}