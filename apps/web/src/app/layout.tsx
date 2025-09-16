import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import Providers from "@/components/providers"
import { WagmiProvider } from 'wagmi';
import { config } from '@/contexts/frame-wallet-context';

const inter = Inter({ subsets: ['latin'] });

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// Embed metadata for Farcaster sharing
const frame = {
  version: "1",
  imageUrl: `${appUrl}/opengraph-image.png`,
  button: {
    title: "Launch celo-tixora",
    action: {
      type: "launch_frame",
      name: "celo-tixora",
      url: appUrl,
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: 'celo-tixora',
  description: 'An event ticketing platform build on Celo',
  openGraph: {
    title: 'celo-tixora',
    description: 'An event ticketing platform build on Celo',
    images: [`${appUrl}/opengraph-image.png`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <WagmiProvider config={config}>
          <Providers>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </Providers>
          </WagmiProvider>
        </div>
      </body>
    </html>
  );
}
