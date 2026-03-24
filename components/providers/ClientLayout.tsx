'use client';
import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Header />
      <main className="flex-1 container py-8">{children}</main>
      <Footer />
    </ThemeProvider>
  );
}
