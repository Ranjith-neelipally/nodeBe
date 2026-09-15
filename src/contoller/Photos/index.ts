import { RequestHandler } from "express";
import { PlotNotes } from "../../modals/Projects/Notes";
import { Projects } from "../../modals/Projects";
import { Plots } from "../../modals/Projects/Plots";
import {
  consumePhotoSignals,
  deviceBelongsToUser,
  enqueuePhotoSignal,
  getOnlinePhotoDevices,
  touchPhotoDevicePresence,
} from "../../services/photoPresence";

const firstString = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;

async function findPhotoNote(userId: string, photoId: string) {
  return PlotNotes.findOne({ userId, "content.photoIds": photoId });
}

export const GetPhotoDetails: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { photoId } = req.query as { photoId: string };

  try {
    const Note = await PlotNotes.findOne({ userId, "content.photoIds": photoId });
    if (!Note) {
      return res.status(404).json({ error: "Photo not found!" });
    }
    const plot = await Plots.findById(Note.plotId);
    const project = await Projects.findById(Note.projectId);

    const response = {
      _id: Note._id,
      projectId: Note.projectId,
      plotId: Note.plotId,
      content: Note.content,
      userId: Note.userId,
      createdAt: Note.createdAt,
      updatedAt: Note.updatedAt,
      title: plot?.title,
      replication: plot?.replication,
      treatment: plot?.treatment,
      replicationName: plot?.replicationName,
      treatmentName: plot?.treatmentName,
      __v: Note.__v,
      ProjectTitle: project?.title,
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetPhotoLibrary: RequestHandler = async (req, res) => {
  const userId = req.user.id;

  try {
    const notesWithPhotos = await PlotNotes.find({ userId });
    const deviceId = firstString(req.headers["x-device-id"]);
    const onlineDevices = getOnlinePhotoDevices(userId.toString());
    const preferredDevice = onlineDevices.find(device => device.clientType === "mobile");
    const photos: Array<Record<string, unknown>> = [];

    for (const note of notesWithPhotos) {
      const plot = await Plots.findById(note.plotId);
      const project = await Projects.findById(note.projectId);
      for (const item of note.content || []) {
        for (const photoId of item.photoIds || []) {
          photos.push({
            photoId,
            userId: note.userId,
            projectId: note.projectId,
            plotId: note.plotId,
            noteId: note._id,
            sourceDeviceId: preferredDevice?.deviceId || deviceId || null,
            capturedAt: note.createdAt,
            mimeType: "image/jpeg",
            projectTitle: project?.title || note.ProjectTitle || null,
            plotTitle: plot?.title || note.title || null,
            replication: plot?.replication,
            treatment: plot?.treatment,
            notePreview: Array.isArray(item.note) ? item.note.join(" ").slice(0, 240) : "",
            deviceAvailable: Boolean(preferredDevice),
          });
        }
      }
    }

    return res.status(200).json({ photos, devices: onlineDevices });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const RegisterPhotoDevice: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const deviceId = firstString(req.body?.deviceId) || firstString(req.headers["x-device-id"]);
  const clientType = req.body?.clientType === "web" ? "web" : "mobile";

  if (!deviceId) return res.status(400).json({ error: "deviceId is required." });

  touchPhotoDevicePresence({
    userId,
    deviceId,
    clientType,
    model: firstString(req.body?.model) || firstString(req.headers["x-device-model"]) || undefined,
    platform: firstString(req.body?.platform) || firstString(req.headers["x-device-platform"]) || undefined,
    osVersion: firstString(req.body?.osVersion) || firstString(req.headers["x-device-os-version"]) || undefined,
  });

  return res.status(200).json({ deviceId, devices: getOnlinePhotoDevices(userId) });
};

export const GetPhotoDevices: RequestHandler = async (req, res) => {
  return res.status(200).json({ devices: getOnlinePhotoDevices(req.user.id.toString()) });
};

export const PostPhotoSignal: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const fromDeviceId = firstString(req.body?.fromDeviceId) || firstString(req.headers["x-device-id"]);
  const toDeviceId = firstString(req.body?.toDeviceId);
  const type = firstString(req.body?.type);
  const photoId = firstString(req.body?.photoId);

  if (!fromDeviceId || !toDeviceId || !type) {
    return res.status(400).json({ error: "fromDeviceId, toDeviceId, and type are required." });
  }
  if (!deviceBelongsToUser(userId, fromDeviceId) || !deviceBelongsToUser(userId, toDeviceId)) {
    return res.status(403).json({ error: "Device is not available for this account." });
  }
  if (photoId && !(await findPhotoNote(userId, photoId))) {
    return res.status(404).json({ error: "Photo not found!" });
  }
  if (!["offer", "answer", "ice-candidate", "hangup", "error"].includes(type)) {
    return res.status(400).json({ error: "Unsupported signal type." });
  }

  const message = enqueuePhotoSignal({
    userId,
    fromDeviceId,
    toDeviceId,
    type: type as "offer" | "answer" | "ice-candidate" | "hangup" | "error",
    payload: req.body?.payload || {},
  });

  return res.status(202).json({ messageId: message.id });
};

export const GetPhotoSignals: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const deviceId = firstString(req.query?.deviceId) || firstString(req.headers["x-device-id"]);
  const after = firstString(req.query?.after);

  if (!deviceId) return res.status(400).json({ error: "deviceId is required." });
  if (!deviceBelongsToUser(userId, deviceId)) {
    return res.status(403).json({ error: "Device is not available for this account." });
  }

  return res.status(200).json({ messages: consumePhotoSignals(userId, deviceId, after || undefined) });
};
