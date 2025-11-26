import { notFound } from 'next/navigation';
import { getAuctionById } from '~/app/_actions/auctions/queries';
import { AuctionDetailContent } from './AuctionDetailContent';
import type { Metadata } from 'next';

interface AuctionDetailPageProps {
  params: Promise<{ auctionId: string }>;
}

export async function generateMetadata({ params }: AuctionDetailPageProps): Promise<Metadata> {
  const { auctionId } = await params;
  const auction = await getAuctionById(auctionId);

  return {
    title: auction ? `${auction.label} | LinkInvests` : 'Enchère | LinkInvests',
    description: auction?.description ?? 'Détails de l\'enchère',
  };
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { auctionId } = await params;
  const auction = await getAuctionById(auctionId);

  if (!auction) {
    notFound();
  }

  return <AuctionDetailContent auction={auction} />;
}
