export interface ScrapingJobData {
  jobName: 'auctions' | 'deceases' | 'notary-listings';
  // Auction-specific fields
  departmentId?: number;
  sinceDate?: string; // ISO format YYYY-MM-DD (optional)
  // Notary listings pagination parameters
  startPage?: number;
  endPage?: number;
}
