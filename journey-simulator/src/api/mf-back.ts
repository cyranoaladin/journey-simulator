import createClient from "openapi-fetch";
import type { Paths } from "./mf-back-client"; // Generated types
import { API_BASE_URL } from "../utils/api";
import { tokenStore } from "../utils/tokenStore";

export const client = createClient<Paths>({ baseUrl: API_BASE_URL });

// Add Authorization header if token exists
client.use({
  onRequest: async ({ request }) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});

// Typed wrappers for critical flows
export const auth = {
  getWalletChallenge: async (wallet_address: string) =>
    client.POST("/user/wallet-challenge", {
      body: { wallet_address },
    }),

  loginWithWallet: async (
    wallet_address: string,
    message: string,
    signature: string
  ) =>
    client.POST("/user/login-wallet", {
      body: { wallet_address, message, signature },
    }),
};

export const journey = {
  getUserProgress: async () => client.GET("/journey/user-progress", {}),
};

export const agents = {
  listRuns: async (journeyId?: string) =>
    client.GET("/agents/runs", {
      params: {
        query: journeyId ? { journeyId } : {},
      },
    }),
};
