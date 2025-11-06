"use client";

import { List, Map } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

type ViewType = "list" | "map";

interface ViewToggleProps {
  value: ViewType;
  onValueChange: (value: ViewType) => void;
}

export function ViewToggle({
  value,
  onValueChange,
}: ViewToggleProps): React.ReactElement {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as ViewType)}>
      <TabsList className="border-2 border-[var(--primary)]">
        <TabsTrigger value="list" className="gap-2">
          <List className="h-4 w-4" />
          Vue liste
        </TabsTrigger>
        <TabsTrigger value="map" className="gap-2">
          <Map className="h-4 w-4" />
          Vue carte
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
