import type { DepartmentOption } from '@/types'

/**
 * List of French departments with their codes and names.
 * Sorted alphabetically by name for better user experience
 */
export const FRENCH_DEPARTMENTS: Array<DepartmentOption> = [
  { id: '01', name: 'Ain', label: '01 - Ain' },
  { id: '02', name: 'Aisne', label: '02 - Aisne' },
  { id: '03', name: 'Allier', label: '03 - Allier' },
  {
    id: '04',
    name: 'Alpes-de-Haute-Provence',
    label: '04 - Alpes de Haute Provence',
  },
  { id: '05', name: 'Hautes-Alpes', label: '05 - Hautes Alpes' },
  { id: '06', name: 'Alpes-Maritimes', label: '06 - Alpes Maritimes' },
  { id: '07', name: 'Ardèche', label: '07 - Ardèche' },
  { id: '08', name: 'Ardennes', label: '08 - Ardennes' },
  { id: '09', name: 'Ariège', label: '09 - Ariège' },
  { id: '10', name: 'Aube', label: '10 - Aube' },
  { id: '11', name: 'Aude', label: '11 - Aude' },
  { id: '12', name: 'Aveyron', label: '12 - Aveyron' },
  { id: '13', name: 'Bouches-du-Rhône', label: '13 - Bouches du Rhône' },
  { id: '14', name: 'Calvados', label: '14 - Calvados' },
  { id: '15', name: 'Cantal', label: '15 - Cantal' },
  { id: '16', name: 'Charente', label: '16 - Charente' },
  { id: '17', name: 'Charente-Maritime', label: '17 - Charente Maritime' },
  { id: '18', name: 'Cher', label: '18 - Cher' },
  { id: '19', name: 'Corrèze', label: '19 - Corrèze' },
  { id: '2A', name: 'Corse-du-Sud', label: '2A - Corse du Sud' },
  { id: '2B', name: 'Haute-Corse', label: '2B - Haute Corse' },
  { id: '21', name: "Côte-d'Or", label: "21 - Côte d'Or" },
  { id: '22', name: "Côtes-d'Armor", label: "22 - Côtes d'Armor" },
  { id: '23', name: 'Creuse', label: '23 - Creuse' },
  { id: '24', name: 'Dordogne', label: '24 - Dordogne' },
  { id: '25', name: 'Doubs', label: '25 - Doubs' },
  { id: '26', name: 'Drôme', label: '26 - Drôme' },
  { id: '27', name: 'Eure', label: '27 - Eure' },
  { id: '28', name: 'Eure-et-Loir', label: '28 - Eure et Loir' },
  { id: '29', name: 'Finistère', label: '29 - Finistère' },
  { id: '30', name: 'Gard', label: '30 - Gard' },
  { id: '31', name: 'Haute-Garonne', label: '31 - Haute Garonne' },
  { id: '32', name: 'Gers', label: '32 - Gers' },
  { id: '33', name: 'Gironde', label: '33 - Gironde' },
  { id: '34', name: 'Hérault', label: '34 - Hérault' },
  { id: '35', name: 'Ille-et-Vilaine', label: '35 - Ille et Vilaine' },
  { id: '36', name: 'Indre', label: '36 - Indre' },
  { id: '37', name: 'Indre-et-Loire', label: '37 - Indre et Loire' },
  { id: '38', name: 'Isère', label: '38 - Isère' },
  { id: '39', name: 'Jura', label: '39 - Jura' },
  { id: '40', name: 'Landes', label: '40 - Landes' },
  { id: '41', name: 'Loir-et-Cher', label: '41 - Loir et Cher' },
  { id: '42', name: 'Loire', label: '42 - Loire' },
  { id: '43', name: 'Haute-Loire', label: '43 - Haute Loire' },
  { id: '44', name: 'Loire-Atlantique', label: '44 - Loire Atlantique' },
  { id: '45', name: 'Loiret', label: '45 - Loiret' },
  { id: '46', name: 'Lot', label: '46 - Lot' },
  { id: '47', name: 'Lot-et-Garonne', label: '47 - Lot et Garonne' },
  { id: '48', name: 'Lozère', label: '48 - Lozère' },
  { id: '49', name: 'Maine-et-Loire', label: '49 - Maine et Loire' },
  { id: '50', name: 'Manche', label: '50 - Manche' },
  { id: '51', name: 'Marne', label: '51 - Marne' },
  { id: '52', name: 'Haute-Marne', label: '52 - Haute Marne' },
  { id: '53', name: 'Mayenne', label: '53 - Mayenne' },
  { id: '54', name: 'Meurthe-et-Moselle', label: '54 - Meurthe et Moselle' },
  { id: '55', name: 'Meuse', label: '55 - Meuse' },
  { id: '56', name: 'Morbihan', label: '56 - Morbihan' },
  { id: '57', name: 'Moselle', label: '57 - Moselle' },
  { id: '58', name: 'Nièvre', label: '58 - Nièvre' },
  { id: '59', name: 'Nord', label: '59 - Nord' },
  { id: '60', name: 'Oise', label: '60 - Oise' },
  { id: '61', name: 'Orne', label: '61 - Orne' },
  { id: '62', name: 'Pas-de-Calais', label: '62 - Pas de Calais' },
  { id: '63', name: 'Puy-de-Dôme', label: '63 - Puy de Dôme' },
  {
    id: '64',
    name: 'Pyrénées-Atlantiques',
    label: '64 - Pyrénées Atlantiques',
  },
  { id: '65', name: 'Hautes-Pyrénées', label: '65 - Hautes Pyrénées' },
  { id: '66', name: 'Pyrénées-Orientales', label: '66 - Pyrénées Orientales' },
  { id: '67', name: 'Bas-Rhin', label: '67 - Bas Rhin' },
  { id: '68', name: 'Haut-Rhin', label: '68 - Haut Rhin' },
  { id: '69', name: 'Rhône', label: '69 - Rhône' },
  { id: '70', name: 'Haute-Saône', label: '70 - Haute Saône' },
  { id: '71', name: 'Saône-et-Loire', label: '71 - Saône et Loire' },
  { id: '72', name: 'Sarthe', label: '72 - Sarthe' },
  { id: '73', name: 'Savoie', label: '73 - Savoie' },
  { id: '74', name: 'Haute-Savoie', label: '74 - Haute Savoie' },
  { id: '75', name: 'Paris', label: '75 - Paris' },
  { id: '76', name: 'Seine-Maritime', label: '76 - Seine Maritime' },
  { id: '77', name: 'Seine-et-Marne', label: '77 - Seine et Marne' },
  { id: '78', name: 'Yvelines', label: '78 - Yvelines' },
  { id: '79', name: 'Deux-Sèvres', label: '79 - Deux Sèvres' },
  { id: '80', name: 'Somme', label: '80 - Somme' },
  { id: '81', name: 'Tarn', label: '81 - Tarn' },
  { id: '82', name: 'Tarn-et-Garonne', label: '82 - Tarn et Garonne' },
  { id: '83', name: 'Var', label: '83 - Var' },
  { id: '84', name: 'Vaucluse', label: '84 - Vaucluse' },
  { id: '85', name: 'Vendée', label: '85 - Vendée' },
  { id: '86', name: 'Vienne', label: '86 - Vienne' },
  { id: '87', name: 'Haute-Vienne', label: '87 - Haute Vienne' },
  { id: '88', name: 'Vosges', label: '88 - Vosges' },
  { id: '89', name: 'Yonne', label: '89 - Yonne' },
  {
    id: '90',
    name: 'Territoire de Belfort',
    label: '90 - Territoire de Belfort',
  },
  { id: '91', name: 'Essonne', label: '91 - Essonne' },
  { id: '92', name: 'Hauts-de-Seine', label: '92 - Hauts de Seine' },
  { id: '93', name: 'Seine-Saint-Denis', label: '93 - Seine Saint Denis' },
  { id: '94', name: 'Val-de-Marne', label: '94 - Val de Marne' },
  { id: '95', name: "Val-d'Oise", label: "95 - Val d'Oise" },
  { id: '971', name: 'Guadeloupe', label: '971 - Guadeloupe' },
  { id: '972', name: 'Martinique', label: '972 - Martinique' },
  { id: '973', name: 'Guyane', label: '973 - Guyane' },
  { id: '974', name: 'La Réunion', label: '974 - La Réunion' },
  { id: '976', name: 'Mayotte', label: '976 - Mayotte' },
]

/**
 * Search departments by ID or name (case insensitive)
 */
export function searchDepartments(query: string): Array<DepartmentOption> {
  if (!query.trim()) {
    return FRENCH_DEPARTMENTS
  }

  const normalizedQuery = query.toLowerCase().trim()

  return FRENCH_DEPARTMENTS.filter((dept) => {
    return dept.label.toLowerCase().includes(normalizedQuery)
  })
}

/**
 * Get department by ID
 */
export function getDepartmentById(id: string): DepartmentOption | undefined {
  return FRENCH_DEPARTMENTS.find((dept) => dept.id === id)
}

/**
 * Get multiple departments by their IDs
 */
export function getDepartmentsByIds(ids: Array<string>): Array<DepartmentOption> {
  return FRENCH_DEPARTMENTS.filter((dept) => ids.includes(dept.id))
}
