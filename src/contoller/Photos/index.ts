import { del, get, put } from "@vercel/blob";
import { RequestHandler } from "express";
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { Photos } from "../../modals/Photos";
import { PlotNotes } from "../../modals/Projects/Notes";
import { Projects } from "../../modals/Projects";
import { Plots } from "../../modals/Projects/Plots";

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;
const ENCRYPTED_PHOTO_TYPE = "application/octet-stream";
const PHOTO_VARIANTS = ["original", "standard", "thumbnail"] as const;
type PhotoVariant = typeof PHOTO_VARIANTS[number];
type UploadedPart = { name: string; filename?: string; contentType?: string; data: Buffer };
const firstString = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
const createStorageId = () => randomBytes(32).toString("base64url");
const storagePath = (storageId: string) => `research-pal/${storageId}.bin`;
const isPhotoVariant = (value: string): value is PhotoVariant => PHOTO_VARIANTS.includes(value as PhotoVariant);
const bytesToBase64Url = (bytes: Buffer) => bytes.toString("base64url");
const base64UrlToBytes = (value: string) => Buffer.from(value, "base64url");

async function authorizeRelationship(userId: string, projectId: string, plotId: string, noteId?: string | null) {
  const [project, plot] = await Promise.all([
    Projects.findOne({ _id: projectId, userId }).select("_id"),
    Plots.findOne({ _id: plotId, projectId, userId }).select("_id"),
  ]);
  if (!project || !plot) return false;
  if (!noteId) return true;
  return Boolean(await PlotNotes.exists({ _id: noteId, projectId, plotId, userId }));
}

function readMultipartBody(req: Parameters<RequestHandler>[0]) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_UPLOAD_BYTES) {
        reject(new Error("PHOTO_UPLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseMultipart(buffer: Buffer, contentType = "") {
  const boundary = /boundary=([^;]+)/i.exec(contentType)?.[1]?.replace(/^"|"$/g, "");
  if (!boundary) throw new Error("INVALID_MULTIPART");
  const marker = Buffer.from(`--${boundary}`);
  const parts: UploadedPart[] = [];
  let offset = 0;
  while (offset < buffer.length) {
    const markerIndex = buffer.indexOf(marker, offset);
    if (markerIndex < 0) break;
    const nextOffset = markerIndex + marker.length;
    if (buffer.slice(nextOffset, nextOffset + 2).toString() === "--") break;
    const partStart = nextOffset + 2;
    const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), partStart);
    if (headerEnd < 0) break;
    const headers = buffer.slice(partStart, headerEnd).toString("utf8");
    const partEnd = buffer.indexOf(marker, headerEnd + 4);
    if (partEnd < 0) break;
    const disposition = /content-disposition:\s*form-data;([^\r\n]+)/i.exec(headers)?.[1] || "";
    const name = /name="([^"]+)"/i.exec(disposition)?.[1];
    if (name) {
      const filename = /filename="([^"]*)"/i.exec(disposition)?.[1];
      const contentTypeHeader = /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim();
      const dataEnd = buffer.slice(partEnd - 2, partEnd).toString() === "\r\n" ? partEnd - 2 : partEnd;
      parts.push({ name, filename, contentType: contentTypeHeader, data: buffer.slice(headerEnd + 4, dataEnd) });
    }
    offset = partEnd;
  }
  return parts;
}

function field(parts: UploadedPart[], name: string) {
  return parts.find(part => part.name === name && !part.filename)?.data.toString("utf8").trim() || null;
}

function filePart(parts: UploadedPart[], variant: PhotoVariant) {
  return parts.find(part => part.name === variant && part.filename);
}

function encryptPhotoBytes(plain: Buffer, mimeType: string) {
  const key = randomBytes(32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
  return {
    encrypted,
    metadata: {
      algorithm: "AES-256-GCM" as const,
      key: bytesToBase64Url(key),
      iv: bytesToBase64Url(iv),
      authTagLength: 128,
      mimeType,
    },
  };
}

function decryptPhotoBytes(encrypted: Buffer, encryption: any) {
  const authTagBytes = Number(encryption.authTagLength || 128) / 8;
  const authTag = encrypted.subarray(encrypted.length - authTagBytes);
  const ciphertext = encrypted.subarray(0, encrypted.length - authTagBytes);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    base64UrlToBytes(encryption.key),
    base64UrlToBytes(encryption.iv),
    { authTagLength: authTagBytes },
  );
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

async function uploadEncryptedVariant(part: UploadedPart) {
  if (!part.data.length || part.data.length > MAX_PHOTO_BYTES) throw new Error("INVALID_PHOTO_SIZE");
  const storageId = createStorageId();
  const { encrypted, metadata } = encryptPhotoBytes(part.data, part.contentType || "image/jpeg");
  await put(storagePath(storageId), encrypted, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: ENCRYPTED_PHOTO_TYPE,
  });
  return { storageId, encryption: metadata };
}

