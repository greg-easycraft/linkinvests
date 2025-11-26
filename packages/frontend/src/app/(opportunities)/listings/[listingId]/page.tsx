import { notFound } from 'next/navigation';
import { getListingById } from '~/app/_actions/listings/queries';
import { ListingDetailContent } from './ListingDetailContent';
import type { Metadata } from 'next';

interface ListingDetailPageProps {
  params: Promise<{ listingId: string }>;
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await getListingById(listingId);

  return {
    title: listing ? `${listing.label} | LinkInvests` : 'Annonce | LinkInvests',
    description: listing?.description ?? 'Détails de l\'annonce immobilière',
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { listingId } = await params;
  const listing = await getListingById(listingId);

  if (!listing) {
    notFound();
  }

  return <ListingDetailContent listing={listing} />;
}
