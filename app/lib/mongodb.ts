import { MongoClient } from "mongodb";

const connectionTimeoutMs = 8_000;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function mongoClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      connectTimeoutMS: connectionTimeoutMs,
      serverSelectionTimeoutMS: connectionTimeoutMs
    });
    const connection = new Promise<MongoClient>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("MongoDB connection timed out.")), connectionTimeoutMs);
      client.connect().then(
        (connectedClient) => {
          clearTimeout(timeout);
          resolve(connectedClient);
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      );
    });
    global._mongoClientPromise = connection;
    void connection.catch(() => {
      // A transient DNS or Atlas outage must not poison future requests for the
      // lifetime of the server. The next request can establish a fresh client.
      if (global._mongoClientPromise === connection) global._mongoClientPromise = undefined;
      return client.close().catch(() => undefined);
    });
  }

  return global._mongoClientPromise;
}

export async function volunteersCollection() {
  const client = await mongoClientPromise();
  return client.db().collection("volunteers");
}

export async function siteContentCollection() {
  const client = await mongoClientPromise();
  return client.db().collection("site_content");
}
