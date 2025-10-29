import { z } from 'zod';

import { auctionExtractionSchema } from '../schemas/auction-extraction.schema';

export const extractAuctionDataPrompt = `Vous êtes un expert en extraction de données d'enchères immobilières françaises.

Analysez la description d'enchère suivante et extrayez les informations demandées.
Si une information n'est pas présente dans le texte, retournez null pour ce champ.

Extrayez:
1. price: Le prix de départ de l'enchère ou l'estimation en euros (nombre uniquement, sans symbole €)
2. propertyType: Le type de bien immobilier en français (ex: "Maison", "Appartement", "Terrain", "Local commercial", "Immeuble")
3. description: Une brève description du bien et de l'enchère (maximum 200 caractères)
4. squareFootage: La surface du bien en mètres carrés (m²) (nombre uniquement)
5. auctionVenue: Le lieu où se déroule l'enchère (tribunal, maison des ventes) - PAS l'adresse du bien

Retournez un JSON valide uniquement.`;

export const extractAuctionDataInputSchema = z.object({
  description: z.string().describe('French auction description text'),
});

export { auctionExtractionSchema as extractAuctionDataOutputSchema };
