import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Format a price in EUR currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format a number with French locale (spaces as thousand separators)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

/**
 * Format a date in French locale
 */
export function formatDate(
  date: Date | string,
  formatStr = 'dd MMMM yyyy',
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

/**
 * Format a short date (dd/MM/yyyy)
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: fr })
}

/**
 * Format a relative date (e.g., "il y a 3 jours")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInDays = Math.floor(
    (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffInDays === 0) return "Aujourd'hui"
  if (diffInDays === 1) return 'Hier'
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine(s)`
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`
  return `Il y a ${Math.floor(diffInDays / 365)} an(s)`
}

/**
 * Format square meters
 */
export function formatSquareMeters(sqm: number): string {
  return `${formatNumber(sqm)} m²`
}

/**
 * Format a SIRET number (XXX XXX XXX XXXXX)
 */
export function formatSiret(siret: string): string {
  if (siret.length !== 14) return siret
  return `${siret.slice(0, 3)} ${siret.slice(3, 6)} ${siret.slice(6, 9)} ${siret.slice(9)}`
}
