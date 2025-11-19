import { randomUUID } from "crypto";
import { EnergyDiagnostic } from "@linkinvests/shared";


export const ENERGY_DIAGNOSTIC_1: EnergyDiagnostic = {
    id: randomUUID(),
    label: 'Energy Diagnostic - Marseille Apartment',
    address: '45 Rue de la République, Marseille',
    zipCode: '13001',
    department: '13',
    latitude: 43.2965,
    longitude: 5.3698,
    opportunityDate: new Date('2024-01-20').toISOString().split('T')[0] as string,
    externalId: 'DPE_001_2024',
    energyClass: 'F',
    squareFootage: 65,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
}

export const ENERGY_DIAGNOSTIC_2: EnergyDiagnostic = {
    id: randomUUID(),
    label: 'Energy Diagnostic - Lyon Office Building',
    address: '28 Cours Lafayette, Lyon',
    zipCode: '69003',
    department: '69',
    latitude: 45.7578,
    longitude: 4.8320,
    opportunityDate: new Date('2024-02-10').toISOString().split('T')[0] as string,
    externalId: 'DPE_002_2024',
    energyClass: 'G',
    squareFootage: 450,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-08'),
}

export const ENERGY_DIAGNOSTIC_3: EnergyDiagnostic = {
    id: randomUUID(),
    label: 'Energy Diagnostic - Lille House',
    address: '12 Rue Nationale, Lille',
    zipCode: '59000',
    department: '59',
    latitude: 50.6292,
    longitude: 3.0573,
    opportunityDate: new Date('2024-03-15').toISOString().split('T')[0] as string,
    externalId: 'DPE_003_2024',
    energyClass: 'F',
    squareFootage: 120,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-13'),
}

export const ENERGY_DIAGNOSTIC_4: EnergyDiagnostic = {
    id: randomUUID(),
    label: 'Energy Diagnostic - Strasbourg Commercial Space',
    address: '8 Place Kléber, Strasbourg',
    zipCode: '67000',
    department: '67',
    latitude: 48.5734,
    longitude: 7.7521,
    opportunityDate: new Date('2024-04-05').toISOString().split('T')[0] as string,
    externalId: 'DPE_004_2024',
    energyClass: 'G',
    squareFootage: 280,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-03'),
}

export const ENERGY_DIAGNOSTIC_5: EnergyDiagnostic = {
    id: randomUUID(),
    label: 'Energy Diagnostic - Nantes Warehouse',
    address: '15 Quai de la Fosse, Nantes',
    zipCode: '44000',
    department: '44',
    latitude: 47.2184,
    longitude: -1.5536,
    opportunityDate: new Date('2024-05-22').toISOString().split('T')[0] as string,
    externalId: 'DPE_005_2024',
    energyClass: 'F',
    squareFootage: 800,
    createdAt: new Date('2024-05-18'),
    updatedAt: new Date('2024-05-20'),
}

export const ALL_ENERGY_DIAGNOSTICS: EnergyDiagnostic[] = [
    ENERGY_DIAGNOSTIC_1,
    ENERGY_DIAGNOSTIC_2,
    ENERGY_DIAGNOSTIC_3,
    ENERGY_DIAGNOSTIC_4,
    ENERGY_DIAGNOSTIC_5
];