import { z } from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema.js';
import { ListingInput } from '../types/listing.types.js';
import { ListingSource, PropertyType } from '../constants/opportunity.js';

// Schema for seller contact info
const sellerContactSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
  website: z.url().optional(),
  contact: z.string().optional(),
  siret: z.string().optional(),
}).optional();

// Schema for listing input extending base opportunity
export const listingInputSchema = baseOpportunityInputSchema.extend({
  url: z.url(),
  source: z.enum(ListingSource),
  transactionType: z.string(),
  propertyType: z.enum(PropertyType),
  description: z.string().optional(),
  squareFootage: z.number().positive().optional(),
  landArea: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  bedrooms: z.number().int().positive().optional(),
  dpe: z.string().optional(),
  constructionYear: z.number().int().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().positive().optional(),
  balcony: z.boolean().optional(),
  terrace: z.boolean().optional(),
  garden: z.boolean().optional(),
  garage: z.boolean().optional(),
  parking: z.boolean().optional(),
  elevator: z.boolean().optional(),
  price: z.number().positive().optional(),
  priceType: z.string().optional(),
  fees: z.number().optional(),
  charges: z.number().optional(),
  mainPicture: z.string().optional(),
  pictures: z.array(z.string()).optional(),
  sellerContact: sellerContactSchema,
});

// Typed schema for coherent typing
export const typedSchema = listingInputSchema as z.ZodType<ListingInput>;