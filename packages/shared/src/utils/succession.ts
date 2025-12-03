export function createSuccessionExternalId({
  cityCode,
  dateStr,
  docId,
}: {
  cityCode: string;
  dateStr: string;
  docId: string;
}): string {
  return `${cityCode}_${dateStr}_${docId}`;
}

export function getDocIdFromSuccessionExternalId(externalId: string): string {
  const [, , docId] = externalId.split('_');
  return docId as string;
}
