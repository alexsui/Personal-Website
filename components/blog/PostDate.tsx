const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function PostDate({ date, className }: { date: string; className?: string }) {
  return <time dateTime={date} className={className}>{dateFormat.format(new Date(date))}</time>;
}
