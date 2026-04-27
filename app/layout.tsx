import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ServiceWorkerRegistration } from '@/components/shared/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'A mobile-first PWA for tracking daily habits locally.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Habit Tracker',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFF8F5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
