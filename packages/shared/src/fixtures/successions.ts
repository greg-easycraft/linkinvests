import { Succession } from "../types/succession.types.js";
import { randomUUID } from "crypto";


export const SUCCESSION_1: Succession = {
    id: randomUUID(),
    label: 'Succession - Henri Dubois',
    address: '42 Rue Victor Hugo, Bordeaux',
    zipCode: '33000',
    department: '33',
    latitude: 44.8378,
    longitude: -0.5792,
    opportunityDate: new Date('2024-01-30').toISOString().split('T')[0] as string,
    externalId: 'SUC_001_2024',
    firstName: 'Henri',
    lastName: 'Dubois',
    mairieContact: {
        name: 'Mairie de Bordeaux',
        address: {
            complement1: 'Place Pey Berland',
            complement2: '',
            numero_voie: '42',
            service_distribution: 'Rue Victor Hugo',
            code_postal: '33000',
            nom_commune: 'Bordeaux',
        },
        phone: '05 56 10 20 30',
        email: 'etat.civil@bordeaux-metropole.fr',
        website: 'https://www.bordeaux-metropole.fr',
        openingHours: 'Lundi-Vendredi: 8h30-17h30, Samedi: 8h30-12h00'
    },
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-28'),
}

export const SUCCESSION_2: Succession = {
    id: randomUUID(),
    label: 'Succession - Marie-Claire Petit',
    address: '15 Boulevard Saint-Germain, Paris',
    zipCode: '75005',
    department: '75',
    latitude: 48.8534,
    longitude: 2.3488,
    opportunityDate: new Date('2024-02-14').toISOString().split('T')[0] as string,
    externalId: 'SUC_002_2024',
    firstName: 'Marie-Claire',
    lastName: 'Petit',
    mairieContact: {
        name: 'Mairie du 5ème arrondissement',
        address: {
            complement1: '21 Place du Panthéon',
            complement2: '',
            numero_voie: '',
            service_distribution: '',
            code_postal: '75005',
            nom_commune: 'Paris',
        },
        phone: '01 56 81 75 05',
        email: 'mairie05@paris.fr',
        website: 'https://mairie05.paris.fr',
        openingHours: 'Lundi-Vendredi: 8h30-17h00, Jeudi jusqu\'à 19h30'
    },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12'),
}

export const SUCCESSION_3: Succession = {
    id: randomUUID(),
    label: 'Succession - Robert Lemoine',
    address: '28 Rue de la Liberté, Strasbourg',
    zipCode: '67000',
    department: '67',
    latitude: 48.5734,
    longitude: 7.7521,
    opportunityDate: new Date('2024-03-22').toISOString().split('T')[0] as string,
    externalId: 'SUC_003_2024',
    firstName: 'Robert',
    lastName: 'Lemoine',
    mairieContact: {
        name: 'Mairie de Strasbourg',
        address: {
            complement1: '1 Parc de l\'Étoile',
            complement2: '',
            numero_voie: '',
            service_distribution: '',
            code_postal: '67076',
            nom_commune: 'Strasbourg',
        },
        phone: '03 68 98 50 00',
        email: 'contact@strasbourg.eu',
        website: 'https://www.strasbourg.eu',
        openingHours: 'Lundi-Vendredi: 8h30-12h00 et 13h30-17h30'
    },
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-20'),
}

export const SUCCESSION_4: Succession = {
    id: randomUUID(),
    label: 'Succession - Françoise Moreau',
    address: '9 Place Bellecour, Lyon',
    zipCode: '69002',
    department: '69',
    latitude: 45.7578,
    longitude: 4.8320,
    opportunityDate: new Date('2024-04-16').toISOString().split('T')[0] as string,
    externalId: 'SUC_004_2024',
    firstName: 'Françoise',
    lastName: 'Moreau',
    mairieContact: {
        name: 'Mairie du 2ème arrondissement de Lyon',
        address: {
            complement1: '2 Rue d\'Enghien',
            complement2: '',
            numero_voie: '',
            service_distribution: '',
            code_postal: '69002',
            nom_commune: 'Lyon',
        },
        phone: '04 78 42 93 69',
        email: 'mairie-2@mairie-lyon.fr',
        website: 'https://www.lyon.fr/arrondissement/2eme',
        openingHours: 'Lundi-Vendredi: 8h30-12h30 et 13h30-17h00'
    },
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-04-14'),
}

export const SUCCESSION_5: Succession = {
    id: randomUUID(),
    label: 'Succession - Pierre Garnier',
    address: '33 Cours Saleya, Nice',
    zipCode: '06300',
    department: '06',
    latitude: 43.6947,
    longitude: 7.2620,
    opportunityDate: new Date('2024-05-28').toISOString().split('T')[0] as string,
    externalId: 'SUC_005_2024',
    firstName: 'Pierre',
    lastName: 'Garnier',
    mairieContact: {
        name: 'Mairie de Nice',
        address: {
            complement1: '5 Rue de l\'Hôtel de Ville',
            complement2: '',
            numero_voie: '',
            service_distribution: '',
            code_postal: '06364',
            nom_commune: 'Nice',
        },
        phone: '04 97 13 20 00',
        email: 'contact@ville-nice.fr',
        website: 'https://www.nice.fr',
        openingHours: 'Lundi-Vendredi: 8h30-16h30'
    },
    createdAt: new Date('2024-05-24'),
    updatedAt: new Date('2024-05-26'),
}

export const ALL_SUCCESSIONS: Succession[] = [
    SUCCESSION_1,
    SUCCESSION_2,
    SUCCESSION_3,
    SUCCESSION_4,
    SUCCESSION_5
];