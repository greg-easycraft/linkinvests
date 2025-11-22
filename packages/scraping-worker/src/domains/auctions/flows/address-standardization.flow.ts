import { z } from 'zod';
import type {
  AddressRefinementInput,
  AddressRefinementOutput,
} from '../types/ai-address.types';

// Zod schema for output validation
const addressRefinementOutputSchema = z.object({
  refinedAddress: z.string(),
  confidence: z.number().min(0).max(1),
  extractedFromDescription: z.boolean(),
  reasoning: z.string().optional(),
});

export async function standardizeAddress(
  input: AddressRefinementInput,
  apiKey: string
): Promise<AddressRefinementOutput> {
  const { currentAddress, description, additionalContext } = input;

  // Construct the prompt for address refinement
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

  try {
    // Use Google AI REST API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Google AI API error: ${response.status} ${response.statusText}`
      );
    }

    const responseData = await response.json();

    // Extract text from Google AI response
    const rawOutput = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawOutput) {
      throw new Error('No text content in Google AI response');
    }

    let parsedOutput;

    try {
      parsedOutput = JSON.parse(rawOutput);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response as JSON: ${rawOutput}`);
    }

    // Validate the output
    const validatedOutput = addressRefinementOutputSchema.parse(parsedOutput);

    return validatedOutput;
  } catch (error) {
    // Fallback to original address if AI processing fails
    return {
      refinedAddress: currentAddress,
      confidence: 0.5,
      extractedFromDescription: false,
      reasoning: `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
