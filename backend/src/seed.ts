import 'dotenv/config';
import sequelize from './config/database';
import { User } from './models/User';
import { Booking } from './models/Booking';
import './models'; // register associations

const seed = async (): Promise<void> => {
  await sequelize.sync({ force: true });
  console.log('Tables reset.');

  const [alice, bob, charlie, diana] = await User.bulkCreate([
    { name: 'Alice', role: 'admin' },
    { name: 'Bob', role: 'owner' },
    { name: 'Charlie', role: 'user' },
    { name: 'Diana', role: 'user' },
  ]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const h = (hours: number, mins = 0): Date => {
    const d = new Date(tomorrow);
    d.setHours(hours, mins, 0, 0);
    return d;
  };

  await Booking.bulkCreate([
    { userId: charlie.id, startTime: h(9), endTime: h(10) },
    { userId: diana.id, startTime: h(11), endTime: h(12) },
    { userId: bob.id, startTime: h(14), endTime: h(15, 30) },
    { userId: alice.id, startTime: h(16), endTime: h(17) },
  ]);

  console.log('Seeded users:', { alice: alice.id, bob: bob.id, charlie: charlie.id, diana: diana.id });
  console.log('Seeded 4 sample bookings for tomorrow.');
  process.exit(0);
};

seed().catch(err => {
  console.error((err as Error).message);
  process.exit(1);
});
