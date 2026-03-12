import mongoose from "mongoose";
import { MONGO_URI } from "../utils/variables";
import dns from "dns";

// Force Google DNS for SRV resolution to fix ETIMEOUT on certain networks (e.g., JioFiber)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const URI = MONGO_URI as string;

// @ts-ignore
let cached = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    };

    cached.promise = mongoose.connect(URI, opts).then((mongoose) => {
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

export default dbConnect;
