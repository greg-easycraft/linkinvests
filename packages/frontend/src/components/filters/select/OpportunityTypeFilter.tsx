"use client";

import { OpportunityType } from "@linkinvests/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_TYPE_DISPLAY_ORDER } from "../constants";
import { useAuthSafeDropdown } from "~/hooks/useAuthSafeDropdown";

interface OpportunityTypeFilterProps {
  value: OpportunityType;
  onChange?: (value: OpportunityType) => void;
}

export function OpportunityTypeFilter({
  value,
  onChange,
}: OpportunityTypeFilterProps): React.ReactElement {
  const { isOpen, setIsOpen } = useAuthSafeDropdown();

  const handleOpportunityTypeChange = (selectedValue: string) => {
    onChange?.(selectedValue as OpportunityType);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">Type d&apos;opportunité</label>
      <Select
        value={value}
        onValueChange={handleOpportunityTypeChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un type..." />
        </SelectTrigger>
        <SelectContent>
          {OPPORTUNITY_TYPE_DISPLAY_ORDER.map((type) => (
            <SelectItem key={type} value={type}>
              {OPPORTUNITY_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}