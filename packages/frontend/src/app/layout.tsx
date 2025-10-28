import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '~/components/providers/query-provider';

export const metadata: Metadata = {
  title: 'LinkInvest',
  description: 'Plateforme d\'investissement immobilier',
  icons: {
    icon: '/favicon-linkinvests.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-helvetica">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
