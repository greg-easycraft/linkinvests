import { FRENCH_DEPARTMENTS } from '@/constants'

// Sample French addresses for realistic dummy data
export const SAMPLE_ADDRESSES = [
  {
    address: '12 Rue de la Paix',
    zipCode: '75002',
    department: '75',
    city: 'Paris',
    lat: 48.8698,
    lng: 2.3308,
  },
  {
    address: '45 Avenue Victor Hugo',
    zipCode: '69006',
    department: '69',
    city: 'Lyon',
    lat: 45.7676,
    lng: 4.8344,
  },
  {
    address: '23 Rue du Vieux Port',
    zipCode: '13001',
    department: '13',
    city: 'Marseille',
    lat: 43.2965,
    lng: 5.3698,
  },
  {
    address: '8 Place du Capitole',
    zipCode: '31000',
    department: '31',
    city: 'Toulouse',
    lat: 43.6047,
    lng: 1.4442,
  },
  {
    address: '15 Quai des Chartrons',
    zipCode: '33000',
    department: '33',
    city: 'Bordeaux',
    lat: 44.8378,
    lng: -0.5792,
  },
  {
    address: '67 Rue de la République',
    zipCode: '44000',
    department: '44',
    city: 'Nantes',
    lat: 47.2184,
    lng: -1.5536,
  },
  {
    address: '34 Boulevard Gambetta',
    zipCode: '06000',
    department: '06',
    city: 'Nice',
    lat: 43.7102,
    lng: 7.262,
  },
  {
    address: '5 Rue de la Cathédrale',
    zipCode: '67000',
    department: '67',
    city: 'Strasbourg',
    lat: 48.5734,
    lng: 7.7521,
  },
  {
    address: "21 Rue Jeanne d'Arc",
    zipCode: '76000',
    department: '76',
    city: 'Rouen',
    lat: 49.4432,
    lng: 1.0993,
  },
  {
    address: '18 Place Bellecour',
    zipCode: '69002',
    department: '69',
    city: 'Lyon',
    lat: 45.7578,
    lng: 4.832,
  },
  {
    address: '9 Rue Nationale',
    zipCode: '59000',
    department: '59',
    city: 'Lille',
    lat: 50.6292,
    lng: 3.0573,
  },
  {
    address: '42 Avenue de la Liberté',
    zipCode: '35000',
    department: '35',
    city: 'Rennes',
    lat: 48.1173,
    lng: -1.6778,
  },
  {
    address: '27 Cours Mirabeau',
    zipCode: '13100',
    department: '13',
    city: 'Aix-en-Provence',
    lat: 43.5263,
    lng: 5.4474,
  },
  {
    address: '11 Rue des Carmes',
    zipCode: '34000',
    department: '34',
    city: 'Montpellier',
    lat: 43.6108,
    lng: 3.8767,
  },
  {
    address: '55 Rue de la Préfecture',
    zipCode: '21000',
    department: '21',
    city: 'Dijon',
    lat: 47.322,
    lng: 5.0415,
  },
  {
    address: '3 Place Stanislas',
    zipCode: '54000',
    department: '54',
    city: 'Nancy',
    lat: 48.6937,
    lng: 6.1834,
  },
  {
    address: '78 Rue Saint-Denis',
    zipCode: '75001',
    department: '75',
    city: 'Paris',
    lat: 48.8615,
    lng: 2.3486,
  },
  {
    address: '14 Avenue Jean Jaurès',
    zipCode: '92100',
    department: '92',
    city: 'Boulogne-Billancourt',
    lat: 48.8397,
    lng: 2.2399,
  },
  {
    address: '31 Rue de Verdun',
    zipCode: '38000',
    department: '38',
    city: 'Grenoble',
    lat: 45.1885,
    lng: 5.7245,
  },
  {
    address: '6 Place du Commerce',
    zipCode: '56000',
    department: '56',
    city: 'Vannes',
    lat: 47.6556,
    lng: -2.7578,
  },
  {
    address: '22 Rue de la Mairie',
    zipCode: '29200',
    department: '29',
    city: 'Brest',
    lat: 48.3904,
    lng: -4.4861,
  },
  {
    address: '88 Boulevard de la Mer',
    zipCode: '17000',
    department: '17',
    city: 'La Rochelle',
    lat: 46.1591,
    lng: -1.152,
  },
  {
    address: '4 Place Kléber',
    zipCode: '67000',
    department: '67',
    city: 'Strasbourg',
    lat: 48.5839,
    lng: 7.7455,
  },
  {
    address: '19 Rue du Port',
    zipCode: '64200',
    department: '64',
    city: 'Biarritz',
    lat: 43.4832,
    lng: -1.5586,
  },
  {
    address: '47 Avenue de la Gare',
    zipCode: '57000',
    department: '57',
    city: 'Metz',
    lat: 49.1193,
    lng: 6.1757,
  },
]

