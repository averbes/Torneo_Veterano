import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

// Configure lowdb to write to db.json
const adapter = new JSONFile(file);
const db = new Low(adapter, { admin: {}, teams: [], matches: [], standings: [] });

export async function initDB() {
    await db.read();

    // Ensure all required collections exist
    db.data = db.data || {};
    db.data.meta = db.data.meta || { version: "1.0", admin_user: "admin" };
    db.data.teams = db.data.teams || [];
    db.data.players = db.data.players || [];
    db.data.matches = db.data.matches || [];
    db.data.standings = db.data.standings || [];

    await db.write();
}

export { db };