function publicVariantMetadata(photoId: string, variants: Record<PhotoVariant, any>) {
  const result: Record<string, any> = {};
  for (const variant of PHOTO_VARIANTS) {
    result[variant] = {
      storageId: variants[variant].storageId,
      url: `/photos/${encodeURIComponent(photoId)}/${variant}`,
      mimeType: variants[variant].encryption?.mimeType || "image/jpeg",
    };
  }
  return result;
}

export const UploadPhoto: RequestHandler = async (req, res) => {
  const uploadedStorageIds: string[] = [];
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured");
      return res.status(503).json({ error: "Photo storage is not configured." });
    }
    const parts = parseMultipart(await readMultipartBody(req), req.headers["content-type"]);
    const userId = req.user.id.toString();
    const projectId = field(parts, "projectId");
    const plotId = field(parts, "plotId");
    const noteId = field(parts, "noteId");
    const capturedAt = field(parts, "capturedAt");
    const requestedPhotoId = firstString(field(parts, "photoId")) || firstString(field(parts, "idempotencyKey"));
    const original = filePart(parts, "original");
    const standard = filePart(parts, "standard") || original;
    const thumbnail = filePart(parts, "thumbnail");
    if (!projectId || !plotId || !requestedPhotoId || !original || !standard || !thumbnail) {
      return res.status(400).json({ error: "Photo upload details are incomplete." });
    }
    if (!(await authorizeRelationship(userId, projectId, plotId, noteId))) {
      return res.status(403).json({ error: "You do not have access to attach photos here." });
    }
    const existingPhoto = await Photos.findOne({ photoId: requestedPhotoId, userId }).lean();
    if (existingPhoto) {
      return res.status(200).json({ photo: { ...existingPhoto, variants: publicVariantMetadata(existingPhoto.photoId, existingPhoto.variants as any) } });
    }
    const photoId = requestedPhotoId || randomUUID();
    const originalVariant = await uploadEncryptedVariant(original);
    uploadedStorageIds.push(originalVariant.storageId);
    const standardVariant = standard === original ? originalVariant : await uploadEncryptedVariant(standard);
    if (standardVariant !== originalVariant) uploadedStorageIds.push(standardVariant.storageId);
    const thumbnailVariant = await uploadEncryptedVariant(thumbnail);
    uploadedStorageIds.push(thumbnailVariant.storageId);
    const variants = { original: originalVariant, standard: standardVariant, thumbnail: thumbnailVariant };
    const photo = await Photos.create({
      photoId,
      userId,
      projectId,
      plotId,
      noteId: noteId || null,
      variants,
      capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
    });
    if (noteId) {
      await PlotNotes.updateOne({ _id: noteId, userId, projectId, plotId }, { $addToSet: { "content.0.photoIds": photoId } });
    }
    const photoObject = photo.toObject();
    return res.status(201).json({ photo: { ...photoObject, variants: publicVariantMetadata(photoId, photoObject.variants as any) } });
  } catch (error: any) {
    if (uploadedStorageIds.length) await del(uploadedStorageIds.map(storagePath)).catch(() => undefined);
    if (error?.message === "PHOTO_UPLOAD_TOO_LARGE" || error?.message === "INVALID_PHOTO_SIZE") {
      return res.status(400).json({ error: "Choose a photo up to 20 MB." });
    }
    console.error("Unable to upload photo", error);
    return res.status(500).json({ error: "Unable to upload the photo. Please try again." });
  }
};

