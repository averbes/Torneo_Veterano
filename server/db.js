import mongoose from 'mongoose';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Team, Player, Match, Standing, Admin } from './models.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function initDB() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/torneo_veteranos';

    console.log(`>>> [DB]: Connecting to MongoDB...`);

    try {
        await mongoose.connect(mongoURI);
        console.log(">>> [DB]: Connected to MongoDB successfully.");

        // Check if we need to seed from db.json
        const teamsCount = await Team.countDocuments();
        if (teamsCount === 0) {
            console.log(">>> [DB]: MongoDB is empty. Attempting to seed from db.json...");
            const dbJsonPath = join(__dirname, 'db.json');

            if (fs.existsSync(dbJsonPath)) {
                const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

                if (data.teams?.length) await Team.insertMany(data.teams);
                if (data.players?.length) await Player.insertMany(data.players);
                if (data.matches?.length) await Match.insertMany(data.matches);
                if (data.standings?.length) await Standing.insertMany(data.standings);

                console.log(">>> [DB]: Data seeded from db.json successfully.");
            } else {
                console.log(">>> [DB]: No db.json found to seed from.");
            }
        }
    } catch (err) {
        console.error(">>> [DB]: MongoDB connection error:", err);
        throw err;
    }
}

export { Team, Player, Match, Standing, Admin };
