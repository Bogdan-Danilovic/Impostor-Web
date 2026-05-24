import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Impostor — Igra Socijalnog Snalaženja',
  description: 'Otkrij ko je impostor među vama! Multiplayer igra u browseru.',
  metadataBase: new URL('https://impostor-web.vercel.app'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Impostor',
  },
};

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg font-sans scanline">
        <div className="breathing-orb fixed z-0 w-[600px] h-[600px] bg-violet-900/30" style={{ top: -200, left: -200 }} />
        <div className="breathing-orb fixed z-0 w-[400px] h-[400px] bg-indigo-900/20" style={{ bottom: -100, right: -150, animationDelay: '4s' }} />
        {children}
      </body>
    </html>
  );
}
