import express from 'express';
import { supabase } from '../db.js';
import { emitUpdate } from '../socket.js';

const router = express.Router();

// GET /matches
router.get('/', async (req, res) => {
    try {
        const { data: matches, error } = await supabase.from('matches').select('*');
        if (error) throw error;

        // Fetch events for each match (simplified for now, can be optimized with a join)
        const { data: events } = await supabase.from('match_events').select('*');

        const enrichedMatches = (matches || []).map(m => ({
            ...m,
            teamA: m.team_a, // Compatibility with frontend if it expects teamA
            teamB: m.team_b,
            score: { teamA: m.score_a, teamB: m.score_b },
            events: (events || []).filter(e => e.match_id === m.id)
        }));

        res.json(enrichedMatches);
    } catch (err) {
        console.error(">>> [API ERROR] /api/matches:", err.message);
        res.json([]);
    }
});

// POST /matches - Create Fixture
router.post('/', async (req, res) => {
    const { teamA, teamB, date, time, field, referee, status, score } = req.body;
    if (!teamA || !teamB) return res.status(400).json({ error: "Teams required" });

    try {
        const { data: newMatch, error } = await supabase.from('matches').insert({
            team_a: teamA,
            team_b: teamB,
            date,
            time,
            field: field || 'Main Stadium',
            referee: referee || 'AutoRef',
            status: status || 'scheduled',
            score_a: score?.teamA || 0,
            score_b: score?.teamB || 0
        }).select().single();

        if (error) throw error;

        await recalculateAll();
        res.status(201).json(newMatch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /matches/:id - Update Match
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Map frontend keys to DB
    const mappedUpdates = { ...updates };
    if (updates.teamA) { mappedUpdates.team_a = updates.teamA; delete mappedUpdates.teamA; }
    if (updates.teamB) { mappedUpdates.team_b = updates.teamB; delete mappedUpdates.teamB; }
    if (updates.score) {
        mappedUpdates.score_a = updates.score.teamA;
        mappedUpdates.score_b = updates.score.teamB;
        delete mappedUpdates.score;
    }

    try {
        const { data: match, error } = await supabase.from('matches')
            .update(mappedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!match) return res.status(404).json({ error: "Match not found" });

        if (updates.status === 'finished') {
            const { data: teamA } = await supabase.from('teams').select('name').eq('id', match.team_a).single();
            const { data: teamB } = await supabase.from('teams').select('name').eq('id', match.team_b).single();
            emitUpdate('alert', {
                type: 'MATCH_END',
                message: `FINAL WHISTLE: ${teamA?.name} ${match.score_a} - ${match.score_b} ${teamB?.name}`,
                matchId: id
            });
        }

        await recalculateAll();
        res.json(match);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /matches/:id/events - Add event
router.post('/:id/events', async (req, res) => {
    const { id } = req.params;
    const { type, teamId, playerId, minute } = req.body;

    try {
        const { data: match, error: fetchError } = await supabase.from('matches').select('*').eq('id', id).single();
        if (fetchError || !match) return res.status(404).json({ error: "Match not found" });

        const { data: newEvent, error: eventError } = await supabase.from('match_events').insert({
            match_id: id,
            type,
            team_id: teamId,
            player_id: playerId,
            minute: minute || '90'
        }).select().single();

        if (eventError) throw eventError;

        if (type === 'goal') {
            const updates = {};
            if (match.team_a === teamId) updates.score_a = match.score_a + 1;
            else if (match.team_b === teamId) updates.score_b = match.score_b + 1;

            await supabase.from('matches').update(updates).eq('id', id);
        }

        // NEW: Emit rich alert for the frontend
        try {
            const { data: player } = await supabase.from('players').select('name, nickname').eq('id', playerId).single();
            const { data: team } = await supabase.from('teams').select('name').eq('id', teamId).single();

            let alertMsg = "";
            let alertType = "INFO";

            if (type === 'goal') {
                alertMsg = `GOAL! ${player?.nickname || player?.name} scores for ${team?.name}!`;
                alertType = "GOAL";
            } else if (type === 'yellow_card') {
                alertMsg = `YELLOW CARD: ${player?.name} (${team?.name})`;
                alertType = "CARD";
            } else if (type === 'red_card') {
                alertMsg = `RED CARD! ${player?.name} sent off! (${team?.name})`;
                alertType = "CARD";
            } else if (type === 'assist') {
                alertMsg = `AST: ${player?.name} provided a tactical assist.`;
            }

            emitUpdate('alert', {
                type: alertType,
                message: alertMsg,
                matchId: id,
                minute: minute || '??'
            });
        } catch (alertErr) {
            console.error("Alert generation failed:", alertErr);
        }

        await recalculateAll();
        res.json({ success: true, event: newEvent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /matches/:id - Remove Match
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('matches').delete().eq('id', id);
        if (error) throw error;

        await recalculateAll();
        res.json({ success: true, message: "Match deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function recalculateAll() {
    try {
        const { data: players } = await supabase.from('players').select('*');
        const { data: matches } = await supabase.from('matches').select('*');
        const { data: teams } = await supabase.from('teams').select('*');
        const { data: events } = await supabase.from('match_events').select('*');

        // 1. Reset player stats
        const playerStatsUpdate = players.map(p => ({
            id: p.id,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
            minutes: 0
        }));

        // 2. Prepare standings map
        const standingsMap = {};
        teams.forEach(t => {
            standingsMap[t.id] = { team_id: t.id, points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0 };
        });

        // 3. Process finished AND live matches for standings
        const activeMatches = matches.filter(m => m.status === 'finished' || m.status === 'live');
        activeMatches.forEach(match => {
            const processTeam = (teamId, goalsFor, goalsAgainst) => {
                if (!teamId) return;
                let entry = standingsMap[teamId];
                if (!entry) return;

                entry.played++;
                entry.gf += (goalsFor || 0);
                entry.ga += (goalsAgainst || 0);
                entry.gd = entry.gf - entry.ga;

                if (goalsFor > goalsAgainst) { entry.points += 3; entry.won++; }
                else if (goalsFor === goalsAgainst) { entry.points += 1; entry.drawn++; }
                else { entry.lost++; }
            };

            // FIX: Use snake_case fields from Supabase
            processTeam(match.team_a, match.score_a, match.score_b);
            processTeam(match.team_b, match.score_b, match.score_a);

            // Minutes calculation (if match finished, everyone gets 90)
            if (match.status === 'finished') {
                playerStatsUpdate.forEach(pUpdate => {
                    const player = players.find(p => p.id === pUpdate.id);
                    if (player && (player.team_id === match.team_a || player.team_id === match.team_b)) {
                        pUpdate.minutes += 90;
                    }
                });
            }
        });

        // 4. Process events
        events.forEach(evt => {
            const pUpdate = playerStatsUpdate.find(p => p.id === evt.player_id);
            if (pUpdate) {
                if (evt.type === 'goal') pUpdate.goals++;
                if (evt.type === 'assist') pUpdate.assists++;
                if (evt.type === 'yellow_card') pUpdate.yellow_cards++;
                if (evt.type === 'red_card') pUpdate.red_cards++;
            }
        });

        // 5. Update DB (Supabase bulk upsert)
        if (playerStatsUpdate.length > 0) {
            await supabase.from('players').upsert(playerStatsUpdate);
        }

        // 6. Update Team Stats (optional but good for denormalization)
        const teamUpdates = Object.values(standingsMap).map(s => ({
            id: s.team_id,
            wins: s.won,
            draws: s.drawn,
            losses: s.lost,
            goals_for: s.gf,
            goals_against: s.ga
        }));
        if (teamUpdates.length > 0) {
            await supabase.from('teams').upsert(teamUpdates);
        }

        // 7. Emit updates
        const { data: finalMatches } = await supabase.from('matches').select('*');
        const { data: finalPlayers } = await supabase.from('players').select('*');

        // Enrich standings data for frontend (camelCase)
        const standingsData = Object.values(standingsMap).map(s => ({
            teamId: s.team_id,
            points: s.points,
            played: s.played,
            won: s.won,
            drawn: s.drawn,
            lost: s.lost,
            gf: s.gf,
            ga: s.ga,
            gd: s.gd
        }));

        emitUpdate('matches', finalMatches.map(m => ({
            ...m,
            teamA: m.team_a,
            teamB: m.team_b,
            score: { teamA: m.score_a, teamB: m.score_b }
        })));
        emitUpdate('standings', standingsData);
        emitUpdate('players', finalPlayers.map(p => ({
            ...p,
            teamId: p.team_id,
            stats: {
                goals: p.goals || 0,
                assists: p.assists || 0,
                yellowCards: p.yellow_cards || 0,
                redCards: p.red_cards || 0
            }
        })));

    } catch (err) {
        console.error("Error in recalculateAll:", err);
    }
}

export default router;
