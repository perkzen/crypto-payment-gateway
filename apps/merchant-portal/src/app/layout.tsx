import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers/providers';

import '@workspace/ui/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Merchant Portal',
  description: 'Crypto Payment Gateway Merchant Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        suppressHydrationWarning
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
