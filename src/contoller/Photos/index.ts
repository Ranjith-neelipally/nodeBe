import { RequestHandler } from "express";
import { PlotNotes } from "../../modals/Projects/Notes";
import { Projects } from "../../modals/Projects";
import { Plots } from "../../modals/Projects/Plots";
import {
  consumePhotoSignals,
  deviceBelongsToUser,
  enqueuePhotoSignal,
  getOnlinePhotoDevices,
  subscribePhotoSignals,
  touchPhotoDevicePresence,
} from "../../services/photoPresence";

const firstString = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
type PhotoSignalType = "photo-access-request" | "photo-access-response" | "photo-manifest-changed" | "offer" | "answer" | "ice-candidate" | "hangup" | "error";

async function findPhotoNote(userId: string, photoId: string) {
  return PlotNotes.findOne({ userId, "content.photoIds": photoId });
}

function normalizeSignalPayload(type: PhotoSignalType, payload: unknown) {
  const value = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const connectionId = firstString(value.connectionId);
  const senderDeviceId = firstString(value.senderDeviceId);
  const targetDeviceId = firstString(value.targetDeviceId);
  const basePayload = {
    ...(connectionId ? { connectionId } : {}),
    ...(senderDeviceId ? { senderDeviceId } : {}),
    ...(targetDeviceId ? { targetDeviceId } : {}),
  };
  if (type === "offer" || type === "answer") {
    if (value.type !== type || typeof value.sdp !== "string") return null;
    return { ...basePayload, type: value.type, sdp: value.sdp };
  }
  if (type === "ice-candidate") {
    if (typeof value.candidate !== "string") return null;
    return {
      ...basePayload,
      candidate: value.candidate,
      sdpMid: typeof value.sdpMid === "string" ? value.sdpMid : null,
      sdpMLineIndex: typeof value.sdpMLineIndex === "number" ? value.sdpMLineIndex : null,
      usernameFragment: typeof value.usernameFragment === "string" ? value.usernameFragment : undefined,
    };
  }
  if (type === "error") {
    return { ...basePayload, code: firstString(value.code) || "PHOTO_SIGNAL_ERROR" };
  }
  if (type === "photo-access-request") {
    const sessionId = firstString(value.sessionId);
    if (!sessionId) return null;
    return { sessionId, requestedAt: Date.now() };
  }
  if (type === "photo-access-response") {
    const sessionId = firstString(value.sessionId);
    const decision = value.decision === "approved" || value.decision === "rejected" ? value.decision : null;
    if (!sessionId || !decision) return null;
    return { sessionId, decision, reason: firstString(value.reason) || undefined };
  }
  if (type === "photo-manifest-changed") {
    return {
      manifestVersion: firstString(value.manifestVersion) || `${Date.now()}`,
      photoCount: typeof value.photoCount === "number" ? value.photoCount : undefined,
      changedAt: Date.now(),
    };
  }
  return basePayload;
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
    const onlineDevices = getOnlinePhotoDevices(userId.toString());
    const mobileDevices = onlineDevices.filter(device => device.clientType === "mobile");
    const photoDevices = mobileDevices.map(device => ({
      device,
      availablePhotoIds: new Set(device.availablePhotoIds || []),
    }));
    const seenNotePhotos = new Set<string>();
    const photos: Array<Record<string, unknown>> = [];

    for (const note of notesWithPhotos) {
      const plot = await Plots.findById(note.plotId);
      const project = await Projects.findById(note.projectId);
      for (const item of note.content || []) {
        for (const photoId of item.photoIds || []) {
          const notePhotoKey = `${note._id.toString()}:${photoId}`;
          if (seenNotePhotos.has(notePhotoKey)) continue;
          seenNotePhotos.add(notePhotoKey);
          const matchingDevices = photoDevices.filter(({ availablePhotoIds }) => availablePhotoIds.has(photoId));
          const sourceDevices = matchingDevices.length ? matchingDevices : photoDevices.length ? [] : [{ device: null, availablePhotoIds: new Set<string>() }];
          for (const { device } of sourceDevices) {
            photos.push({
              photoId,
              userId: note.userId.toString(),
              projectId: note.projectId.toString(),
              plotId: note.plotId.toString(),
              noteId: note._id.toString(),
              sourceDeviceId: device?.deviceId || null,
              manifestVersion: device?.manifestVersion || null,
              capturedAt: note.createdAt,
              mimeType: "image/jpeg",
              projectTitle: project?.title || note.ProjectTitle || null,
              plotTitle: plot?.title || note.title || null,
              replication: plot?.replication,
              treatment: plot?.treatment,
              notePreview: Array.isArray(item.note) ? item.note.join(" ").slice(0, 240) : "",
              deviceAvailable: Boolean(device),
            });
          }
        }
      }
    }
    if (process.env.NODE_ENV !== "production") {
      mobileDevices.forEach(device => {
        console.log(`[PHOTO MANIFEST] ${JSON.stringify({
          deviceId: device.deviceId,
          version: device.manifestVersion || null,
          count: device.availablePhotoIds?.length || 0,
        })}`);
      });
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
    availablePhotoIds: stringArray(req.body?.availablePhotoIds),
    manifestVersion: firstString(req.body?.manifestVersion) || undefined,
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
  touchPhotoDevicePresence({
    userId,
    deviceId: fromDeviceId,
    clientType: req.headers["x-client-type"] === "mobile" ? "mobile" : "web",
    model: firstString(req.headers["x-device-model"]) || undefined,
    platform: firstString(req.headers["x-device-platform"]) || undefined,
    osVersion: firstString(req.headers["x-device-os-version"]) || undefined,
  });
  const signalType = type as PhotoSignalType;
  if (signalType !== "photo-access-response" && signalType !== "photo-manifest-changed" && !deviceBelongsToUser(userId, toDeviceId)) {
    return res.status(403).json({ error: "Device is not available for this account." });
  }
  if (photoId && !(await findPhotoNote(userId, photoId))) {
    return res.status(404).json({ error: "Photo not found!" });
  }
  if (!["photo-access-request", "photo-access-response", "photo-manifest-changed", "offer", "answer", "ice-candidate", "hangup", "error"].includes(type)) {
    return res.status(400).json({ error: "Unsupported signal type." });
  }
  const payload = normalizeSignalPayload(signalType, req.body?.payload);
  if (!payload) {
    return res.status(400).json({ error: "Malformed signal payload." });
  }
  if (process.env.NODE_ENV !== "production") {
    console.log(`[SIGNAL] ${signalType}`);
  }

  const message = enqueuePhotoSignal({
    userId,
    fromDeviceId,
    toDeviceId,
    type: signalType,
    payload,
  });

  return res.status(202).json({ messageId: message.id });
};

export const TriggerPhotoAccessNotification: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const deviceId = firstString(req.body?.deviceId);
  if (deviceId && !deviceBelongsToUser(userId, deviceId)) {
    return res.status(404).json({ error: "Mobile device is not available for this account." });
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[PHOTO ACCESS PUSH]", {
      userId,
      deviceId: deviceId || "registered-mobile-device",
      title: "ResearchPal Web wants to access your photos",
      body: "If this was you, open ResearchPal and approve the request. Otherwise, ignore this notification.",
    });
  }
  return res.status(202).json({ queued: true });
};

