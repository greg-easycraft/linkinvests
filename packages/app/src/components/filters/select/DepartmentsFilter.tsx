import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getDepartmentsByIds, searchDepartments } from '@/constants'

interface DepartmentsFilterProps {
  value?: Array<string>
  onValueChange: (value: Array<string> | undefined) => void
}

export function DepartmentsFilter({
  value = [],
  onValueChange,
}: DepartmentsFilterProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredDepartments = useMemo(() => {
    return searchDepartments(searchQuery)
  }, [searchQuery])

  const selectedDepartments = useMemo(() => {
    return getDepartmentsByIds(value ?? [])
  }, [value])

  const handleToggle = (departmentId: string) => {
    const currentValues = value ?? []
    const newValues = currentValues.includes(departmentId)
      ? currentValues.filter((v) => v !== departmentId)
      : [...currentValues, departmentId]

    onValueChange(newValues.length > 0 ? newValues : undefined)
  }

  const handleRemove = (departmentId: string) => {
    const newValues = (value ?? []).filter((v) => v !== departmentId)
    onValueChange(newValues.length > 0 ? newValues : undefined)
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Départements</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Search className="mr-2 h-4 w-4 opacity-50" />
            {selectedDepartments.length > 0
              ? `${selectedDepartments.length} département(s)`
              : 'Sélectionner...'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2">
            <Input
              placeholder="Rechercher un département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          <ScrollArea className="h-60">
            <div className="p-2 pt-0 space-y-1">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-accent ${
                    value?.includes(dept.id) ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleToggle(dept.id)}
                >
                  <span className="text-sm">{dept.label}</span>
                  {value?.includes(dept.id) && (
                    <span className="text-primary">✓</span>
                  )}
                </div>
              ))}
              {filteredDepartments.length === 0 && (
                <div className="text-sm text-muted-foreground p-2">
                  Aucun département trouvé
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected departments badges */}
      {selectedDepartments.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedDepartments.map((dept) => (
            <Badge
              key={dept.id}
              variant="secondary"
              className="pl-2 pr-1 py-0.5"
            >
              {dept.id}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => handleRemove(dept.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
