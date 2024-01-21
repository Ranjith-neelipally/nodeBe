import { Schema, model } from "mongoose";

export interface ProjectDetailsInterface {
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
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  replications: {
    type: Number,
    required: true,
    trim: true,
  },
  treatments: {
    type: Number,
    required: true,
    trim: true,
  },
  notes: {
    type: [NotesSchema],
  },
});

export default model("Project", ProjectSchema);
