import { Request } from "express";

export interface IdeasInterface extends Request {
  body: {
    userId: string;
    idea: string;
    date: string;
    _id?: string;
  };
}
