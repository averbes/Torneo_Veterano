import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';
import { supabase } from '../db.js';
import { emitUpdate } from '../socket.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET /teams
router.get('/', async (req, res) => {
    try {
        const { data: teams, error } = await supabase.from('teams').select('*');
        if (error) throw error;
        res.json(teams || []);
    } catch (err) {
        console.error(">>> [API ERROR] /api/teams:", err.message);
        res.json([]);
    }
});

// POST /teams - Create Team
router.post('/', async (req, res) => {
    const { name, franchiseId, logo } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        const { data: newTeam, error } = await supabase.from('teams').insert({
            name,
            franchise_id: franchiseId || 'FREE_AGENT',
            logo: logo || '🛡️',
            status: 'active'
        }).select().single();

        if (error) throw error;

        const { data: allTeams } = await supabase.from('teams').select('*');
        emitUpdate('teams', allTeams);
        res.status(201).json(newTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /teams/upload - Bulk CSV (Needs careful migration for UUIDs)
router.post('/upload', upload.single('roster'), async (req, res) => {
    const { teamId } = req.body;
    if (!teamId || !req.file) return res.status(400).json({ error: "Missing teamId or file" });

    try {
        const { data: team, error: teamError } = await supabase.from('teams').select('id').eq('id', teamId).single();
        if (teamError || !team) return res.status(404).json({ error: "Team not found" });

        const playersData = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => playersData.push(data))
            .on('end', async () => {
                const newPlayers = playersData.map((p, idx) => ({
                    team_id: teamId,
                    name: p.name || `Bot Player ${idx}`,
                    nickname: p.nickname || 'CPU',
                    number: parseInt(p.number) || (idx + 1),
                    position: p.position || 'Midfielder',
                    status: 'Active',
                    goals: 0,
                    assists: 0,
                    yellow_cards: 0,
                    red_cards: 0,
                    minutes: 0
                }));

                while (newPlayers.length < 16) {
                    const idx = newPlayers.length;
                    newPlayers.push({
                        team_id: teamId,
                        name: `Auto Bot ${idx}`,
                        nickname: 'ROBO',
                        number: 90 + idx,
                        position: 'Midfielder',
                        status: 'Active',
                        goals: 0,
                        assists: 0,
                        yellow_cards: 0,
                        red_cards: 0,
                        minutes: 0
                    });
                }

                // Delete old players for this team and insert new ones
                await supabase.from('players').delete().eq('team_id', teamId);
                const { data: insertedPlayers, error: insertError } = await supabase.from('players').insert(newPlayers).select();

                // Clean up file
                fs.unlinkSync(req.file.path);

                if (insertError) {
                    return res.status(500).json({ error: insertError.message });
                }

                const { data: allPlayers } = await supabase.from('players').select('*');
                emitUpdate('players', allPlayers);

                res.json({ success: true, count: insertedPlayers.length, players: insertedPlayers });
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
        const { data: updatedTeam, error } = await supabase.from('teams')
            .update({
                name,
                franchise_id: franchiseId,
                logo,
                status
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!updatedTeam) return res.status(404).json({ error: "Team not found" });

        const { data: allTeams } = await supabase.from('teams').select('*');
        emitUpdate('teams', allTeams);
        res.json(updatedTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Team
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase.from('teams').delete().eq('id', id);
        if (error) throw error;

        // Players will be handled by CASCADE in SQL if configured, 
        // but here we did SET NULL or manual delete. 
        // In our setup.md it's REFERENCES teams(id) ON DELETE SET NULL.
        // Let's manually delete them to match old behavior.
        await supabase.from('players').delete().eq('team_id', id);

        const { data: allTeams } = await supabase.from('teams').select('*');
        const { data: allPlayers } = await supabase.from('players').select('*');
        emitUpdate('teams', allTeams);
        emitUpdate('players', allPlayers);

        res.json({ message: "Team and its players removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
