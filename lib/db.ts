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
  var _mongoClientPromise: Promise<MongoClient> | undefined;
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

function createMongoClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(getMongoUri(), mongoOptions);
  return client.connect();
}

/**
 * Shared connected MongoClient for the NextAuth MongoDB adapter.
 * Auth.js accepts a Promise<MongoClient> and awaits it internally.
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createMongoClientPromise();
    }
    return global._mongoClientPromise;
  }

  return createMongoClientPromise();
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
      dbName: process.env.MONGODB_DB_NAME,
    });
  }

  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}
