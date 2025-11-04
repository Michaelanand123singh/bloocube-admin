import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bloocube Admin - Enterprise Management Portal',
  description: 'Professional admin dashboard for managing Bloocube platform - users, campaigns, analytics, and system administration',
  keywords: ['admin', 'dashboard', 'management', 'bloocube', 'enterprise'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


