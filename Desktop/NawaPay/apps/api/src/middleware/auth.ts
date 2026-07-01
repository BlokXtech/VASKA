import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

export interface AuthenticatedRequest extends Request {
  actorId?: string;
}

export function issueServiceToken(actorId: string) {
  return jwt.sign({ sub: actorId, scope: "payments:write compliance:read" }, config.jwtSecret, {
    expiresIn: "15m"
  });
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing_bearer_token" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice("Bearer ".length), config.jwtSecret);
    req.actorId = typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : "unknown";
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}
