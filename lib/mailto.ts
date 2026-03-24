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
  const subject = `[Website] ${name} (${email})`;
  const body = encodeURIComponent(message);
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
}
