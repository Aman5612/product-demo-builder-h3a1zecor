import { AuthOptions, getServerSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

declare module "next-auth" {
  interface User {
    googleDriveAccessToken?: string;
    googleDriveRefreshToken?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }
        
        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || "",
          role: user.role,
          username: user.username || "",
          token: "" // Not used directly since NextAuth handles tokens
        } as User;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const { email, name } = profile!;
        const response = await fetch("/api/users/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
        const data = await response.json();
        if (response.ok && data.data) {
          user.id = data.data.user.id;
          user.username = data.data.user.username;
          user.name = data.data.user.name;
          user.email = data.data.user.email;
          user.token = data.data.token;
          user.role = data.data.user.role;
          return true;
        } else {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.token = user.token;
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      if (account?.provider === 'google' && account?.access_token) {
        token.googleDriveAccessToken = account.access_token;
        token.googleDriveRefreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          name: token.name ?? "",
          email: token.email,
          role: token.role,
          token: token.token,
          googleDriveAccessToken: token.googleDriveAccessToken,
          googleDriveRefreshToken: token.googleDriveRefreshToken
        } as User;
        session.token = token.token;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const getAuthSession = async () => {
  const session = await getServerSession(authOptions);
  return session;
};
