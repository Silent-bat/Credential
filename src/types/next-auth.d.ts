import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      /** The user's name. */
      name?: string | null;
      /** The user's email address. */
      email?: string | null;
      /** The user's role. */
      role: string;
      preferredLocale: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    preferredLocale: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's id. */
    id: string;
    /** The user's role. */
    role: string;
    preferredLocale: string;
  }
} 