import express from 'express';
import { Standing, Team } from '../db.js';

const router = express.Router();

// GET /standings
router.get('/', async (req, res) => {
    try {
        const standings = await Standing.find();
        const teams = await Team.find();

        const standingsWithTeamInfo = standings.map(s => {
            const sObj = s.toObject();
            return {
                ...sObj,
                team: teams.find(t => t.id === s.teamId) || { name: 'Unknown', logo: '🛡️' }
            };
        });

        res.json(standingsWithTeamInfo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
