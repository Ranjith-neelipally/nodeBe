import { Request } from "express";

export interface Note extends Request {
  body: {
    _id?: string;
    projectId: string;
    plotId: string;
    content: string | string[];
    photoIds?: string[];
    userId: string;
    noteId?: string;
    title?: string;
  };
}

export interface Plot extends Request {
  body: {
    _id?: string;
    projectId: string;
    title: string;
    color: string;
    notesCount: number;
    userId: string;
    replication: number;
    treatment: number;
    plotIndex: number[];
  };
}

export interface Project extends Request {
  body: {
    _id?: string;
    title: string;
    userId: string;
    plotsCount: number;
    replications: number;
    treatments: number;
    location?: string;
  };
}
