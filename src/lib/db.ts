import mongoose from "mongoose";

const MONGO_URL =
  process.env.MONGODB_COMPASS_URL ||
  "mongodb://192.168.9.89:27017/new_p4c?tls=false";

if (!MONGO_URL) {
  throw new Error("MongoDB URL missing");
}

type Cached = {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
};

declare global {
  // allow global `var` across hot reloads
  // eslint-disable-next-line no-var
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URL, {
      dbName: "new_p4c",
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}