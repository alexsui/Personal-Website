import Link from 'next/link';

export default function TagBadge({ tag }: { tag: string }) {
  return (
    <Link
      href={`/blog?tag=${encodeURIComponent(tag)}`}
      className="tag"
    >
      {tag}
    </Link>
  );
}
