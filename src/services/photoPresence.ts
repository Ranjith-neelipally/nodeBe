type ClientType = "mobile" | "web";

export type PhotoSignalMessage = {
  id: string;
  userId: string;
  fromDeviceId: string;
  toDeviceId: string;
  type: "photo-access-request" | "photo-access-response" | "photo-manifest-changed" | "offer" | "answer" | "ice-candidate" | "hangup" | "error";
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
  availablePhotoIds?: string[];
  manifestVersion?: string;
  lastSeenAt: number;
};

const devices = new Map<string, DevicePresence>();
const signalInbox = new Map<string, PhotoSignalMessage[]>();
const signalSubscribers = new Map<string, Set<(message: PhotoSignalMessage) => void>>();
const PRESENCE_TTL_MS = 45_000;
const MAX_INBOX_MESSAGES = 1000;

const keyFor = (userId: string, deviceId: string) => `${userId}:${deviceId}`;

export function touchPhotoDevicePresence(input: Omit<DevicePresence, "lastSeenAt">) {
  if (!input.deviceId) return;
  const existing = devices.get(keyFor(input.userId, input.deviceId));
  devices.set(keyFor(input.userId, input.deviceId), {
    ...input,
    availablePhotoIds: input.availablePhotoIds ?? existing?.availablePhotoIds ?? [],
    manifestVersion: input.manifestVersion ?? existing?.manifestVersion,
    lastSeenAt: Date.now(),
  });
  if (process.env.NODE_ENV !== "production") {
    console.log(`[PHOTO DEVICE] ${JSON.stringify({
      userId: input.userId,
      deviceId: input.deviceId,
      event: existing ? "active" : "registered",
      clientType: input.clientType,
    })}`);
  }
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
      availablePhotoIds: device.availablePhotoIds || [],
      manifestVersion: device.manifestVersion,
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
  signalSubscribers.get(inboxKey)?.forEach((subscriber) => subscriber(item));
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

export function subscribePhotoSignals(
  userId: string,
  deviceId: string,
  subscriber: (message: PhotoSignalMessage) => void,
) {
  const inboxKey = keyFor(userId, deviceId);
  const subscribers = signalSubscribers.get(inboxKey) || new Set<(message: PhotoSignalMessage) => void>();
  subscribers.add(subscriber);
  signalSubscribers.set(inboxKey, subscribers);

  return () => {
    const currentSubscribers = signalSubscribers.get(inboxKey);
    if (!currentSubscribers) return;
    currentSubscribers.delete(subscriber);
    if (!currentSubscribers.size) signalSubscribers.delete(inboxKey);
  };
}
