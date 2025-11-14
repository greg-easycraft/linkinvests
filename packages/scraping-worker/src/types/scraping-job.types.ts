export interface ScrapingJobData {
  jobName: 'auctions' | 'deceases' | 'notary-listings';
  // Pagination parameters for notary-listings job
  startPage?: number;
  endPage?: number;
}
