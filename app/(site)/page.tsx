import Hero from '@/components/layout/Hero';
import PreviewList from '@/components/blog/PreviewList';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="h-px bg-border dark:bg-border-dark" />
      <section className="container py-20">
        <PreviewList />
      </section>
    </>
  );
}
