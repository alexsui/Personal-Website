export function pageTitle(base: string, suffix = 'Samuel Toh') {
  return `${base} · ${suffix}`;
}

export function ogDefaults({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return {
    title,
    description,
    openGraph: { title, description },
  };
}
