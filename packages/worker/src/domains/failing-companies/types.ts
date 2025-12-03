export interface FailingCompaniesJobData {
  departmentId: number;
  sinceDate: string; // Format: YYYY-MM-DD
}

export interface CompanyBuildingsJobData {
  sourceFile: string; // S3 path or local file path
}
