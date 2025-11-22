export interface AddressRefinementInput {
  currentAddress: string;
  description?: string;
  additionalContext?: string;
}

export interface AddressRefinementOutput {
  refinedAddress: string;
  confidence: number;
  extractedFromDescription: boolean;
  reasoning?: string;
}

export interface AIAddressServiceConfig {
  maxRetries: number;
  retryDelay: number;
  minRequestInterval: number;
  minConfidence: number;
}
