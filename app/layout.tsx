import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Gameful Futures Lab',
  description: 'We build futures through games and play!'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