export const GetPhotoLibrary: RequestHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await Photos.find({ userId }).sort({ capturedAt: -1 }).lean();
    const [projects, plots, notes] = await Promise.all([
      Projects.find({ _id: { $in: records.map(photo => photo.projectId) }, userId }).select("title").lean(),
      Plots.find({ _id: { $in: records.map(photo => photo.plotId) }, userId }).select("title replication treatment").lean(),
      PlotNotes.find({ _id: { $in: records.map(photo => photo.noteId).filter(Boolean) }, userId }).select("content").lean(),
    ]);
    const projectMap = new Map(projects.map(project => [project._id.toString(), project]));
    const plotMap = new Map(plots.map(plot => [plot._id.toString(), plot]));
    const noteMap = new Map(notes.map(note => [note._id.toString(), note]));
    const photos = records.map(photo => {
      const note = photo.noteId ? noteMap.get(photo.noteId.toString()) : null;
      const project = projectMap.get(photo.projectId.toString());
      const plot = plotMap.get(photo.plotId.toString());
      return {
        photoId: photo.photoId, userId: photo.userId.toString(), projectId: photo.projectId.toString(),
        plotId: photo.plotId.toString(), noteId: photo.noteId?.toString() || null,
        variants: publicVariantMetadata(photo.photoId, photo.variants as any),
        capturedAt: photo.capturedAt, projectTitle: project?.title || null, plotTitle: plot?.title || null,
        replication: plot?.replication, treatment: plot?.treatment,
        notePreview: note?.content?.flatMap(item => item.note || []).join(" ").slice(0, 240) || "",
      };
    });
    return res.status(200).json({ photos });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load photos." });
  }
};

export const GetPhotoDetails: RequestHandler = async (req, res) => {
  const photoId = firstString(req.query.photoId);
  const photo = photoId ? await Photos.findOne({ photoId, userId: req.user.id }).lean() : null;
  if (!photo) return res.status(404).json({ error: "Photo not found!" });
  const [note, plot, project] = await Promise.all([
    photo.noteId ? PlotNotes.findOne({ _id: photo.noteId, userId: req.user.id }).lean() : null,
    Plots.findOne({ _id: photo.plotId, userId: req.user.id }).lean(),
    Projects.findOne({ _id: photo.projectId, userId: req.user.id }).lean(),
  ]);
  return res.status(200).json({ ...photo, variants: publicVariantMetadata(photo.photoId, photo.variants as any), _id: note?._id, content: note?.content || [], title: plot?.title, replication: plot?.replication, treatment: plot?.treatment, ProjectTitle: project?.title });
};

export const FetchPhotoVariant: RequestHandler = async (req, res) => {
  try {
    const variant = req.params.variant;
    if (!isPhotoVariant(variant)) return res.status(404).json({ error: "Photo not found." });
    const photo = await Photos.findOne({ photoId: req.params.photoId, userId: req.user.id }).lean();
    if (!photo) return res.status(404).json({ error: "Photo not found." });
    const variantPayload = (photo.variants as any)[variant];
    const blob = await get(storagePath(variantPayload.storageId), { access: "private", useCache: false });
    if (!blob || blob.statusCode !== 200 || !blob.stream) return res.status(404).json({ error: "Photo not found." });
    const encrypted = Buffer.from(await new Response(blob.stream).arrayBuffer());
    const decrypted = decryptPhotoBytes(encrypted, variantPayload.encryption);
    res.setHeader("Content-Type", variantPayload.encryption.mimeType || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=300");
    return res.status(200).send(decrypted);
  } catch (error) {
    console.error("Unable to fetch photo", error);
    return res.status(500).json({ error: "Unable to load photo." });
  }
};

export const DeletePhoto: RequestHandler = async (req, res) => {
  try {
    const photo = await Photos.findOne({ photoId: req.params.photoId, userId: req.user.id });
    if (!photo) return res.status(404).json({ error: "Photo not found." });
    const storageIds = new Set(Object.values((photo.toObject() as any).variants || {}).map((variant: any) => variant.storageId).filter(Boolean));
    await del([...storageIds].map(storagePath));
    await Promise.all([
      PlotNotes.updateMany({ userId: req.user.id, "content.photoIds": photo.photoId }, { $pull: { "content.$[].photoIds": photo.photoId } }),
      Photos.deleteOne({ _id: photo._id, userId: req.user.id }),
    ]);
    return res.status(204).send();
  } catch (error) {
    console.error("Unable to delete photo", error);
    return res.status(500).json({ error: "Unable to delete the photo. Please try again." });
  }
};
