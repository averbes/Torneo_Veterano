import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    await db.read();
    // Sort by points desc, then GD desc
    const sorted = (db.data.standings || []).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.gd - a.gd;
    });

    res.json(sorted);
});

export default router;
