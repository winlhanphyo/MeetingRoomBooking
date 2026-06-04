import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, UserRole } from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

const VALID_ROLES: UserRole[] = ['admin', 'owner', 'user'];

// Public — login selector page (id, name, role only, no auth required)
router.get('/select', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'role'],
      order: [['id', 'ASC']],
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Admin: list all users with timestamps — GET /api/users?page=1&pageSize=5
router.get('/', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const page     = Math.max(1, parseInt(String(req.query.page     ?? 1),  10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? 10), 10) || 10));

    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'name', 'role', 'createdAt'],
      order: [['id', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    res.json({
      data: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Admin: create user
router.post('/', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, role } = req.body as { name?: string; role?: string };

    if (!name?.trim()) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }
    if (role && !VALID_ROLES.includes(role as UserRole)) {
      res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}.` });
      return;
    }

    const trimmedName = name.trim();
    const existing = await User.findOne({ where: { name: { [Op.like]: trimmedName } } });
    if (existing) {
      res.status(409).json({ error: `A user named "${existing.name}" already exists.` });
      return;
    }

    const user = await User.create({ name: trimmedName, role: (role as UserRole) ?? 'user' });
    res.status(201).json({ id: user.id, name: user.name, role: user.role, createdAt: user.createdAt });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'SequelizeValidationError') {
      const ve = err as unknown as { errors: { message: string }[] };
      res.status(400).json({ error: ve.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// Admin: delete user — their bookings are cascade deleted
router.delete('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(Number(req.params.id));
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (user.id === req.currentUser.id) {
      res.status(400).json({ error: 'You cannot delete your own account.' });
      return;
    }

    await user.destroy();
    res.json({ message: `User "${user.name}" and all their bookings have been deleted.` });
  } catch {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Admin: change user role
router.patch('/:id/role', authenticate, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role?: string };

    if (!role || !VALID_ROLES.includes(role as UserRole)) {
      res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}.` });
      return;
    }

    const user = await User.findByPk(Number(req.params.id));
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    user.role = role as UserRole;
    await user.save();
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

export default router;
