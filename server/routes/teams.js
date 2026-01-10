import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../db.js';

// Using timestamp-based IDs for simplicity

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET /teams
router.get('/', async (req, res) => {
    await db.read();
    res.json(db.data.teams || []);
});

// POST /teams - Create Team
router.post('/', async (req, res) => {
    const { name, franchiseId, logo } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    await db.read();
    const newTeam = {
        id: 'team_' + Date.now(),
        name,
        franchiseId: franchiseId || 'FREE_AGENT',
        logo: logo || '🛡️',
        status: 'active',
        stats: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 },
        players: [] // Store player IDs here or filtering by teamId in players array?
        // User requested "Bulk upload... 11 starters + 5 subs". 
        // It's cleaner to keep players in a separate collection but link them.
        // However, for the frontend "TeamCard" usage, having them nested or linked is fine.
        // Let's stick to: Teams collection, Players collection (with teamId).
    };

    if (!db.data.teams) db.data.teams = [];
    db.data.teams.push(newTeam);
    await db.write();
    res.status(201).json(newTeam);
});

// POST /teams/upload - Bulk CSV
// Expected CSV headers: name, nickname, number, position, isStarter(bool)
router.post('/upload', upload.single('roster'), async (req, res) => {
    const { teamId } = req.body;
    if (!teamId || !req.file) return res.status(400).json({ error: "Missing teamId or file" });

    await db.read();
    const teams = db.data.teams || [];
    const teamIndex = teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return res.status(404).json({ error: "Team not found" });

    const players = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => players.push(data))
        .on('end', async () => {
            // Process players
            const newPlayers = players.map((p, idx) => ({
                id: 'p_' + Date.now() + '_' + idx,
                teamId: teamId,
                name: p.name || `Bot Player ${idx}`,
                nickname: p.nickname || 'CPU',
                number: p.number || (idx + 1),
                position: p.position || 'MF',
                isStarter: p.isStarter === 'true' || p.isStarter === '1',
                stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
            }));

            // Validate size (fill with bots if < 16)
            while (newPlayers.length < 16) {
                const idx = newPlayers.length;
                newPlayers.push({
                    id: 'bot_' + Date.now() + '_' + idx,
                    teamId: teamId,
                    name: `Auto Bot ${idx}`,
                    nickname: 'ROBO',
                    number: 90 + idx,
                    position: 'SUB',
                    isStarter: idx < 11, // First 11 are starters if file was totally empty?
                    stats: { goals: 0, assists: 0 }
                });
            }

            // Update DB
            // Remove old players for this team? Requirement says "Bulk upload...". Usually implies replacement or filling.
            // Let's remove old players for this team to avoid duplicates.
            if (!db.data.players) db.data.players = [];
            db.data.players = db.data.players.filter(p => p.teamId !== teamId);
            db.data.players.push(...newPlayers);

            await db.write();

            // Clean up file
            fs.unlinkSync(req.file.path);

            res.json({ success: true, count: newPlayers.length, players: newPlayers });
        });
});

// Update Team
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, franchiseId, logo, status } = req.body;

    await db.read();
    const teams = db.data.teams || [];
    const teamIndex = teams.findIndex(t => t.id === id);
    if (teamIndex === -1) return res.status(404).json({ error: "Team not found" });

    db.data.teams[teamIndex] = {
        ...db.data.teams[teamIndex],
        name: name || db.data.teams[teamIndex].name,
        franchiseId: franchiseId || db.data.teams[teamIndex].franchiseId,
        logo: logo || db.data.teams[teamIndex].logo,
        status: status || db.data.teams[teamIndex].status
    };

    await db.write();
    res.json(db.data.teams[teamIndex]);
});

// Delete Team
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();

    // Safety: check if team has matches? (Optional)
    const teams = db.data.teams || [];
    const teamIndex = teams.findIndex(t => t.id === id);
    if (teamIndex === -1) return res.status(404).json({ error: "Team not found" });

    db.data.teams = teams;
    db.data.teams.splice(teamIndex, 1);

    // Also delete players from this team? (Or set to FREE_AGENT)
    db.data.players = (db.data.players || []).filter(p => p.teamId !== id);

    await db.write();
    res.json({ message: "Team and its players removed" });
});

export default router;
