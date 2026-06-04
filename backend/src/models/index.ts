import { User } from './User';
import { Booking } from './Booking';

// Deleting a user cascades and removes all their bookings.
User.hasMany(Booking, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Booking.belongsTo(User, { foreignKey: 'userId' });

export { User, Booking };
