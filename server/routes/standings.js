import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// GET /standings
router.get('/', async (req, res) => {
    try {
        const { data: teams, error } = await supabase.from('teams').select('*');
        if (error) throw error;

        // Map team stats to standing format
        const standings = (teams || []).map(t => ({
            teamId: t.id,
            points: (t.wins || 0) * 3 + (t.draws || 0),
            played: (t.wins || 0) + (t.draws || 0) + (t.losses || 0),
            won: t.wins || 0,
            drawn: t.draws || 0,
            lost: t.losses || 0,
            gf: t.goals_for || 0,
            ga: t.goals_against || 0,
            gd: (t.goals_for || 0) - (t.goals_against || 0),
            team: t
        }));

        // Sort by points, then goal difference, then goals for
        standings.sort((a, b) => (b.points - a.points) || (b.gd - a.gd) || (b.gf - a.gf));

        res.json(standings);
    } catch (err) {
        console.error(">>> [API ERROR] /api/standings:", err.message);
        res.json([]);
    }
});

export default router;
