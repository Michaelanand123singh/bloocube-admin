import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Social Media Admin',
  description: 'MVP Admin Panel'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


