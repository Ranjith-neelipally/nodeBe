import mongoose from "mongoose";
import User from "../modals/userModal";
import Ideas from "../modals/Idea";
import Treatments from "../modals/Treatments";
import { ErrorLog } from "../modals/ErrorLog";
import { Projects } from "../modals/Projects";
import { Plots } from "../modals/Projects/Plots";
import { PlotNotes } from "../modals/Projects/Notes";
import { ObservationSessions, ObservationTypes } from "../modals/Projects/Observations";
import { OperationReceipt } from "../modals/Sync/OperationReceipt";
import { SyncChange } from "../modals/Sync/SyncChange";
import { SyncConflict } from "../modals/Sync/SyncConflict";
import { AccountDeletionOtp } from "../modals/AccountDeletionOtp";

export async function deleteUserAccount(userId: string, otpId: string) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const projectIds = (await Projects.find({ userId }, { _id: 1 }, { session }).lean()).map(p => p._id);
      const consumed = await AccountDeletionOtp.updateOne(
        { _id: otpId, userId, purpose: "ACCOUNT_DELETE", consumedAt: null },
        { $set: { consumedAt: new Date() } }, { session },
      );
      if (consumed.modifiedCount !== 1) throw new Error("Deletion verification code was already used");
      await ObservationSessions.deleteMany({ projectId: { $in: projectIds } }, { session });
      await ObservationTypes.deleteMany({ projectId: { $in: projectIds } }, { session });
      await PlotNotes.deleteMany({ $or: [{ userId }, { projectId: { $in: projectIds } }] }, { session });
      await Plots.deleteMany({ $or: [{ userId }, { projectId: { $in: projectIds } }] }, { session });
      await Ideas.deleteMany({ $or: [{ userId }, { projectId: { $in: projectIds } }] }, { session });
      await Treatments.deleteMany({ projectId: { $in: projectIds.map(String) } }, { session });
      await OperationReceipt.deleteMany({ userId }, { session });
      await SyncChange.deleteMany({ userId }, { session });
      await SyncConflict.deleteMany({ userId }, { session });
      await ErrorLog.deleteMany({ userId: String(userId) }, { session });
      await Projects.deleteMany({ userId }, { session });
      await AccountDeletionOtp.deleteMany({ userId }, { session });
      const result = await User.deleteOne({ _id: userId }, { session });
      if (result.deletedCount !== 1) throw new Error("Account no longer exists");
    });
  } finally {
    await session.endSession();
  }
}
