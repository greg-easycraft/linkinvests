"use client";

import * as React from "react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./select";
import { useAuthSafeDropdown } from "~/hooks/useAuthSafeDropdown";

interface AuthSafeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  triggerChildren?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * A wrapper around the standard Select component that provides safe dropdown
 * state management during authentication changes.
 *
 * This component automatically:
 * - Closes the dropdown when authentication state changes
 * - Prevents portal cleanup conflicts during component unmounting
 * - Provides consistent behavior across all filter components
 *
 * @example
 * ```tsx
 * <AuthSafeSelect
 *   value={selectedValue}
 *   onValueChange={handleChange}
 *   placeholder="Choose an option..."
 * >
 *   <SelectItem value="option1">Option 1</SelectItem>
 *   <SelectItem value="option2">Option 2</SelectItem>
 * </AuthSafeSelect>
 * ```
 */
export function AuthSafeSelect({
  value,
  onValueChange,
  placeholder,
  children,
  triggerChildren,
  className,
  disabled
}: AuthSafeSelectProps) {
  const { isOpen, setIsOpen } = useAuthSafeDropdown();

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        {triggerChildren || <SelectValue placeholder={placeholder} />}
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
}

// Re-export SelectItem for convenience
export { SelectItem } from "./select";