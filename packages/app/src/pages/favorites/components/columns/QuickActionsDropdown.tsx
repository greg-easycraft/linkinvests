import { Check, ExternalLink, Eye, Mail, MoreHorizontal } from 'lucide-react'
import { OpportunityType, SuccessionFavoriteStatus } from '@linkinvests/shared'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface QuickActionsDropdownProps {
  opportunityType: OpportunityType
  onViewDetails: () => void
  externalUrl?: string
  // Succession-specific
  favoriteId?: string
  status?: string
  mairieEmail?: string
  onEmailClick?: (favoriteId: string) => void
}

export function QuickActionsDropdown({
  opportunityType,
  onViewDetails,
  externalUrl,
  favoriteId,
  status,
  mairieEmail,
  onEmailClick,
}: QuickActionsDropdownProps): React.ReactElement {
  const isSuccession = opportunityType === OpportunityType.SUCCESSION
  const isEmailSent = status === SuccessionFavoriteStatus.EMAIL_SENT
  const hasEmail = !!mairieEmail

  const handleExternalClick = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleEmailClick = () => {
    if (hasEmail && mairieEmail) {
      // Open mailto link
      window.location.href = `mailto:${mairieEmail}`
      // Update status
      if (favoriteId && onEmailClick) {
        onEmailClick(favoriteId)
      }
    }
  }

  const renderEmailMenuItem = () => {
    if (isEmailSent) {
      return (
        <DropdownMenuItem disabled>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Email envoyé</span>
        </DropdownMenuItem>
      )
    }

    if (!hasEmail) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DropdownMenuItem disabled>
                <Mail className="h-4 w-4" />
                Envoyer un email
              </DropdownMenuItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Aucune adresse email disponible pour cette mairie</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <DropdownMenuItem onClick={handleEmailClick}>
        <Mail className="h-4 w-4" />
        Envoyer un email
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-full">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onViewDetails}>
          <Eye className="h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>

        {externalUrl && (
          <DropdownMenuItem onClick={handleExternalClick}>
            <ExternalLink className="h-4 w-4" />
            Ouvrir sur le site
          </DropdownMenuItem>
        )}

        {isSuccession && (
          <>
            <DropdownMenuSeparator />
            {renderEmailMenuItem()}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
