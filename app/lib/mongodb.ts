import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function volunteersCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const clientPromise = global._mongoClientPromise ?? new MongoClient(uri).connect();
  if (process.env.NODE_ENV !== "production") global._mongoClientPromise = clientPromise;
  const client = await clientPromise;
  return client.db().collection("volunteers");
}

export async function siteContentCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const clientPromise = global._mongoClientPromise ?? new MongoClient(uri).connect();
  if (process.env.NODE_ENV !== "production") global._mongoClientPromise = clientPromise;
  const client = await clientPromise;
  return client.db().collection("site_content");
}
