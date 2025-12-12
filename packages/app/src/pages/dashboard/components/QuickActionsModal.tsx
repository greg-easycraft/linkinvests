import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { getAvailableActions } from './quick-actions-config'
import type { QuickAction } from './quick-actions-config'
import type { QuickActionId } from '@linkinvests/shared'

import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface QuickActionsModalProps {
  isOpen: boolean
  onClose: () => void
  currentActions: Array<QuickActionId>
  onSave: (actions: Array<QuickActionId>) => void
  isSaving: boolean
  isAdmin: boolean
}

export function QuickActionsModal({
  isOpen,
  onClose,
  currentActions,
  onSave,
  isSaving,
  isAdmin,
}: QuickActionsModalProps) {
  const [selectedActions, setSelectedActions] =
    useState<Array<QuickActionId>>(currentActions)

  const availableActions = getAvailableActions(isAdmin)

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedActions(currentActions)
    }
  }, [isOpen, currentActions])

  const toggleAction = (actionId: QuickActionId) => {
    setSelectedActions((prev) => {
      if (prev.includes(actionId)) {
        // Remove action
        return prev.filter((id) => id !== actionId)
      }
      if (prev.length >= 3) {
        // Already have 3 selected, don't add more
        return prev
      }
      // Add action
      return [...prev, actionId]
    })
  }

  const handleSave = () => {
    if (selectedActions.length === 3) {
      onSave(selectedActions)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personnaliser les actions rapides</DialogTitle>
          <DialogDescription>
            Selectionnez exactement 3 actions a afficher sur votre tableau de
            bord.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-3">
            {selectedActions.length}/3 selectionne
            {selectedActions.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableActions.map((action) => (
              <ActionItem
                key={action.id}
                action={action}
                isSelected={selectedActions.includes(action.id)}
                isDisabled={
                  !selectedActions.includes(action.id) &&
                  selectedActions.length >= 3
                }
                onToggle={() => toggleAction(action.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedActions.length !== 3 || isSaving}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ActionItemProps {
  action: QuickAction
  isSelected: boolean
  isDisabled: boolean
  onToggle: () => void
}

function ActionItem({
  action,
  isSelected,
  isDisabled,
  onToggle,
}: ActionItemProps) {
  const Icon = action.icon

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border hover:bg-accent',
        isDisabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{action.label}</span>
      {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
    </button>
  )
}
