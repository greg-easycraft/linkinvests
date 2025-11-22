import { z } from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema.js';
import { AuctionInput } from '../types/auction.types.js';
import { AuctionSource } from '../constants/opportunity.js';

// Schema for auction house contact info
const auctionHouseContactSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
  auctioneer: z.string().optional(),
  registrationRequired: z.boolean().optional(),
  depositAmount: z.number().optional(),
}).optional();

// Schema for auction input extending base opportunity
export const auctionInputSchema = baseOpportunityInputSchema.extend({
  url: z.url(),
  auctionType: z.string().optional(),
  propertyType: z.string().optional(),
  description: z.string().optional(),
  squareFootage: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  energyClass: z.string().optional(),
  auctionVenue: z.string().optional(),
  currentPrice: z.number().positive().optional(),
  reservePrice: z.number().positive().optional(),
  lowerEstimate: z.number().positive().optional(),
  upperEstimate: z.number().positive().optional(),
  mainPicture: z.string().optional(),
  pictures: z.array(z.string()).optional(),
  auctionHouseContact: auctionHouseContactSchema,
  source: z.enum(AuctionSource),
});

// Typed schema for coherent typing
export const typedSchema = auctionInputSchema as z.ZodType<AuctionInput>;