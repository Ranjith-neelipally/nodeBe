import { Schema, model } from "mongoose";

export interface NotesInterface{
  ProjectId:string,
  NoteId:string,
  NoteDate:Date,
  Note:string
}

const NotesSchema = new Schema({
  ProjectId:{
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
    require: true,
  },
});

export default model("NewNote", NotesSchema);
