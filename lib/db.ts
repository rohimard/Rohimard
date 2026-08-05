import fs from "node:fs";
import path from "node:path";
import type { Database } from "./types";
import { buildSeed } from "./seed";

// Persistencia sencilla en fichero JSON. Suficiente para el MVP / demo:
// un único proceso de servidor mantiene el estado y lo escribe en disco.
// En producción esto se reemplazaría por Postgres/Prisma.

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Cache a nivel de proceso para no leer el fichero en cada request.
const globalForDb = globalThis as unknown as { __pulpoDb?: Database };

function load(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw) as Database;
    }
  } catch {
    // fichero corrupto → regeneramos
  }
  const seeded = buildSeed();
  persist(seeded);
  return seeded;
}

function persist(db: Database): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // entornos de sólo lectura (p.ej. build): mantenemos estado en memoria
  }
}

export function getDb(): Database {
  if (!globalForDb.__pulpoDb) {
    globalForDb.__pulpoDb = load();
  }
  return globalForDb.__pulpoDb;
}

export function saveDb(db: Database): void {
  globalForDb.__pulpoDb = db;
  persist(db);
}

export function resetDb(): Database {
  const seeded = buildSeed();
  saveDb(seeded);
  return seeded;
}
