import { User } from '../models/User';

declare module 'express-serve-static-core' {
  interface Request {
    currentUser: User;
  }
}
