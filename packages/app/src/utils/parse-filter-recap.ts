import type { DatePeriod } from '@linkinvests/shared'
import {
  getDatePeriodOption,
  getDepartmentsByIds,
} from '@/constants'

interface FilterRecapItem {
  label: string
  value: string
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Parses a saved search URL and returns a human-readable recap of active filters
 */
export function parseFilterRecap(url: string): Array<FilterRecapItem> {
  const recap: Array<FilterRecapItem> = []

  try {
    const urlObj = new URL(url, 'http://localhost')
    const params = urlObj.searchParams

    // Departments
    const departments = params.get('departments')
    if (departments) {
      const deptIds = departments.split(',')
      const depts = getDepartmentsByIds(deptIds)
      if (depts.length > 0) {
        const displayDepts = depts.slice(0, 3).map((d) => d.id)
        const suffix = depts.length > 3 ? ` (+${depts.length - 3})` : ''
        recap.push({
          label: 'Depts',
          value: displayDepts.join(', ') + suffix,
        })
      }
    }

    // Date period
    const dateAfter = params.get('dateAfter')
    if (dateAfter) {
      const option = getDatePeriodOption(dateAfter as DatePeriod)
      if (option) {
        recap.push({
          label: 'Periode',
          value: option.label,
        })
      }
    }

    // Price range
    const minPrice = params.get('minPrice')
    const maxPrice = params.get('maxPrice')
    if (minPrice || maxPrice) {
      const min = minPrice ? formatPrice(Number(minPrice)) : ''
      const max = maxPrice ? formatPrice(Number(maxPrice)) : ''
      if (min && max) {
        recap.push({ label: 'Prix', value: `${min} - ${max}` })
      } else if (min) {
        recap.push({ label: 'Prix', value: `> ${min}` })
      } else if (max) {
        recap.push({ label: 'Prix', value: `< ${max}` })
      }
    }

    // Energy classes
    const energyClasses = params.get('energyClasses')
    if (energyClasses) {
      recap.push({ label: 'DPE', value: energyClasses })
    }

    // Property types
    const propertyTypes = params.get('propertyTypes')
    if (propertyTypes) {
      const count = propertyTypes.split(',').length
      recap.push({ label: 'Types', value: `${count} type(s)` })
    }

    // Zip codes
    const zipCodes = params.get('zipCodes')
    if (zipCodes) {
      const codes = zipCodes.split(',')
      const displayCodes = codes.slice(0, 3)
      const suffix = codes.length > 3 ? ` (+${codes.length - 3})` : ''
      recap.push({
        label: 'CP',
        value: displayCodes.join(', ') + suffix,
      })
    }
  } catch {
    // Return empty recap on parse error
  }

  return recap.slice(0, 4) // Limit to 4 items for compact display
}

/**
 * Get opportunity type label from URL path
 */
export function getOpportunityTypeFromUrl(url: string): string {
  if (url.includes('/auctions')) return 'Encheres'
  if (url.includes('/listings')) return 'Annonces'
  if (url.includes('/successions')) return 'Successions'
  if (url.includes('/liquidations')) return 'Liquidations'
  if (url.includes('/energy-sieves')) return 'Passoires'
  return 'Recherche'
}
