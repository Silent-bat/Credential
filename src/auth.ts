import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from '@/lib/db';
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";

// Extend the session and JWT types to include custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      preferredLocale: string;
      institutionId?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    preferredLocale: string;
    institutionId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const passwordMatch = await compare(credentials.password, user.password);

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          preferredLocale: user.preferredLocale
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.preferredLocale = user.preferredLocale;
        
        // Get the user's institution
        try {
          const userInstitution = await prisma.institutionUser.findFirst({
            where: {
              userId: user.id,
            },
            select: {
              institutionId: true,
            },
          });
          
          if (userInstitution) {
            token.institutionId = userInstitution.institutionId;
          }
        } catch (error) {
          console.error("Error fetching user institution for JWT:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.preferredLocale = token.preferredLocale;
        session.user.institutionId = token.institutionId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Log the redirect URL for debugging
      console.log("NextAuth redirect callback - URL:", url);

      // Handle post-login redirects for role-based dashboard access
      if (url.startsWith(baseUrl) && url.includes('/api/auth/callback')) {
        const token = url.split('callbackUrl=')[1]?.split('&')[0];
        // Extract locale from URL or default to 'en'
        const locale = url.match(/\/([a-z]{2})\//)?.[1] || "en";
        
        // Get user from session and redirect based on role
        try {
          // Since we can't directly access the session here, we'll redirect to a special
          // client-side route that will handle the role-based routing
          return `/${locale}/dashboard/router`;
        } catch (error) {
          console.error("Error in auth redirect:", error);
          return `/${locale}/dashboard/router`;
        }
      }
      
      // Prevent any hardcoded "/dashboard-bypass" redirects
      if (url.includes("/dashboard-bypass")) {
        // Get locale and token from the request context if available
        const locale = url.match(/\/([a-z]{2})\//)?.[1] || "en";
        
        // For debug - log complete URL
        console.log(`Handling dashboard-bypass redirect with locale: ${locale}`);
        
        // Redirect to router page which will handle role-based redirects client-side
        return `/${locale}/dashboard/router`;
      }
      
      // Allow all other redirects
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Modern way to handle auth in App Router
export const auth = async () => {
  return await getServerSession(authOptions);
};

// Helper function to check if a user is authenticated
export const isAuthenticated = async (req: Request) => {
  // Implementation depends on your auth setup
  // This is a placeholder
  return true;
};

// Helper function to check if a user has admin role
export const isAdmin = async (req: Request) => {
  // Implementation depends on your auth setup
  // This is a placeholder
  return true;
};