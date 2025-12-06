import { useCallback, useState } from 'react'
import { X } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface ZipCodeInputProps {
  value?: Array<string>
  onValueChange: (value: Array<string> | undefined) => void
  label?: string
  placeholder?: string
}

export function ZipCodeInput({
  value = [],
  onValueChange,
  label = 'Codes postaux',
  placeholder = 'Ex: 75001',
}: ZipCodeInputProps): React.ReactElement {
  const [inputValue, setInputValue] = useState('')

  const addZipCode = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!/^\d{5}$/.test(trimmed)) return
    if (value.includes(trimmed)) {
      setInputValue('')
      return
    }

    const newValue = [...value, trimmed]
    onValueChange(newValue.length > 0 ? newValue : undefined)
    setInputValue('')
  }, [inputValue, value, onValueChange])

  const removeZipCode = useCallback(
    (zipCode: string) => {
      const newValue = value.filter((z) => z !== zipCode)
      onValueChange(newValue.length > 0 ? newValue : undefined)
    },
    [value, onValueChange],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addZipCode()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
    setInputValue(val)
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={addZipCode}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.map((zipCode) => (
            <Badge key={zipCode} variant="secondary" className="gap-1">
              {zipCode}
              <button
                type="button"
                onClick={() => removeZipCode(zipCode)}
                className="hover:text-destructive"
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
