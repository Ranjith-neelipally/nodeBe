import { Schema, model } from "mongoose";

export interface ProjectDetailsInterface {
  _id: string;
  projectTitle: string;
  location: string;
  replications: number;
  treatments: number;
  notes: Array<{ noteString: string }>;
}

export interface NotesInterface {
  noteString?: string | null | undefined;
}

const NotesSchema = new Schema({
  noteString: {
    type: String,
  },
});

const ProjectSchema = new Schema({
  projectTitle: {
    type: String,
    require: true,
    trim: true,
  },
  _id: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    require: true,
    trim: true,
  },
  replications: {
    type: Number,
    require: true,
    trim: true,
  },
  treatments: {
    type: Number,
    require: true,
    trim: true,
  },
  notes: {
    type: [NotesSchema],
  },
});

export default model("Project", ProjectSchema);
