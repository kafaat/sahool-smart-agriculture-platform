import type { Request, Response, NextFunction } from "express";

// This middleware fakes a logged-in user
export function noAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Inject a dummy user into the request context
  (req as any).user = {
    openId: "dev-user",
    appId: "dev-app",
    name: "Dev User",
    email: "dev@example.com",
  };
  next();
}
