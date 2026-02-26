import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import ThemeProvider from '../components/global/ThemeProvider';

const euclidCircularB = localFont({
  src: [
    { path: '../public/fonts/EuclidCircularB-Light.otf', weight: '300', style: 'normal' },
    { path: '../public/fonts/EuclidCircularB-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/EuclidCircularB-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/EuclidCircularB-Semibold.otf', weight: '600', style: 'normal' },
    { path: '../public/fonts/EuclidCircularB-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-euclid',
  display: 'swap',
});

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
    <html lang="en" className={euclidCircularB.variable}>
      <body className="min-h-screen bg-onyx-100">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
