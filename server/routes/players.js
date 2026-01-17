import express from 'express';
import { supabase } from '../db.js';
import { emitUpdate } from '../socket.js';

const router = express.Router();

// GET /players - List players with filtering
router.get('/', async (req, res) => {
    try {
        const { teamId, search } = req.query;
        let query = supabase.from('players').select('*, teams(name)');

        if (teamId) {
            query = query.eq('team_id', teamId);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,nickname.ilike.%${search}%`);
        }

        const { data: players, error } = await query;
        if (error) throw error;

        const playersWithTeamInfo = (players || []).map(p => ({
            ...p,
            teamName: p.teams?.name || 'Unknown',
            // Map snake_case from DB back to camelCase for frontend consistency
            attrPace: p.attr_pace,
            attrShooting: p.attr_shooting,
            attrPassing: p.attr_passing,
            attrDribbling: p.attr_dribbling,
            attrDefending: p.attr_defending,
            attrPhysical: p.attr_physical,
            // Stats mapping
            stats: {
                goals: p.goals || 0,
                assists: p.assists || 0,
                yellowCards: p.yellow_cards || 0,
                redCards: p.red_cards || 0,
                minutes: p.minutes || 0
            }
        }));

        res.json(playersWithTeamInfo);
    } catch (err) {
        console.error(">>> [API ERROR] /api/players:", err.message);
        res.json([]);
    }
});

// GET /players/:id - Get single player
router.get('/:id', async (req, res) => {
    try {
        const { data: player, error } = await supabase.from('players').select('*, teams(name)').eq('id', req.params.id).single();
        if (error || !player) return res.status(404).json({ error: "Player not found" });
        res.json({
            ...player,
            teamName: player.teams?.name || 'Unknown'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /players - Create Player
router.post('/', async (req, res) => {
    const {
        name, nickname, photo, birthDate, position, teamId,
        number, nationality, height, weight, preferredFoot,
        joinDate, status,
        attrPace, attrShooting, attrPassing, attrDribbling, attrDefending, attrPhysical
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!teamId) return res.status(400).json({ error: "Team is required" });

    try {
        // Check if jersey number is unique in the team
        const { data: existingPlayer } = await supabase.from('players')
            .select('id')
            .eq('team_id', teamId)
            .eq('number', parseInt(number))
            .limit(1);

        if (existingPlayer && existingPlayer.length > 0) {
            return res.status(400).json({ error: `Jersey number ${number} is already taken in this team.` });
        }

        const { data: newPlayer, error } = await supabase.from('players').insert({
            name,
            nickname: nickname || '',
            photo: photo || '',
            birth_date: birthDate || null,
            position: position || 'Midfielder',
            team_id: teamId,
            number: parseInt(number),
            nationality: nationality || '',
            height: parseFloat(height),
            weight: parseFloat(weight),
            preferred_foot: preferredFoot || 'Right',
            join_date: joinDate || new Date().toISOString().split('T')[0],
            status: status || 'Active',
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
            minutes: 0,
            attr_pace: parseInt(attrPace) || 50,
            attr_shooting: parseInt(attrShooting) || 50,
            attr_passing: parseInt(attrPassing) || 50,
            attr_dribbling: parseInt(attrDribbling) || 50,
            attr_defending: parseInt(attrDefending) || 50,
            attr_physical: parseInt(attrPhysical) || 50
        }).select().single();

        if (error) throw error;

        const { data: allPlayers } = await supabase.from('players').select('*');
        emitUpdate('players', allPlayers);
        res.status(201).json(newPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /players/:id - Update Player
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Map frontend keys to DB snake_case if necessary
    const mappedUpdates = { ...updates };
    if (updates.birthDate) { mappedUpdates.birth_date = updates.birthDate; delete mappedUpdates.birthDate; }
    if (updates.teamId) { mappedUpdates.team_id = updates.teamId; delete mappedUpdates.teamId; }
    if (updates.preferredFoot) { mappedUpdates.preferred_foot = updates.preferredFoot; delete mappedUpdates.preferredFoot; }
    if (updates.joinDate) { mappedUpdates.join_date = updates.joinDate; delete mappedUpdates.joinDate; }
    if (updates.yellowCards) { mappedUpdates.yellow_cards = updates.yellowCards; delete mappedUpdates.yellowCards; }
    if (updates.redCards) { mappedUpdates.red_cards = updates.redCards; delete mappedUpdates.redCards; }
    if (updates.attrPace) { mappedUpdates.attr_pace = updates.attrPace; delete mappedUpdates.attrPace; }
    if (updates.attrShooting) { mappedUpdates.attr_shooting = updates.attrShooting; delete mappedUpdates.attrShooting; }
    if (updates.attrPassing) { mappedUpdates.attr_passing = updates.attrPassing; delete mappedUpdates.attrPassing; }
    if (updates.attrDribbling) { mappedUpdates.attr_dribbling = updates.attrDribbling; delete mappedUpdates.attrDribbling; }
    if (updates.attrDefending) { mappedUpdates.attr_defending = updates.attrDefending; delete mappedUpdates.attrDefending; }
    if (updates.attrPhysical) { mappedUpdates.attr_physical = updates.attrPhysical; delete mappedUpdates.attrPhysical; }

    try {
        const { data: player, error: fetchError } = await supabase.from('players').select('*').eq('id', id).single();
        if (fetchError || !player) return res.status(404).json({ error: "Player not found" });

        // Unique number validation
        if (updates.number !== undefined || updates.teamId !== undefined) {
            const teamId = updates.teamId || player.team_id;
            const number = updates.number !== undefined ? parseInt(updates.number) : player.number;

            const { data: isNumberTaken } = await supabase.from('players')
                .select('id')
                .eq('team_id', teamId)
                .eq('number', number)
                .neq('id', id);

            if (isNumberTaken && isNumberTaken.length > 0) {
                return res.status(400).json({ error: `Jersey number ${number} is already taken in this team.` });
            }
        }

        const { data: updatedPlayer, error: updateError } = await supabase.from('players')
            .update(mappedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        const { data: allPlayers } = await supabase.from('players').select('*');
        emitUpdate('players', allPlayers);
        res.json(updatedPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /players/:id/history - Get player's match performance
router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch events for this player including match data
        const { data: events, error } = await supabase
            .from('match_events')
            .select(`
                *,
                matches (
                    id,
                    date,
                    time,
                    team_a,
                    team_b,
                    score_a,
                    score_b,
                    teams_a:team_a(name),
                    teams_b:team_b(name)
                )
            `)
            .eq('player_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by match
        const historyMap = (events || []).reduce((acc, event) => {
            const m = event.matches;
            if (!m) return acc;

            if (!acc[m.id]) {
                const isTeamA = m.team_a === event.team_id;
                acc[m.id] = {
                    matchId: m.id,
                    date: m.date,
                    result: `${m.score_a} - ${m.score_b}`,
                    opponent: isTeamA ? m.teams_b?.name : m.teams_a?.name,
                    goals: 0,
                    assists: 0,
                    yellowCards: 0,
                    redCards: 0
                };
            }

            if (event.type === 'goal') acc[m.id].goals++;
            if (event.type === 'assist') acc[m.id].assists++;
            if (event.type === 'yellow_card') acc[m.id].yellowCards++;
            if (event.type === 'red_card') acc[m.id].redCards++;

            return acc;
        }, {});

        res.json(Object.values(historyMap));
    } catch (err) {
        console.error("History Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /players/:id - Delete Player
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('players').delete().eq('id', req.params.id);
        if (error) throw error;

        const { data: allPlayers } = await supabase.from('players').select('*');
        emitUpdate('players', allPlayers);
        res.json({ message: "Player deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

