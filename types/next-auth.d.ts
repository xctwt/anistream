// extending the session type
import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    anilistId?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    anilistId?: string;
  }
}

// AniList Provider types
export interface AniListTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AniListUserProfile {
  id: number;
  name: string;
  avatar: {
    large: string;
    medium: string;
  };
  options: {
    titleLanguage: string;
  };
  mediaListOptions: {
    scoreFormat: string;
  };
}

export interface AniListProviderConfig {
  id: string;
  name: string;
  type: "oauth";
  version: string;
  authorization: {
    url: string;
    params: { scope: string };
  };
  token: {
    url: string;
    request(context: {
      provider: AniListProviderConfig;
      params: { code: string };
    }): Promise<{ tokens: AniListTokens }>;
  };
  userinfo: {
    url: string;
    request(context: { tokens: AniListTokens }): Promise<AniListUserProfile>;
  };
  profile(profile: AniListUserProfile): {
    id: string;
    name: string;
    image?: string;
  };
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
} 