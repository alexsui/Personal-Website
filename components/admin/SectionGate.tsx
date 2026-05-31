'use client';

import { useSession } from 'next-auth/react';

/**
 * Renders children when the section has content (everyone sees it) or when an
 * admin is signed in (so empty sections stay reachable for adding the first item).
 */
export default function SectionGate({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  if (!show && !session) return null;
  return <>{children}</>;
}
