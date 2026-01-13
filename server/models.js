import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    franchiseId: { type: String, default: 'FREE_AGENT' },
    logo: { type: String, default: '🛡️' },
    status: { type: String, default: 'active' },
    stats: {
        wins: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        goalsFor: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 }
    }
});

const PlayerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nickname: { type: String, default: '' },
    photo: { type: String, default: '' },
    birthDate: { type: String, default: '' },
    position: { type: String, default: 'Midfielder' },
    teamId: { type: String, required: true },
    number: { type: Number },
    nationality: { type: String, default: '' },
    height: { type: Number },
    weight: { type: Number },
    preferredFoot: { type: String, default: 'Right' },
    joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, default: 'Active' },
    stats: {
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        minutes: { type: Number, default: 0 }
    }
});

const MatchSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },
    date: { type: String },
    time: { type: String },
    field: { type: String, default: 'Main Stadium' },
    referee: { type: String, default: 'AutoRef' },
    status: { type: String, default: 'scheduled' },
    score: {
        teamA: { type: Number, default: 0 },
        teamB: { type: Number, default: 0 }
    },
    rosters: {
        teamA: [{ type: String }],
        teamB: [{ type: String }]
    },
    events: [{
        id: { type: String },
        type: { type: String },
        teamId: { type: String },
        playerId: { type: String },
        minute: { type: String, default: '90' }
    }]
});

const StandingSchema = new mongoose.Schema({
    teamId: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    drawn: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    gf: { type: Number, default: 0 },
    ga: { type: Number, default: 0 },
    gd: { type: Number, default: 0 }
});

const AdminSchema = new mongoose.Schema({
    key: { type: String, default: 'admin_user' },
    password: { type: String, default: 'Vet2026#' }
});

export const Team = mongoose.model('Team', TeamSchema);
export const Player = mongoose.model('Player', PlayerSchema);
export const Match = mongoose.model('Match', MatchSchema);
export const Standing = mongoose.model('Standing', StandingSchema);
export const Admin = mongoose.model('Admin', AdminSchema);
