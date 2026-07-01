import { MongoClient } from "mongodb";
import pg from "pg";
import { config } from "../config.js";

export async function connectDocumentDatabase() {
  const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 1500 });
  await client.connect();
  return client.db("nawapay");
}

export async function connectLedgerDatabase() {
  const pool = new pg.Pool({ connectionString: config.sqlUri, connectionTimeoutMillis: 1500 });
  await pool.query("select 1");
  return pool;
}
