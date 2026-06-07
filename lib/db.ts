import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";

const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }
  return uri;
}

function createMongoClient(): MongoClient {
  const uri = getMongoUri();

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri, mongoOptions);
    }
    return global._mongoClient;
  }

  return new MongoClient(uri, mongoOptions);
}

let client: MongoClient | undefined;

/** Returns a shared MongoClient for the NextAuth MongoDB adapter. */
export function getMongoClient(): MongoClient {
  if (!client) {
    client = createMongoClient();
  }
  return client;
}

const mongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = mongooseCache;

/**
 * Mongoose connection for application models (Users, Projects, Sessions).
 * Reuses the same pool across hot reloads in development.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });
  }

  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}
