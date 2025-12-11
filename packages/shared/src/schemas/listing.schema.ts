import { z } from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema';
import { ListingInput } from '../types/listing.types';
import {
  EnergyClass,
  GazClass,
  PropertyType,
  UNKNOWN_ENERGY_CLASS,
  UNKNOWN_GAZ_CLASS,
} from '../constants/opportunity';

// Schema for seller contact info
const sellerContactSchema = z
  .object({
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.url().optional(),
    contact: z.string().optional(),
    siret: z.string().optional(),
  })
  .optional();

// Schema for listing input extending base opportunity
export const listingInputSchema = baseOpportunityInputSchema.extend({
  url: z.url(),
  source: z.string(),
  lastChangeDate: z.string(),
  propertyType: z.enum(PropertyType),
  description: z.string().optional(),
  squareFootage: z.number().positive().optional(),
  landArea: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  bedrooms: z.number().int().positive().optional(),
  energyClass: z.union([z.enum(EnergyClass), z.literal(UNKNOWN_ENERGY_CLASS)]),
  gazClass: z.union([z.enum(GazClass), z.literal(UNKNOWN_GAZ_CLASS)]),
  constructionYear: z.number().int().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().positive().optional(),
  options: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  price: z.number().positive().optional(),
  priceType: z.string().optional(),
  fees: z.number().optional(),
  charges: z.number().optional(),
  mainPicture: z.string().optional(),
  pictures: z.array(z.string()).optional(),
  isSoldRented: z.boolean(),
  sellerType: z.enum(['individual', 'professional']),
  sellerContact: sellerContactSchema,
});

// Typed schema for coherent typing
export const typedSchema = listingInputSchema as z.ZodType<ListingInput>;
