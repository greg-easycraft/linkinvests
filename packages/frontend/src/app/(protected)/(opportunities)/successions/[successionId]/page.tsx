import { notFound } from 'next/navigation';
import { getSuccessionById } from '~/app/_actions/successions/queries';
import { SuccessionDetailContent } from './SuccessionDetailContent';
import type { Metadata } from 'next';

interface SuccessionDetailPageProps {
  params: Promise<{ successionId: string }>;
}

export async function generateMetadata({ params }: SuccessionDetailPageProps): Promise<Metadata> {
  const { successionId } = await params;
  const succession = await getSuccessionById(successionId);

  return {
    title: succession ? `${succession.label} | LinkInvests` : 'Succession | LinkInvests',
    description: 'Détails de la succession',
  };
}

export default async function SuccessionDetailPage({ params }: SuccessionDetailPageProps) {
  const { successionId } = await params;
  const succession = await getSuccessionById(successionId);

  if (!succession) {
    notFound();
  }

  return <SuccessionDetailContent succession={succession} />;
}