export const GetPhotoSignals: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const deviceId = firstString(req.query?.deviceId) || firstString(req.headers["x-device-id"]);
  const after = firstString(req.query?.after);

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  if (!deviceId) return res.status(400).json({ error: "deviceId is required." });
  touchPhotoDevicePresence({
    userId,
    deviceId,
    clientType: req.headers["x-client-type"] === "mobile" ? "mobile" : "web",
    model: firstString(req.headers["x-device-model"]) || undefined,
    platform: firstString(req.headers["x-device-platform"]) || undefined,
    osVersion: firstString(req.headers["x-device-os-version"]) || undefined,
  });

  return res.status(200).json({ messages: consumePhotoSignals(userId, deviceId, after || undefined) });
};

export const StreamPhotoSignals: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const deviceId = firstString(req.query?.deviceId) || firstString(req.headers["x-device-id"]);

  if (!deviceId) return res.status(400).json({ error: "deviceId is required." });

  touchPhotoDevicePresence({
    userId,
    deviceId,
    clientType: req.headers["x-client-type"] === "mobile" ? "mobile" : "web",
    model: firstString(req.headers["x-device-model"]) || undefined,
    platform: firstString(req.headers["x-device-platform"]) || undefined,
    osVersion: firstString(req.headers["x-device-os-version"]) || undefined,
  });

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  res.write(": connected\n\n");

  const writeSignal = (message: ReturnType<typeof consumePhotoSignals>[number]) => {
    res.write(`id: ${message.id}\n`);
    res.write("event: photo-signal\n");
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  consumePhotoSignals(userId, deviceId).forEach(writeSignal);
  const unsubscribe = subscribePhotoSignals(userId, deviceId, writeSignal);
  const heartbeat = setInterval(() => {
    touchPhotoDevicePresence({
      userId,
      deviceId,
      clientType: req.headers["x-client-type"] === "mobile" ? "mobile" : "web",
      model: firstString(req.headers["x-device-model"]) || undefined,
      platform: firstString(req.headers["x-device-platform"]) || undefined,
      osVersion: firstString(req.headers["x-device-os-version"]) || undefined,
    });
    res.write(": heartbeat\n\n");
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
};
