export function buildMailto({
  to,
  name,
  email,
  message,
}: {
  to: string;
  name: string;
  email: string;
  message: string;
}) {
  const subject = `[Website] ${name}`;
  const body = `Name: ${name}%0AEmail: ${email}%0A%0A${encodeURIComponent(message)}`;
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
}
