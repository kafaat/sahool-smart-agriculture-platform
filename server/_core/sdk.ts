import type { Request } from "express";
import type { User } from "../../drizzle/schema";

// Dummy user for dev
const DEV_USER: User = {
  openId: "dev-user",
  name: "Dev User",
  email: "dev@example.com",
  loginMethod: "none",
  lastSignedIn: new Date(),
};

class SDKServer {
  constructor() {
    console.log("[OAuth] Disabled: running in no-auth development mode");
  }

  // Dummy implementation for exchangeCodeForToken
  async exchangeCodeForToken(code: string, state: string) {
    console.log("[OAuth] exchangeCodeForToken called (skipped in no-auth mode)");
    return {
      accessToken: "dev-access-token",
    };
  }

  // Dummy implementation for getUserInfo
  async getUserInfo(accessToken: string) {
    console.log("[OAuth] getUserInfo called (skipped in no-auth mode)");
    return {
      ...DEV_USER,
      platform: "none",
      loginMethod: "none",
    };
  }

  // Dummy implementation for session token creation
  async createSessionToken(openId: string) {
    console.log("[OAuth] createSessionToken called (skipped in no-auth mode)");
    return "dev-session-token";
  }

  // Dummy implementation for request authentication
  async authenticateRequest(req: Request) {
    console.log("[OAuth] authenticateRequest called (skipped in no-auth mode)");
    return DEV_USER;
  }

  // Optional: if frontend calls getUserInfoWithJwt
  async getUserInfoWithJwt(jwtToken: string) {
    console.log("[OAuth] getUserInfoWithJwt called (skipped in no-auth mode)");
    return {
      ...DEV_USER,
      platform: "none",
      loginMethod: "none",
    };
  }
}

export const sdk = new SDKServer();
