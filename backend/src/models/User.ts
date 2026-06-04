import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type UserRole = 'admin' | 'owner' | 'user';

export interface UserAttributes {
  id: number;
  name: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public role!: UserRole;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Populated when included via association
  public readonly Bookings?: import('./Booking').Booking[];
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true } },
    role: {
      type: DataTypes.ENUM('admin', 'owner', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  { sequelize, tableName: 'users', timestamps: true }
);

export default User;
