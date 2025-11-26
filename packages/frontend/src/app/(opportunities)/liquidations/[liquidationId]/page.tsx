import { notFound } from 'next/navigation';
import { getLiquidationById } from '~/app/_actions/liquidations/queries';
import { LiquidationDetailContent } from './LiquidationDetailContent';
import type { Metadata } from 'next';

interface LiquidationDetailPageProps {
  params: Promise<{ liquidationId: string }>;
}

export async function generateMetadata({ params }: LiquidationDetailPageProps): Promise<Metadata> {
  const { liquidationId } = await params;
  const liquidation = await getLiquidationById(liquidationId);

  return {
    title: liquidation ? `${liquidation.label} | LinkInvests` : 'Liquidation | LinkInvests',
    description: 'Détails de la liquidation',
  };
}

export default async function LiquidationDetailPage({ params }: LiquidationDetailPageProps) {
  const { liquidationId } = await params;
  const liquidation = await getLiquidationById(liquidationId);

  if (!liquidation) {
    notFound();
  }

  return <LiquidationDetailContent liquidation={liquidation} />;
}
