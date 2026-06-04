import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface BookingAttributes {
  id: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  createdAt?: Date;
}

type BookingCreationAttributes = Optional<BookingAttributes, 'id' | 'createdAt'>;

export class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: number;
  public userId!: number;
  public startTime!: Date;
  public endTime!: Date;
  public readonly createdAt!: Date;

  // Populated when included via association
  public readonly User?: import('./User').User;
}

Booking.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'bookings', timestamps: true, updatedAt: false }
);

export default Booking;
