import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '~/components/providers/query-provider';
import { AuthProvider } from '~/components/providers/auth-provider';

export const metadata: Metadata = {
  title: 'linkinvests',
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
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
