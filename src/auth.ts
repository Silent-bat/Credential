import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from '@/lib/db';
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";

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
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.preferredLocale = token.preferredLocale as string;
        session.user.institutionId = token.institutionId as string;
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
          // We'll use the default dashboard path and let client-side handle specific redirects
          return `/${locale}/dashboard`;
        } catch (error) {
          console.error("Error in auth redirect:", error);
          return `/${locale}/dashboard`;
        }
      }
      
      // Prevent any hardcoded "/dashboard-bypass" redirects
      if (url.includes("/dashboard-bypass")) {
        // Get locale and token from the request context if available
        const locale = url.match(/\/([a-z]{2})\//)?.[1] || "en";
        
        // For debug - log complete URL
        console.log(`Handling dashboard-bypass redirect with locale: ${locale}`);
        
        // We'll just use a simple redirection to the dashboard with locale
        // The actual role-based routing will be handled by the client components
        return `/${locale}/dashboard`;
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