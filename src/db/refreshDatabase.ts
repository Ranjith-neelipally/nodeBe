import { Router } from "express";
import { Projects } from "../modals/Projects";
import { Plots } from "../modals/Projects/Plots";
import { Notes } from "../modals/Projects/Notes";
import Ideas from "../modals/Idea";
import User from "../modals/userModal";
import PasswordResetTokenDocument from "../modals/resetPassword";
import emailVerificationToken from "../modals/userVerification";
import Treatments from "../modals/Treatments";

const router = Router();

const modalUpdates = [
  {
    model: Projects,
    update: {},
  },
  {
    model: Treatments,
    update: {},
  },
  {
    model: Plots,
    update: {},
  },
  {
    model: Notes,
    update: { photoIds: [] },
  },
  {
    model: Ideas,
    update: {},
  },
  {
    model: User,
    update: { bio: "", profilePhotoUrl: "" },
  },
  {
    model: PasswordResetTokenDocument,
    update: {},
  },
  {
    model: emailVerificationToken,
    update: {},
  },
];

router.post("/refresh-modals", async (req, res) => {
  try {
    for (const { model, update } of modalUpdates) {
      if (Object.keys(update).length > 0) {
        await model.updateMany(
          Object.fromEntries(
            Object.keys(update).map((k) => [k, { $exists: false }]),
          ),
          { $set: update },
        );
      }
    }
    res.json({ success: true, message: "All modals refreshed." });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
