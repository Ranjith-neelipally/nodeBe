import { Request } from "express";

export interface IdeasInterface extends Request {
  body: {
    userId: string;
    idea: string;
    date: string;
    _id?: string;
    reminderEnabled?: boolean;
    reminderTime?: string | null;
    projectId?: string | null;
    plotId?: string | null;
    completed?: boolean;
    notificationIds?: number[];
  };
}
