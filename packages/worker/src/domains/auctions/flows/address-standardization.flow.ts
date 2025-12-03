import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.5-flash'),
});

const addressRefinementInputSchema = z.object({
  currentAddress: z.string(),
  description: z.string().optional(),
  additionalContext: z.string().optional(),
});

const addressRefinementOutputSchema = z.object({
  refinedAddress: z.string(),
  confidence: z.number().min(0).max(1),
  extractedFromDescription: z.boolean(),
  reasoning: z.string().optional(),
});

export const refineAddressFlow = ai.defineFlow(
  {
    name: 'refineAddressFlow',
    inputSchema: addressRefinementInputSchema,
    outputSchema: addressRefinementOutputSchema,
  },
  async (input) => {
    const { currentAddress, description, additionalContext } = input;

    const prompt = `
You are an AI assistant specializing in French real estate street address extraction and standardization.

Task: Extract and refine the STREET ADDRESS ONLY (street number + street name) from the property information. DO NOT include postal codes, city names, or other location information.

Current Address: ${currentAddress}
${description ? `Property Description: ${description}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Instructions:
1. Focus ONLY on extracting the street address (number + street name)
2. Look for specific details like:
   - Street numbers (e.g., "123", "45 bis")
   - Street names (e.g., "rue de la Paix", "avenue Victor Hugo")
   - Building references if part of street identification
3. EXCLUDE from the refined address:
   - Postal codes (e.g., "75001", "69000")
   - City names (e.g., "Paris", "Lyon")
   - District names (e.g., "1er arrondissement")
   - Landmarks that are not part of the street address
4. If the description contains a more complete street address, extract it
5. Standardize street address format (e.g., "123 rue de la Paix")
6. Provide a confidence score (0.0 to 1.0) based on the completeness and precision of the street address
7. Indicate if you extracted information from the description vs. just standardized the current address

Return a JSON object with:
- refinedAddress: ONLY the street address (number + street name), no postal code or city
- confidence: A number between 0.0 and 1.0 indicating confidence in the street address quality
- extractedFromDescription: Boolean indicating if street address information was extracted from the description
- reasoning: Brief explanation of what changes were made (optional)

Examples:
- Current: "rue de la paix, 75001 Paris" → Refined: "rue de la Paix" (removed postal code and city)
- Current: "paix" + Description: "située au 123 rue de la Paix, 75001 Paris" → Refined: "123 rue de la Paix" (extracted street number and name only)
- Current: "av victor hugo" → Refined: "avenue Victor Hugo" (standardized street name)

Please respond with only a valid JSON object.
`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: addressRefinementOutputSchema },
    });

    if (!output) throw new Error('Failed to refine address');
    return output;
  }
);
