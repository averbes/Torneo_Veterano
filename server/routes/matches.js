import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /matches
router.get('/', async (req, res) => {
    await db.read();
    res.json(db.data.matches || []);
});

// POST /matches - Create Fixture
router.post('/', async (req, res) => {
    const { teamA, teamB, date, time, field, referee, status, score } = req.body;
    if (!teamA || !teamB) return res.status(400).json({ error: "Teams required" });

    await db.read();
    const newMatch = {
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
    };

    if (!db.data.matches) db.data.matches = [];
    db.data.matches.push(newMatch);

    // Recalculate everything
    recalculateAll(db.data);

    await db.write();
    res.status(201).json(newMatch);
});

// PUT /matches/:id - Update Match
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    console.log(`Incoming update for match ${id}:`, updates);

    try {
        await db.read();
        if (!db.data.matches) db.data.matches = [];

        const matchIndex = db.data.matches.findIndex(m => m.id === id);

        if (matchIndex === -1) {
            console.error(`Match ${id} not found in DB`);
            return res.status(404).json({ error: `Battle Log ID ${id} not found.` });
        }

        // Apply updates
        db.data.matches[matchIndex] = { ...db.data.matches[matchIndex], ...updates };

        // Recalculate everything after any update to be sure stats are consistent
        recalculateAll(db.data);

        await db.write();
        console.log(`Match ${id} updated successfully.`);
        res.json(db.data.matches[matchIndex]);
    } catch (err) {
        console.error("Error updating match:", err);
        res.status(500).json({ error: "System failure during log re-calculation." });
    }
});

// POST /matches/:id/events - Add event manually or via live log
router.post('/:id/events', async (req, res) => {
    const { id } = req.params;
    const { type, teamId, playerId, minute } = req.body;

    try {
        await db.read();
        const matches = db.data.matches || [];
        const match = matches.find(m => m.id === id);
        if (!match) return res.status(404).json({ error: "Match not found" });

        const newEvent = {
            id: 'evt_' + Date.now(),
            type,
            teamId,
            playerId,
            minute: minute || '90'
        };
        match.events.push(newEvent);

        // Update Score dynamically if goal
        if (type === 'goal') {
            if (match.teamA === teamId) match.score.teamA++;
            else if (match.teamB === teamId) match.score.teamB++;
        }

        recalculateAll(db.data);
        await db.write();
        res.json({ success: true, match });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /matches/:id - Remove Match
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();

    if (!db.data.matches) db.data.matches = [];
    const index = db.data.matches.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: "Match not found" });

    db.data.matches.splice(index, 1);

    // Recalculate everything to ensure standings and stats are correct after deletion
    recalculateAll(db.data);

    await db.write();
    res.json({ success: true, message: "Match deleted" });
});

function recalculateAll(data) {
    if (!data) return;

    // Reset Standings
    data.standings = [];

    // Reset Player Stats
    if (data.players) {
        data.players.forEach(p => {
            if (p.stats) {
                p.stats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 };
            } else {
                p.stats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 };
            }
        });
    }

    // Reprocess every finished match for standings and stats
    const finishedMatches = (data.matches || []).filter(m => m.status === 'finished');

    finishedMatches.forEach(match => {
        const processTeam = (teamId, goalsFor, goalsAgainst) => {
            let entry = data.standings.find(s => s.teamId === teamId);
            if (!entry) {
                entry = { teamId, points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0 };
                data.standings.push(entry);
            }
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

        // Update Minutes
        if (data.players) {
            data.players.filter(p => p.teamId === match.teamA || p.teamId === match.teamB).forEach(p => {
                if (!p.stats) p.stats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 };
                p.stats.minutes += 90;
            });
        }

        // Process Events for stats
        if (match.events) {
            match.events.forEach(evt => {
                const player = (data.players || []).find(p => p.id === evt.playerId);
                if (player) {
                    if (!player.stats) player.stats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 };
                    if (evt.type === 'goal') player.stats.goals++;
                    if (evt.type === 'assist') player.stats.assists++;
                    if (evt.type === 'yellow_card') player.stats.yellowCards++;
                    if (evt.type === 'red_card') player.stats.redCards++;
                }
            });
        }
    });

    // Also consider 'live' matches for real-time play events
    const liveMatches = (data.matches || []).filter(m => m.status === 'live');
    liveMatches.forEach(match => {
        if (match.events) {
            match.events.forEach(evt => {
                const player = data.players.find(p => p.id === evt.playerId);
                if (player) {
                    if (evt.type === 'goal') player.stats.goals++;
                    if (evt.type === 'assist') player.stats.assists++;
                    if (evt.type === 'yellow_card') player.stats.yellowCards++;
                    if (evt.type === 'red_card') player.stats.redCards++;
                }
            });
        }
    });
}

function updateStandings(match) {
    // This is now replaced by recalculateAll for robustness
}

export default router;
