import { useState } from 'react'
import { useSavedSearches } from '@/hooks'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SaveSearchModalProps {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
}

export function SaveSearchModal({
  isOpen,
  onClose,
  currentUrl,
}: SaveSearchModalProps) {
  const [name, setName] = useState('')
  const { createSavedSearch, isCreating } = useSavedSearches()
  const handleSave = () => {
    if (!name.trim()) return

    createSavedSearch(
      { name: name.trim(), url: currentUrl },
      {
        onSuccess: () => {
          setName('')
          onClose()
        },
      },
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sauvegarder la recherche</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Nom de la recherche</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Appartements Paris 75"
              maxLength={256}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleSave()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isCreating}>
            {isCreating ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
