import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Rate limiting: max 5 failed attempts per IP per 15 minutes
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const failedAttempts = new Map<string, { count: number; firstAttempt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = failedAttempts.get(key);

  if (!record) return false;

  // Window expired — reset
  if (now - record.firstAttempt > LOGIN_WINDOW_MS) {
    failedAttempts.delete(key);
    return false;
  }

  return record.count >= LOGIN_MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = failedAttempts.get(key);

  if (!record || now - record.firstAttempt > LOGIN_WINDOW_MS) {
    failedAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

function clearAttempts(key: string): void {
  failedAttempts.delete(key);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // Rate limit by IP or email
        const ip = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim()
          || (req?.headers?.['x-real-ip'] as string)
          || 'unknown';
        const rateLimitKey = `login:${ip}`;

        if (isRateLimited(rateLimitKey)) {
          return null; // Silently reject — attacker gets same "invalid credentials" response
        }

        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const rawHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !rawHash) return null;
        if (credentials.email !== adminEmail) {
          recordFailedAttempt(rateLimitKey);
          return null;
        }

        // Hash is stored as base64 on Vercel to avoid $ expansion issues
        const adminPasswordHash = rawHash.startsWith('$2')
          ? rawHash
          : Buffer.from(rawHash, 'base64').toString('utf-8');

        const valid = await bcrypt.compare(credentials.password, adminPasswordHash);
        if (!valid) {
          recordFailedAttempt(rateLimitKey);
          return null;
        }

        // Success — clear failed attempts
        clearAttempts(rateLimitKey);
        return { id: '1', email: adminEmail, name: 'Admin' };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/', // We use a custom modal, not a sign-in page
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
