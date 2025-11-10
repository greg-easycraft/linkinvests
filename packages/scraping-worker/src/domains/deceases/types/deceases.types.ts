// INSEE Scraper related types
export interface InseeFileMetadata {
  fileName: string;
  url: string;
  year: number;
  month: number;
  fileType: 'monthly' | 'yearly';
}

export interface ScrapedDeceasesFile {
  id: string;
  fileName: string;
  createdAt: Date;
}
