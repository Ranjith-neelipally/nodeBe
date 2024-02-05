import { Schema, model } from "mongoose";

export interface TreatmentDetailsInterface {
  projectId?: unknown;
  treatments: Number;
  replications: number;
}

const TreatmentsSchema = new Schema({
  projectId: {
    type: String,
    required: true,
    trim: true,
  },
  treatments: {
    type: Number,
    required: true,
    trim: true,
  },
  replications: {
    type: Number,
    required: true,
    trim: true,
  },
});

export default model("Treatments", TreatmentsSchema);
// export interface NotesInterface {
//   noteString?: string | null | undefined;
//   photoString?: string | any;
//   index?: number;
//   cellName?: string;
// }

// const NotesSchema = new Schema({
//   noteString: {
//     type: String,
//   },
//   photoString: {
//     type: String,
//   },
//   index: {
//     type: Number,
//   },
//   cellName: {
//     type: String,
//   },
// })