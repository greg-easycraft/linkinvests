"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { X, ChevronDown } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "~/lib/utils";
import { searchDepartments, getDepartmentsByIds } from "~/constants/departments";
import type { DepartmentOption } from "~/types/filters";

interface DepartmentsInputProps {
  value: string[];
  onChange: (departmentIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DepartmentsInput({
  value = [],
  onChange,
  placeholder = "Rechercher par numéro ou nom...",
  disabled = false,
  className,
}: DepartmentsInputProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected departments for badge display
  const selectedDepartments = getDepartmentsByIds(value);

  // Update filtered departments when search query changes
  useEffect(() => {
    const results = searchDepartments(searchQuery);
    // Exclude already selected departments
    const availableResults = results.filter(dept => !value.includes(dept.id));
    setFilteredDepartments(availableResults);
    setHighlightedIndex(-1);
  }, [searchQuery, value]);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsDropdownOpen(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredDepartments.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredDepartments.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredDepartments.length) {
          const selectedDepartment = filteredDepartments[highlightedIndex];
          if (selectedDepartment) {
            selectDepartment(selectedDepartment);
          }
        }
        break;

      case "Escape":
        setIsDropdownOpen(false);
        setSearchQuery("");
        inputRef.current?.blur();
        break;

      case "Backspace":
        // If input is empty and backspace is pressed, remove last selected department
        if (searchQuery === "" && value.length > 0) {
          const lastDepartmentId = value[value.length - 1];
          if (lastDepartmentId) {
            removeDepartment(lastDepartmentId);
          }
        }
        break;
    }
  };

  // Select a department
  const selectDepartment = (department: DepartmentOption) => {
    if (!value.includes(department.id.toString())) {
      onChange([...value, department.id.toString()]);
      setSearchQuery("");
      setIsDropdownOpen(false);
      inputRef.current?.focus();
    }
  };

  // Remove a department
  const removeDepartment = (departmentId: string) => {
    onChange(value.filter(id => id !== departmentId));
  };

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected departments as badges */}
      {selectedDepartments.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedDepartments.map((dept) => (
            <Badge
              key={dept.id}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span>{String(dept.id).padStart(2, '0')}</span>
              <button
                type="button"
                onClick={() => removeDepartment(dept.id.toString())}
                disabled={disabled}
                className="ml-1 hover:bg-gray-200 rounded-sm p-0.5 transition-colors"
                aria-label={`Supprimer le département ${dept.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 pr-8 text-sm rounded-md",
            "border-2 border-[var(--primary)] focus:border-[var(--primary)]",
            "bg-[var(--secundary)] text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
            "placeholder:text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />

        {/* Dropdown arrow */}
        <ChevronDown
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform",
            isDropdownOpen && "rotate-180"
          )}
        />
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1",
            "bg-[var(--primary)] border text-[var(--secundary)] border-border rounded-md shadow-sm",
            "max-h-60 overflow-y-auto"
          )}
        >
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((department, index) => (
              <button
                key={department.id}
                type="button"
                onClick={() => selectDepartment(department)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-[var(--secundary)] hover:text-[var(--primary)]",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  highlightedIndex === index && "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{department.label}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              {searchQuery ? "Aucun département trouvé" : "Tapez pour rechercher"}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {value.length} département{value.length > 1 ? "s" : ""} sélectionné{value.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}