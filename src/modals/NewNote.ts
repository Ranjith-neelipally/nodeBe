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

export default model("NewNote", NotesSchema);
