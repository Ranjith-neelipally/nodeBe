import { Schema, Types, model } from "mongoose";
import { attachSyncMetadata } from "../../../sync/metadata";
import { ObservationSessions } from "../Observations";

export const PlotSchema = new Schema(
  {
    projectId: {
      type: Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    replication: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    treatment: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    plotIndex: {
      type: [Number],
      required: true,
    },
    notesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// A treatment/replication coordinate identifies one physical plot in a project.
PlotSchema.index({ projectId: 1, userId: 1, treatment: 1, replication: 1 }, { unique: true });

attachSyncMetadata(PlotSchema);

// Keep structured measurements from becoming orphaned when any current or future
// code path removes plots directly (project deletion also removes by projectId).
PlotSchema.pre(["deleteOne", "deleteMany"], { query: true, document: false }, async function () {
  const ids = await this.model.find(this.getFilter(), { _id: 1 });
  (this as any)._deletedPlotIds = ids.map((plot: any) => plot._id);
});
PlotSchema.post(["deleteOne", "deleteMany"], { query: true, document: false }, async function () {
  const ids = (this as any)._deletedPlotIds || [];
  if (ids.length) await ObservationSessions.updateMany({ "records.plotId": { $in: ids } }, { $pull: { records: { plotId: { $in: ids } } } });
});
PlotSchema.post("findOneAndDelete", async function (plot: any) {
  if (plot?._id) await ObservationSessions.updateMany({ "records.plotId": plot._id }, { $pull: { records: { plotId: plot._id } } });
});

export const Plots = model("Plots", PlotSchema);
