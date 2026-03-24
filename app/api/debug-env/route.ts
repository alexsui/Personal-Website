import { NextResponse } from 'next/server';

export async function GET() {
  const hash = process.env.ADMIN_PASSWORD_HASH ?? '';
  return NextResponse.json({
    hashLength: hash.length,
    hashPrefix: hash.substring(0, 10),
    startsWithDollar: hash.startsWith('$'),
    startsWith2b: hash.startsWith('$2b'),
    email: process.env.ADMIN_EMAIL ?? 'not set',
    secretSet: !!process.env.NEXTAUTH_SECRET,
    nextauthUrl: process.env.NEXTAUTH_URL ?? 'not set',
  });
}
