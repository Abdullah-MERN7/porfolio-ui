import dns from "node:dns";
import mongoose from "mongoose";

// Use public DNS resolvers to prevent `querySrv ECONNREFUSED` with MongoDB Atlas on Windows/local ISP DNS
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

function getMongoUri(): string {
  const uri =
    process.env.MONGODB_URI ||
    process.env["MONGODB_URI "] ||
    process.env[" MONGODB_URI"] ||
    process.env[" MONGODB_URI "];

  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  return uri.trim().replace(/^=/, "").trim();
}

const cached = global.mongooseConnection ?? {
  conn: null,
  promise: null,
};

export async function dbConnect() {
  const uri = getMongoUri();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  const connectionPromise = cached.promise;
  global.mongooseConnection = cached;

  try {
    cached.conn = await connectionPromise;
  } catch (error) {
    if (cached.promise === connectionPromise) {
      cached.promise = null;
    }
    throw error;
  }

  return cached.conn;
}

export async function disconnectDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    global.mongooseConnection = cached;
  }
}
