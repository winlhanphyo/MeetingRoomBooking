import { RequestHandler, Response, NextFunction, Request } from 'express';
import { User, UserRole } from '../models/User';

export const authenticate: RequestHandler = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(401).json({ error: 'Authentication required. Provide X-User-Id header.' });
    return;
  }

  const user = await User.findByPk(Number(userId));
  if (!user) {
    res.status(401).json({ error: 'User not found. Please re-select a user.' });
    return;
  }

  req.currentUser = user;
  next();
};

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.currentUser.role)) {
      res.status(403).json({
        error: `Access denied. This action requires role: ${roles.join(' or ')}.`,
        yourRole: req.currentUser.role,
      });
      return;
    }
    next();
  };
