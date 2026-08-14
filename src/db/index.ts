import mongoose from "mongoose";
import { MONGO_URI } from "../utils/variables";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
let resolvedUri: string | null = null;

async function connectionUri() {
  if (resolvedUri) return resolvedUri;
  if (!MONGO_URI.startsWith("mongodb+srv://") || process.platform !== "win32") {
    resolvedUri = MONGO_URI;
    return resolvedUri;
  }

  const parsed = new URL(MONGO_URI);
  const { stdout } = await execFileAsync("nslookup", ["-type=SRV", `_mongodb._tcp.${parsed.hostname}`], { timeout: 3500 });
  const seeds: string[] = [];
  const pattern = /port\s*=\s*(\d+)[\s\S]*?svr hostname\s*=\s*([^\s]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(stdout))) seeds.push(`${match[2].replace(/\.$/, "")}:${match[1]}`);
  if (!seeds.length) throw new Error("MongoDB SRV records could not be resolved by Windows DNS.");

  const credentials = parsed.username ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@` : "";
  const params = new URLSearchParams(parsed.search);
  if (!params.has("tls")) params.set("tls", "true");
  if (!params.has("authSource")) params.set("authSource", "admin");
  resolvedUri = `mongodb://${credentials}${seeds.join(",")}${parsed.pathname}?${params.toString()}`;
  return resolvedUri;
}

// @ts-ignore
let cached = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 15000,
    };

    cached.promise = connectionUri().then((uri) => mongoose.connect(uri, opts)).then((mongoose) => {
      console.log("Connected to db");
      return mongoose;
    }).catch((err) => {
      console.log(err, "connection failed");
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

mongoose.connection.on("disconnected", () => {
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on("error", () => {
  if (mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }
});

export default dbConnect;
