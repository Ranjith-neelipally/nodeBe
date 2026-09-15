type ClientType = "mobile" | "web";

export type PhotoSignalMessage = {
  id: string;
  userId: string;
  fromDeviceId: string;
  toDeviceId: string;
  type: "offer" | "answer" | "ice-candidate" | "hangup" | "error";
  payload: unknown;
  createdAt: number;
};

type DevicePresence = {
  userId: string;
  deviceId: string;
  clientType: ClientType;
  model?: string;
  platform?: string;
  osVersion?: string;
  lastSeenAt: number;
};

const devices = new Map<string, DevicePresence>();
const signalInbox = new Map<string, PhotoSignalMessage[]>();
const PRESENCE_TTL_MS = 45_000;
const MAX_INBOX_MESSAGES = 100;

const keyFor = (userId: string, deviceId: string) => `${userId}:${deviceId}`;

export function touchPhotoDevicePresence(input: Omit<DevicePresence, "lastSeenAt">) {
  if (!input.deviceId) return;
  devices.set(keyFor(input.userId, input.deviceId), {
    ...input,
    lastSeenAt: Date.now(),
  });
}

export function getOnlinePhotoDevices(userId: string) {
  const now = Date.now();
  return Array.from(devices.values())
    .filter(device => device.userId === userId && now - device.lastSeenAt <= PRESENCE_TTL_MS)
    .map(device => ({
      deviceId: device.deviceId,
      clientType: device.clientType,
      model: device.model,
      platform: device.platform,
      osVersion: device.osVersion,
      lastSeenAt: new Date(device.lastSeenAt).toISOString(),
      available: true,
    }));
}

export function deviceBelongsToUser(userId: string, deviceId: string) {
  const device = devices.get(keyFor(userId, deviceId));
  return Boolean(device && Date.now() - device.lastSeenAt <= PRESENCE_TTL_MS);
}

export function enqueuePhotoSignal(message: Omit<PhotoSignalMessage, "id" | "createdAt">) {
  const item: PhotoSignalMessage = {
    ...message,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
  const inboxKey = keyFor(message.userId, message.toDeviceId);
  const inbox = signalInbox.get(inboxKey) || [];
  inbox.push(item);
  signalInbox.set(inboxKey, inbox.slice(-MAX_INBOX_MESSAGES));
  return item;
}

export function consumePhotoSignals(userId: string, deviceId: string, after?: string) {
  const inboxKey = keyFor(userId, deviceId);
  const inbox = signalInbox.get(inboxKey) || [];
  const startIndex = after ? inbox.findIndex(message => message.id === after) + 1 : 0;
  const messages = inbox.slice(Math.max(0, startIndex));
  if (messages.length) {
    const lastDeliveredIndex = inbox.findIndex(message => message.id === messages[messages.length - 1].id);
    signalInbox.set(inboxKey, inbox.slice(lastDeliveredIndex + 1));
  }
  return messages;
}
