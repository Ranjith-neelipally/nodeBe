import { Schema, Types, model } from "mongoose";

const ObservationTypeSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: "Projects", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  dataType: { type: String, enum: ["number", "text", "boolean"], required: true },
  unit: { type: String, trim: true, maxlength: 40, default: null },
}, { timestamps: true });
ObservationTypeSchema.index({ projectId: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

const EmbeddedRecordSchema = new Schema({
  plotId: { type: Types.ObjectId, ref: "Plots", required: true },
  value: { type: Schema.Types.Mixed, required: true },
  note: { type: String, trim: true, maxlength: 2000, default: null },
}, { _id: false });

const ObservationSessionSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: "Projects", required: true, index: true },
  observationTypeId: { type: Types.ObjectId, ref: "ObservationTypes", required: true, index: true },
  capturedAt: { type: Date, required: true, default: Date.now },
  sequence: { type: Number, required: true, min: 1 },
  records: { type: [EmbeddedRecordSchema], required: true, default: [] },
}, { timestamps: true });
ObservationSessionSchema.index({ projectId: 1, observationTypeId: 1, capturedAt: 1 });
ObservationSessionSchema.index({ projectId: 1, capturedAt: 1 });
ObservationSessionSchema.index({ projectId: 1, observationTypeId: 1, sequence: 1 }, { unique: true });

export const ObservationTypes = model("ObservationTypes", ObservationTypeSchema);
export const ObservationSessions = model("ObservationSessions", ObservationSessionSchema);
