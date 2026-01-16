import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// GET /standings
router.get('/', async (req, res) => {
    try {
        const { data: teams, error } = await supabase.from('teams').select('*');
        if (error) throw error;

        // Map team stats to standing format
        const standings = teams.map(t => ({
            teamId: t.id,
            points: t.wins * 3 + t.draws,
            played: t.wins + t.draws + t.losses,
            won: t.wins,
            drawn: t.draws,
            lost: t.losses,
            gf: t.goals_for,
            ga: t.goals_against,
            gd: t.goals_for - t.goals_against,
            team: t
        }));

        // Sort by points, then goal difference, then goals for
        standings.sort((a, b) => (b.points - a.points) || (b.gd - a.gd) || (b.gf - a.gf));

        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