// Property name templates
export const PROPERTY_LABELS = {
  flat: [
    'Appartement T1',
    'Appartement T2',
    'Appartement T3',
    'Appartement T4',
    'Studio',
    'Duplex',
    'Loft',
  ],
  house: [
    'Maison de ville',
    'Maison individuelle',
    'Pavillon',
    'Villa',
    'Longère',
    'Fermette',
  ],
  commercial: [
    'Local commercial',
    'Bureau',
    'Entrepôt',
    'Boutique',
    'Restaurant',
  ],
  land: [
    'Terrain constructible',
    'Terrain agricole',
    'Terrain à bâtir',
    'Parcelle',
  ],
  other: ['Bien immobilier', 'Immeuble', 'Parking', 'Cave', 'Garage'],
}

// Random utility functions
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability
}

export function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - randomInt(0, daysAgo))
  return date
}

export function generateId(prefix: string, index: number): string {
  return `${prefix}-${index.toString().padStart(4, '0')}-${Math.random().toString(36).substring(2, 8)}`
}

export function randomAddress() {
  return randomElement(SAMPLE_ADDRESSES)
}

export function randomDepartment() {
  return randomElement(FRENCH_DEPARTMENTS)
}

// French first and last names for successions
export const FRENCH_FIRST_NAMES = [
  'Jean',
  'Marie',
  'Pierre',
  'Paul',
  'Jacques',
  'Michel',
  'André',
  'Philippe',
  'Claude',
  'Bernard',
  'François',
  'Robert',
  'Alain',
  'Marcel',
  'René',
  'Louis',
  'Henri',
  'Daniel',
  'Georges',
  'Christian',
  'Raymond',
  'Roger',
  'Gérard',
  'Maurice',
  'Anne',
  'Jeanne',
  'Marguerite',
  'Françoise',
  'Monique',
  'Nicole',
  'Jacqueline',
  'Simone',
  'Yvonne',
  'Madeleine',
  'Suzanne',
  'Germaine',
  'Odette',
  'Paulette',
]

export const FRENCH_LAST_NAMES = [
  'Martin',
  'Bernard',
  'Dubois',
  'Thomas',
  'Robert',
  'Richard',
  'Petit',
  'Durand',
  'Leroy',
  'Moreau',
  'Simon',
  'Laurent',
  'Lefebvre',
  'Michel',
  'Garcia',
  'David',
  'Bertrand',
  'Roux',
  'Vincent',
  'Fournier',
  'Morel',
  'Girard',
  'André',
  'Lefevre',
  'Mercier',
  'Dupont',
  'Lambert',
  'Bonnet',
  'François',
  'Martinez',
  'Legrand',
]

// Company names for liquidations
export const COMPANY_PREFIXES = ['SARL', 'SAS', 'SA', 'EURL', 'SCI']

export const COMPANY_NAMES = [
  'Bâtiment du Sud',
  'Construction Moderne',
  'Services Plus',
  'Tech Solutions',
  'Auto Express',
  'Restaurant Le Gourmet',
  'Pizzeria Napoli',
  'Café de Paris',
  'Menuiserie Artisanale',
  'Électricité Générale',
  'Plomberie Services',
  'Transport Rapide',
  'Immobilier Conseil',
  'Design Studio',
  'Marketing Pro',
  'Commerce Local',
  'Alimentation Bio',
  'Mode et Tendances',
  'Sport Aventure',
]
