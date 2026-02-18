import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ACKO Insurance',
  description: 'Health, Car & Bike, and Life Insurance — all in one place.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-onyx-100">
        {children}
      </body>
    </html>
  );
}
