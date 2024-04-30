import { Request } from "express";

export interface CreateUser extends Request {
  body: {
    userName: string;
    email: string;
    password: string;
  };
}

export interface VerifyEmail extends Request {
  body: {
    userId: string;
    token: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: any;
        name: string;
        verified: boolean;
        projects: string[];
        email?: string;
      };

      token: string;
    }
  }
}
