import { Request } from "express";

export interface CreateUser extends Request {
  body: {
    userName: string;
    email: string;
    password: string;
  };
}
