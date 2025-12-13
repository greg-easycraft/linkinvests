import { randomUUID } from 'crypto';
import { Liquidation } from '@linkinvests/shared';

export const LIQUIDATION_1: Liquidation = {
  id: randomUUID(),
  label: 'Liquidation - Restaurant "Le Petit Bistro"',
  streetAddress: '23 Rue de Rivoli',
  city: 'Paris',
  zipCode: '75001',
  department: '75',
  latitude: 48.8606,
  longitude: 2.3376,
  opportunityDate: new Date('2024-01-25').toISOString().split('T')[0],
  externalId: 'LIQ_001_2024',
  siret: '12345678912345',
  companyContact: {
    name: 'Le Petit Bistro SARL',
    phone: '01 42 97 48 85',
    email: 'contact@petitbistro.fr',
    legalRepresentative: 'Jean-Pierre Durand',
    administrateur: 'Maître Caroline Moreau',
  },
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-23'),
};

export const LIQUIDATION_2: Liquidation = {
  id: randomUUID(),
  label: 'Liquidation - Tech Startup "InnovateTech"',
  streetAddress: '45 Avenue de la Grande Armée',
  city: 'Paris',
  zipCode: '75016',
  department: '75',
  latitude: 48.8738,
  longitude: 2.2874,
  opportunityDate: new Date('2024-02-12').toISOString().split('T')[0],
  externalId: 'LIQ_002_2024',
  siret: '98765432198765',
  companyContact: {
    name: 'InnovateTech SAS',
    phone: '01 45 67 89 00',
    email: 'admin@innovatetech.fr',
    legalRepresentative: 'Marie-Claire Dubois',
    administrateur: 'Maître Philippe Martin',
  },
  createdAt: new Date('2024-02-08'),
  updatedAt: new Date('2024-02-10'),
};

export const LIQUIDATION_3: Liquidation = {
  id: randomUUID(),
  label: 'Liquidation - Manufacturing "MetalWorks"',
  streetAddress: '18 Zone Industrielle Nord',
  city: 'Lyon',
  zipCode: '69120',
  department: '69',
  latitude: 45.7797,
  longitude: 4.9539,
  opportunityDate: new Date('2024-03-08').toISOString().split('T')[0],
  externalId: 'LIQ_003_2024',
  siret: '45678912345678',
  companyContact: {
    name: 'MetalWorks Industries SARL',
    phone: '04 78 45 67 89',
    email: 'direction@metalworks.fr',
    legalRepresentative: 'Bernard Giraud',
    administrateur: 'Maître Sylvie Lemoine',
  },
  createdAt: new Date('2024-03-05'),
  updatedAt: new Date('2024-03-07'),
};

export const LIQUIDATION_4: Liquidation = {
  id: randomUUID(),
  label: 'Liquidation - Retail Store "Fashion Plus"',
  streetAddress: '67 Cours Mirabeau',
  city: 'Aix-en-Provence',
  zipCode: '13100',
  department: '13',
  latitude: 43.5263,
  longitude: 5.4454,
  opportunityDate: new Date('2024-04-18').toISOString().split('T')[0],
  externalId: 'LIQ_004_2024',
  siret: '78912345678912',
  companyContact: {
    name: 'Fashion Plus EURL',
    phone: '04 42 26 89 45',
    email: 'info@fashionplus.fr',
    legalRepresentative: 'Isabelle Rousseau',
    administrateur: 'Maître Antoine Blanc',
  },
  createdAt: new Date('2024-04-15'),
  updatedAt: new Date('2024-04-17'),
};

export const LIQUIDATION_5: Liquidation = {
  id: randomUUID(),
  label: 'Liquidation - Transport Company "LogiTrans"',
  streetAddress: '92 Route de Toulouse',
  city: 'Montpellier',
  zipCode: '34000',
  department: '34',
  latitude: 43.6108,
  longitude: 3.8767,
  opportunityDate: new Date('2024-05-30').toISOString().split('T')[0],
  externalId: 'LIQ_005_2024',
  siret: '32165498732165',
  companyContact: {
    name: 'LogiTrans SARL',
    phone: '04 67 58 96 32',
    email: 'administration@logitrans.fr',
    legalRepresentative: 'Patrick Mercier',
    administrateur: 'Maître Nathalie Dupont',
  },
  createdAt: new Date('2024-05-25'),
  updatedAt: new Date('2024-05-28'),
};

export const ALL_LIQUIDATIONS: Liquidation[] = [
  LIQUIDATION_1,
  LIQUIDATION_2,
  LIQUIDATION_3,
  LIQUIDATION_4,
  LIQUIDATION_5,
];
