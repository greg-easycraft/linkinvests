import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkInvest',
  description: 'Plateforme d\'investissement immobilier',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
