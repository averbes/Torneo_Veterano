import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';
import { Team, Player } from '../db.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET /teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /teams - Create Team
router.post('/', async (req, res) => {
    const { name, franchiseId, logo } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        const newTeam = new Team({
            id: 'team_' + Date.now(),
            name,
            franchiseId: franchiseId || 'FREE_AGENT',
            logo: logo || '🛡️',
            status: 'active'
        });

        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /teams/upload - Bulk CSV
router.post('/upload', upload.single('roster'), async (req, res) => {
    const { teamId } = req.body;
    if (!teamId || !req.file) return res.status(400).json({ error: "Missing teamId or file" });

    try {
        const team = await Team.findOne({ id: teamId });
        if (!team) return res.status(404).json({ error: "Team not found" });

        const playersData = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => playersData.push(data))
            .on('end', async () => {
                const newPlayers = playersData.map((p, idx) => ({
                    id: 'p_' + Date.now() + '_' + idx,
                    teamId: teamId,
                    name: p.name || `Bot Player ${idx}`,
                    nickname: p.nickname || 'CPU',
                    number: p.number || (idx + 1),
                    position: p.position || 'MF',
                    isStarter: p.isStarter === 'true' || p.isStarter === '1',
                    stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 }
                }));

                while (newPlayers.length < 16) {
                    const idx = newPlayers.length;
                    newPlayers.push({
                        id: 'bot_' + Date.now() + '_' + idx,
                        teamId: teamId,
                        name: `Auto Bot ${idx}`,
                        nickname: 'ROBO',
                        number: 90 + idx,
                        position: 'SUB',
                        isStarter: idx < 11,
                        stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 }
                    });
                }

                // Delete old players for this team and insert new ones
                await Player.deleteMany({ teamId });
                await Player.insertMany(newPlayers);

                // Clean up file
                fs.unlinkSync(req.file.path);

                res.json({ success: true, count: newPlayers.length, players: newPlayers });
            });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Team
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, franchiseId, logo, status } = req.body;

    try {
        const updatedTeam = await Team.findOneAndUpdate(
            { id },
            {
                $set: {
                    name,
                    franchiseId,
                    logo,
                    status
                }
            },
            { new: true }
        );

        if (!updatedTeam) return res.status(404).json({ error: "Team not found" });
        res.json(updatedTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Team
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTeam = await Team.findOneAndDelete({ id });
        if (!deletedTeam) return res.status(404).json({ error: "Team not found" });

        // Also delete players from this team
        await Player.deleteMany({ teamId: id });

        res.json({ message: "Team and its players removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
