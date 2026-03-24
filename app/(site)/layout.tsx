import '../globals.css';
import ClientLayout from '@/components/providers/ClientLayout';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Samuel Toh — Personal Website',
  description: 'Portfolio, blog, and contact.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
