import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Helper to generate IDs
const generateId = () => 'p_' + Math.random().toString(36).substr(2, 9);

// GET /players - List players with optional filtering and pagination
router.get('/', async (req, res) => {
    await db.read();
    let players = db.data.players || [];

    const { teamId, search } = req.query;

    if (teamId) {
        players = players.filter(p => p.teamId === teamId);
    }

    if (search) {
        const query = search.toLowerCase();
        players = players.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.nickname && p.nickname.toLowerCase().includes(query))
        );
    }

    // Attach team names for display
    const teams = db.data.teams || [];
    const playersWithTeamInfo = players.map(p => ({
        ...p,
        teamName: teams.find(t => t.id === p.teamId)?.name || 'Unknown'
    }));

    res.json(playersWithTeamInfo);
});

// GET /players/:id - Get single player
router.get('/:id', async (req, res) => {
    await db.read();
    const players = db.data.players || [];
    const player = players.find(p => p.id === req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
});

// POST /players - Create Player
router.post('/', async (req, res) => {
    const {
        name, nickname, birthDate, position, teamId,
        number, nationality, height, weight, preferredFoot,
        joinDate, status
    } = req.body;

    // Validations
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!teamId) return res.status(400).json({ error: "Team is required" });

    // Check if jersey number is unique in the team
    await db.read();
    const players = db.data.players || [];
    const isNumberTaken = players.some(p => p.teamId === teamId && p.number === parseInt(number));
    if (isNumberTaken) return res.status(400).json({ error: `Jersey number ${number} is already taken in this team.` });

    // Date of birth validation (not in the future)
    const dob = new Date(birthDate);
    if (dob > new Date()) return res.status(400).json({ error: "Birth date cannot be in the future" });

    // Height validation (150-220)
    if (height < 150 || height > 220) return res.status(400).json({ error: "Height must be between 150 and 220 cm" });

    // Weight validation (40-120)
    if (weight < 40 || weight > 120) return res.status(400).json({ error: "Weight must be between 40 and 120 kg" });

    const newPlayer = {
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
        status: status || 'Active',
        stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 }
    };

    if (!db.data.players) db.data.players = [];
    db.data.players.push(newPlayer);
    await db.write();

    res.status(201).json(newPlayer);
});

// PUT /players/:id - Update Player
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    await db.read();
    const players = db.data.players || [];
    const playerIndex = players.findIndex(p => p.id === id);
    if (playerIndex === -1) return res.status(404).json({ error: "Player not found" });

    const currentPlayer = db.data.players[playerIndex];

    // Unique number validation if team or number is being updated
    if (updates.number !== undefined || updates.teamId !== undefined) {
        const teamId = updates.teamId || currentPlayer.teamId;
        const number = updates.number !== undefined ? parseInt(updates.number) : currentPlayer.number;

        const isNumberTaken = players.some(p => p.id !== id && p.teamId === teamId && p.number === number);
        if (isNumberTaken) return res.status(400).json({ error: `Jersey number ${number} is already taken in this team.` });
    }

    // Height validation (150-220)
    if (updates.height !== undefined && (updates.height < 150 || updates.height > 220)) {
        return res.status(400).json({ error: "Height must be between 150 and 220 cm" });
    }

    // Weight validation (40-120)
    if (updates.weight !== undefined && (updates.weight < 40 || updates.weight > 120)) {
        return res.status(400).json({ error: "Weight must be between 40 and 120 kg" });
    }

    db.data.players[playerIndex] = { ...currentPlayer, ...updates };
    if (updates.number) db.data.players[playerIndex].number = parseInt(updates.number);
    if (updates.height) db.data.players[playerIndex].height = parseInt(updates.height);
    if (updates.weight) db.data.players[playerIndex].weight = parseInt(updates.weight);

    await db.write();

    res.json(db.data.players[playerIndex]);
});

// DELETE /players/:id - Delete Player
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    const players = db.data.players || [];
    const playerIndex = players.findIndex(p => p.id === id);
    if (playerIndex === -1) return res.status(404).json({ error: "Player not found" });

    db.data.players = players;
    db.data.players.splice(playerIndex, 1);
    await db.write();

    res.json({ message: "Player deleted successfully" });
});

export default router;

