import { notFound } from 'next/navigation';
import { getEnergyDiagnosticById } from '~/app/_actions/energy-sieves/queries';
import { EnergySieveDetailContent } from './EnergySieveDetailContent';
import type { Metadata } from 'next';

interface EnergySieveDetailPageProps {
  params: Promise<{ energySieveId: string }>;
}

export async function generateMetadata({ params }: EnergySieveDetailPageProps): Promise<Metadata> {
  const { energySieveId } = await params;
  const energySieve = await getEnergyDiagnosticById(energySieveId);

  return {
    title: energySieve ? `${energySieve.label} | LinkInvests` : 'Passoire énergétique | LinkInvests',
    description: 'Détails de la passoire énergétique',
  };
}

export default async function EnergySieveDetailPage({ params }: EnergySieveDetailPageProps) {
  const { energySieveId } = await params;
  const energySieve = await getEnergyDiagnosticById(energySieveId);

  if (!energySieve) {
    notFound();
  }

  return <EnergySieveDetailContent energySieve={energySieve} />;
}
