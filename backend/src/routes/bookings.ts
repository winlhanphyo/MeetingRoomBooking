import { Router, Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { Booking, BookingAttributes } from '../models/Booking';
import { User } from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

const USER_ATTRS = { model: User, attributes: ['id', 'name', 'role'] };

const parsePage = (query: unknown): { page: number; pageSize: number } => {
  const q = (query ?? {}) as Record<string, unknown>;
  const page     = Math.max(1, parseInt(String(q.page     ?? 1),  10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(q.pageSize ?? 10), 10) || 10));
  return { page, pageSize };
};

const findOverlap = async (startTime: Date, endTime: Date, excludeId?: number): Promise<Booking | null> => {
  const where: WhereOptions<BookingAttributes> = {
    [Op.and]: [
      { startTime: { [Op.lt]: endTime } },
      { endTime: { [Op.gt]: startTime } },
    ],
  };
  if (excludeId !== undefined) {
    (where as Record<string, unknown>).id = { [Op.ne]: excludeId };
  }
  return Booking.findOne({ where, include: [{ model: User, attributes: ['name'] }] });
};

// GET /api/bookings?page=1&pageSize=5
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, pageSize } = parsePage(req.query);
    const { count, rows } = await Booking.findAndCountAll({
      include: [USER_ATTRS],
      order: [['startTime', 'ASC']],
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
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/summary?page=1&pageSize=5
router.get('/summary', authenticate, requireRole('owner', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, pageSize } = parsePage(req.query);

    const [totalBookings, { count, rows: users }] = await Promise.all([
      Booking.count(),
      User.findAndCountAll({
        attributes: ['id', 'name', 'role'],
        include: [{ model: Booking, attributes: ['id', 'startTime', 'endTime', 'createdAt'] }],
        order: [['id', 'ASC']],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        distinct: true,
      }),
    ]);

    const data = users.map(u => ({
      userId: u.id,
      name: u.name,
      role: u.role,
      totalBookings: u.Bookings?.length ?? 0,
      bookings: (u.Bookings ?? []).sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    }));

    res.json({
      data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      totalBookings,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch summary.' });
  }
});

// POST /api/bookings — any authenticated user
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startTime, endTime } = req.body as { startTime?: string; endTime?: string };

    if (!startTime || !endTime) {
      res.status(400).json({ error: 'startTime and endTime are required.' });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Use ISO 8601 (e.g. 2024-06-01T09:00:00Z).' });
      return;
    }
    if (start >= end) {
      res.status(400).json({ error: 'startTime must be strictly before endTime.' });
      return;
    }
    if (start < new Date()) {
      res.status(400).json({ error: 'Cannot create a booking in the past.' });
      return;
    }

    const conflict = await findOverlap(start, end);
    if (conflict) {
      res.status(409).json({
        error: 'This time slot overlaps with an existing booking.',
        conflict: {
          id: conflict.id,
          bookedBy: conflict.User?.name,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
        },
      });
      return;
    }

    const booking = await Booking.create({
      userId: req.currentUser.id,
      startTime: start,
      endTime: end,
    });

    const result = await Booking.findByPk(booking.id, { include: [USER_ATTRS] });
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// DELETE /api/bookings/:id
// user: own only | owner + admin: any
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findByPk(Number(req.params.id), {
      include: [{ model: User, attributes: ['name'] }],
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    const { role, id: currentUserId } = req.currentUser;

    if (role === 'user' && booking.userId !== currentUserId) {
      res.status(403).json({ error: 'You can only delete your own bookings.' });
      return;
    }

    await booking.destroy();
    res.json({ message: 'Booking deleted successfully.' });
  } catch {
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

export default router;
