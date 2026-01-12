import express from 'express';
import { Player, Team } from '../db.js';

const router = express.Router();

// Helper to generate IDs
const generateId = () => 'p_' + Math.random().toString(36).substr(2, 9);

// GET /players - List players with filtering
router.get('/', async (req, res) => {
    try {
        const { teamId, search } = req.query;
        let query = {};

        if (teamId) {
            query.teamId = teamId;
        }

        if (search) {
            const searchQuery = search.toLowerCase();
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { nickname: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const players = await Player.find(query);
        const teams = await Team.find();

        const playersWithTeamInfo = players.map(p => {
            const pObj = p.toObject();
            return {
                ...pObj,
                teamName: teams.find(t => t.id === p.teamId)?.name || 'Unknown'
            };
        });

        res.json(playersWithTeamInfo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /players/:id - Get single player
router.get('/:id', async (req, res) => {
    try {
        const player = await Player.findOne({ id: req.params.id });
        if (!player) return res.status(404).json({ error: "Player not found" });
        res.json(player);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /players - Create Player
router.post('/', async (req, res) => {
    const {
        name, nickname, birthDate, position, teamId,
        number, nationality, height, weight, preferredFoot,
        joinDate, status
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!teamId) return res.status(400).json({ error: "Team is required" });

    try {
        // Check if jersey number is unique in the team
        const existingPlayer = await Player.findOne({ teamId, number: parseInt(number) });
        if (existingPlayer) return res.status(400).json({ error: `Jersey number ${number} is already taken in this team.` });

        const newPlayer = new Player({
            id: generateId(),
            name,
            nickname: nickname || '',
            birthDate: birthDate || '',
            position: position || 'Midfielder',
            teamId,
            number: parseInt(number),
            nationality: nationality || '',
            height: parseInt(height),
            weight: parseInt(weight),
            preferredFoot: preferredFoot || 'Right',
            joinDate: joinDate || new Date().toISOString().split('T')[0],
            status: status || 'Active'
        });

        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /players/:id - Update Player
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const player = await Player.findOne({ id });
        if (!player) return res.status(404).json({ error: "Player not found" });

        // Unique number validation
        if (updates.number !== undefined || updates.teamId !== undefined) {
            const teamId = updates.teamId || player.teamId;
            const number = updates.number !== undefined ? parseInt(updates.number) : player.number;

            const isNumberTaken = await Player.findOne({
                id: { $ne: id },
                teamId,
                number
            });
            if (isNumberTaken) return res.status(400).json({ error: `Jersey number ${number} is already taken in this team.` });
        }

        const updatedPlayer = await Player.findOneAndUpdate(
            { id },
            { $set: updates },
            { new: true }
        );

        res.json(updatedPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /players/:id - Delete Player
router.delete('/:id', async (req, res) => {
    try {
        const deletedPlayer = await Player.findOneAndDelete({ id: req.params.id });
        if (!deletedPlayer) return res.status(404).json({ error: "Player not found" });
        res.json({ message: "Player deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

