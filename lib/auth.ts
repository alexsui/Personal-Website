import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const rawHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !rawHash) return null;
        if (credentials.email !== adminEmail) return null;

        // Hash is stored as base64 on Vercel to avoid $ expansion issues
        const adminPasswordHash = rawHash.startsWith('$2')
          ? rawHash
          : Buffer.from(rawHash, 'base64').toString('utf-8');

        const valid = await bcrypt.compare(credentials.password, adminPasswordHash);
        if (!valid) return null;

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
