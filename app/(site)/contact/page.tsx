import { getProfile } from '@/lib/db/profile';
import { profile as fallbackProfile } from '@/lib/profile';
import { createPageMetadata } from '@/lib/seo';
import ContactActions from './ContactActions';

export const revalidate = 60;
export const metadata = createPageMetadata({
  title: 'Contact',
  description: 'Get in touch with Samuel Toh by email or connect on LinkedIn.',
  path: '/contact',
});

export default async function ContactPage() {
  const profile = await getProfile();
  const email = profile?.email || fallbackProfile.recipientEmail;
  const linkedin = profile?.social?.linkedin || fallbackProfile.social.linkedin;

  return (
    <div className="container py-16 animate-fade-in">
      <div className="max-w-2xl">
        <p className="section-label mb-4">Contact</p>
        <h1 className="text-4xl sm:text-5xl font-display font-medium mb-4 text-ink dark:text-ink-dark">
          Get in touch
        </h1>
        <p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed max-w-xl mb-10">
          Have a question about something I’ve written, or want to work together? Send me an email.
        </p>

        <ContactActions email={email} />

        <div className="mt-6 pt-6 border-t border-border dark:border-border-dark">
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-secondary dark:text-ink-dark-secondary underline underline-offset-4 decoration-border dark:decoration-border-dark hover:text-ink dark:hover:text-ink-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Connect on LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
