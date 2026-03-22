import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JudgeHub',
  description: 'A judging application for competitions and events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
