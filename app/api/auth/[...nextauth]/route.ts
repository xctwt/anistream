import NextAuth from "next-auth";
import { NextAuthConfig } from "next-auth";
import { AniListProviderConfig } from "@/types/next-auth";

const ANILIST_CLIENT_ID = process.env.ANILIST_CLIENT_ID || "";
const ANILIST_CLIENT_SECRET = process.env.ANILIST_CLIENT_SECRET || "";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

// Define a custom AniList provider for Next-Auth
const AniListProvider: AniListProviderConfig = {
  id: "anilist",
  name: "AniList",
  type: "oauth",
  version: "2.0",
  authorization: {
    url: "https://anilist.co/api/v2/oauth/authorize",
    params: { scope: "" },
  },
  token: {
    url: "https://anilist.co/api/v2/oauth/token",
    async request(context) {
      const { provider, params } = context;
      const { code } = params;
      
      const response = await fetch(provider.token.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: ANILIST_CLIENT_ID,
          client_secret: ANILIST_CLIENT_SECRET,
          redirect_uri: provider.callbackUrl,
          code,
        }),
      });
      
      const tokens = await response.json();
      return { tokens };
    },
  },
  userinfo: {
    url: "https://graphql.anilist.co",
    async request(context) {
      const { tokens } = context;
      const { access_token } = tokens;
      
      // GraphQL query to get user information
      const query = `
        query {
          Viewer {
            id
            name
            avatar {
              large
              medium
            }
            options {
              titleLanguage
            }
            mediaListOptions {
              scoreFormat
            }
          }
        }
      `;
      
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      return data.data.Viewer;
    },
  },
  profile(profile) {
    return {
      id: profile.id.toString(),
      name: profile.name,
      image: profile.avatar?.large || profile.avatar?.medium,
    };
  },
  clientId: ANILIST_CLIENT_ID,
  clientSecret: ANILIST_CLIENT_SECRET,
  callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/anilist`,
};

const authConfig: NextAuthConfig = {
  providers: [AniListProvider as any], // Type cast to avoid provider compatibility issues
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the AniList access token to the token right after sign in
      if (account?.provider === "anilist") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.anilistId = profile?.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send access token and user ID to the client
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.anilistId = token.anilistId as string;
      }
      return session;
    },
  },
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST }; 