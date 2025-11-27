import type { Metadata } from 'next';

import './globals.css';
import { QueryProvider } from '~/components/providers/query-provider';
import { AuthProvider } from '~/components/providers/auth-provider';
import { ThemeProvider } from '~/components/providers/theme-provider';
import { Toaster } from '~/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Link Invests',
  description: 'Plateforme d\'investissement immobilier',
  icons: {
    icon: '/logo-dark.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-helvetica">
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </AuthProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
