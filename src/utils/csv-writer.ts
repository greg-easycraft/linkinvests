import { createObjectCsvWriter } from 'csv-writer';
import { RealEstateListing } from '../types.js';

export async function writeListingsToCSV(
  listings: RealEstateListing[],
  outputPath: string
): Promise<void> {
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'title', title: 'Title' },
      { id: 'price', title: 'Price' },
      { id: 'location', title: 'Location' },
      { id: 'description', title: 'Description' },
      { id: 'publicationDate', title: 'Publication Date' },
      { id: 'url', title: 'URL' },
      { id: 'surfaceArea', title: 'Surface Area' },
      { id: 'rooms', title: 'Rooms' },
      { id: 'propertyType', title: 'Property Type' },
      { id: 'energyRating', title: 'Energy Rating' },
      { id: 'sellerName', title: 'Seller Name' },
      { id: 'sellerType', title: 'Seller Type' },
    ],
  });

  await csvWriter.writeRecords(listings);
  console.log(`✓ Successfully wrote ${listings.length} listings to ${outputPath}`);
}
