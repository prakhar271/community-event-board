import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        id?: string;
        name?: string;
        [key: string]: any;
      };
    }
  }
}
