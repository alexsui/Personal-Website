import { getProfile } from '@/lib/db/profile';
import ContactForm from './ContactForm';

export const revalidate = 60;

export default async function ContactPage() {
  const profile = await getProfile();
  const email = profile?.email ?? '';
  return <ContactForm recipientEmail={email} />;
}
