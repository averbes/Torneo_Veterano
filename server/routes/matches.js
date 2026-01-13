import express from 'express';
import { Match, Team, Player, Standing } from '../db.js';

const router = express.Router();

// GET /matches
router.get('/', async (req, res) => {
    try {
        const matches = await Match.find();
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /matches - Create Fixture
router.post('/', async (req, res) => {
    const { teamA, teamB, date, time, field, referee, status, score } = req.body;
    if (!teamA || !teamB) return res.status(400).json({ error: "Teams required" });

    try {
        const newMatch = new Match({
            id: 'm_' + Date.now(),
            teamA,
            teamB,
            date,
            time,
            field: field || 'Main Stadium',
            referee: referee || 'AutoRef',
            status: status || 'scheduled',
            score: score || { teamA: 0, teamB: 0 },
            events: []
        });

        await newMatch.save();
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

    try {
        const match = await Match.findOneAndUpdate(
            { id },
            { $set: updates },
            { new: true }
        );

        if (!match) return res.status(404).json({ error: "Match not found" });

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
        const match = await Match.findOne({ id });
        if (!match) return res.status(404).json({ error: "Match not found" });

        const newEvent = {
            id: 'evt_' + Date.now(),
            type,
            teamId,
            playerId,
            minute: minute || '90'
        };
        match.events.push(newEvent);

        if (type === 'goal') {
            if (match.teamA === teamId) match.score.teamA++;
            else if (match.teamB === teamId) match.score.teamB++;
        }

        await match.save();
        await recalculateAll();
        res.json({ success: true, match });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /matches/:id - Remove Match
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedMatch = await Match.findOneAndDelete({ id });
        if (!deletedMatch) return res.status(404).json({ error: "Match not found" });

        await recalculateAll();
        res.json({ success: true, message: "Match deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function recalculateAll() {
    try {
        const players = await Player.find();
        const matches = await Match.find();
        const teams = await Team.find();

        // 1. Reset all player stats
        for (let player of players) {
            player.stats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 };
        }

        // 2. Prepare standings map
        const standingsMap = {};
        teams.forEach(t => {
            standingsMap[t.id] = { teamId: t.id, points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0 };
        });

        // 3. Process finished matches
        const finishedMatches = matches.filter(m => m.status === 'finished');
        finishedMatches.forEach(match => {
            const processTeam = (teamId, goalsFor, goalsAgainst) => {
                let entry = standingsMap[teamId];
                if (!entry) return;

                entry.played++;
                entry.gf += goalsFor;
                entry.ga += goalsAgainst;
                entry.gd = entry.gf - entry.ga;
                if (goalsFor > goalsAgainst) { entry.points += 3; entry.won++; }
                else if (goalsFor === goalsAgainst) { entry.points += 1; entry.drawn++; }
                else { entry.lost++; }
            };
            processTeam(match.teamA, match.score.teamA, match.score.teamB);
            processTeam(match.teamB, match.score.teamB, match.score.teamA);

            // Update minutes for all players in the match
            const rosterIds = [];
            if (match.rosters && (match.rosters.teamA?.length > 0 || match.rosters.teamB?.length > 0)) {
                if (match.rosters.teamA) rosterIds.push(...match.rosters.teamA);
                if (match.rosters.teamB) rosterIds.push(...match.rosters.teamB);
            } else {
                // Fallback to team affiliation
                players.forEach(p => {
                    if (p.teamId === match.teamA || p.teamId === match.teamB) rosterIds.push(p.id);
                });
            }

            players.forEach(p => {
                if (rosterIds.includes(p.id)) {
                    p.stats.minutes += 90;
                }
            });
        });

        // 4. Process events from all matches (finished + live) for player stats
        matches.filter(m => m.status === 'finished' || m.status === 'live').forEach(match => {
            if (match.events) {
                match.events.forEach(evt => {
                    const player = players.find(p => p.id === evt.playerId);
                    if (player) {
                        if (evt.type === 'goal') player.stats.goals++;
                        if (evt.type === 'assist') player.stats.assists++;
                        if (evt.type === 'yellow_card') player.stats.yellowCards++;
                        if (evt.type === 'red_card') player.stats.redCards++;
                    }
                });
            }
        });

        // 5. Bulk save player stats
        await Promise.all(players.map(p => p.save()));

        // 6. Update Standings collection
        await Standing.deleteMany({});
        await Standing.insertMany(Object.values(standingsMap));

    } catch (err) {
        console.error("Error in recalculateAll:", err);
    }
}

export default router;
