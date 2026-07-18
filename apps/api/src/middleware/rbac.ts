import { Request, Response, NextFunction } from 'express';

// Role hierarchy — higher number = more permissions.
// Each role includes all permissions of lower roles.
export const ROLE_HIERARCHY: Record<string, number> = {
  AI_AGENT: 1,
  VIEWER:   2,
  MANAGER:  3,
  ADMIN:    4,
  OWNER:    5,
};

/**
 * requireRole(roles) — middleware factory.
 *
 * Passes if the authenticated user's role is >= the minimum level
 * of ANY role in the provided list.
 *
 * Examples:
 *   requireRole(['ADMIN'])    → must be ADMIN or OWNER
 *   requireRole(['VIEWER'])   → must be VIEWER, MANAGER, ADMIN, or OWNER
 *   requireRole(['MANAGER', 'AI_AGENT'])
 *       → minimum is AI_AGENT (1), so everyone passes — use carefully
 *
 * Place AFTER requireAuth so req.user is populated.
 */
export function requireRole(roles: string[]) {
  const minLevel = Math.min(...roles.map((r) => ROLE_HIERARCHY[r] ?? 999));

  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;

    if (userLevel < minLevel) {
      res.status(403).json({
        error: `Insufficient permissions. Required: ${roles.join(' or ')} (or higher).`,
        yourRole: user.role,
      });
      return;
    }

    next();
  };
}
