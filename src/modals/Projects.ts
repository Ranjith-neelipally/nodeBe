import { Schema, model } from "mongoose";

const NotesSchema = new Schema({
  projectId: {
    type: String,
    require: true,
    trim: true,
  },
  NoteId: {
    type: String,
    require: true,
    trim: true,
  },
  NoteDate: {
    type: Date,
    require: true,
  },
  Note: {
    type: String,
    require: false,
  },
});

const ProjectSchema = new Schema({
  projectTitle: {
    type: String,
    require: true,
    trim: true,
  },
  projectId: {
    type: String,
    require: true,
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
  note: {
    type: [NotesSchema],
    require: false,
  },
});

export default model("Project", ProjectSchema);
