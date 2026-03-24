import Button from '@/components/ui/Button';
import Image from 'next/image';
import { DbProfile } from '@/lib/db/types';

type Props = { profile: DbProfile };

export default function Hero({ profile }: Props) {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="animate-fade-in-up">
            {/* Section label */}
            <p className="section-label mb-6">Portfolio</p>

            {/* Main heading — large editorial serif */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[1.05] mb-6 text-ink dark:text-ink-dark">
              Hi, I&apos;m{' '}
              <span className="italic">{profile.name.split(' ')[0]}</span>
            </h1>

            {/* Bio */}
            <p className="text-lg text-ink-secondary dark:text-ink-dark-secondary leading-relaxed max-w-lg mb-10">
              {profile.bio}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button href={profile.cta.href ?? '/about'}>{profile.cta.label ?? 'About me'}</Button>
              <Button href="/contact" variant="secondary">
                Get in touch
              </Button>
            </div>
          </div>

          {/* Profile Image */}
          <div
            className="justify-self-center lg:justify-self-end animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64">
              {/* Subtle decorative ring */}
              <div className="absolute inset-0 rounded-full border border-border dark:border-border-dark" />
              <div className="absolute inset-2 rounded-full overflow-hidden">
                <Image
                  src={profile.photo_url ?? '/images/profile.jpg'}
                  alt={profile.name}
                  width={256}
                  height={256}
                  className="w-full h-full object-cover rounded-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {profile.highlights && profile.highlights.length > 0 && (
          <div
            className="mt-20 animate-fade-in-up"
            style={{ animationDelay: '240ms' }}
          >
            <p className="section-label mb-5">Highlights</p>
            <ul className="space-y-2.5 text-ink-secondary dark:text-ink-dark-secondary">
              {profile.highlights.map((h, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="w-1 h-1 rounded-full bg-ink-muted shrink-0 translate-y-[-1px]" />
                  {h.url && h.label ? (
                    <span>
                      {h.text.split(h.label)[0]}
                      <a
                        href={h.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 decoration-border dark:decoration-border-dark hover:decoration-ink dark:hover:decoration-ink-dark transition-colors"
                      >
                        {h.label}
                      </a>
                      {h.text.split(h.label)[1] ?? ''}
                    </span>
                  ) : h.url ? (
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-border dark:decoration-border-dark hover:decoration-ink dark:hover:decoration-ink-dark transition-colors"
                    >
                      {h.text}
                    </a>
                  ) : (
                    h.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
