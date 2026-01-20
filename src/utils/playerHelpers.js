/**
 * Player Data Normalization Utilities
 * Ensures consistent data structure across frontend components
 */

/**
 * Normalizes player data from backend to consistent frontend format
 * Handles both snake_case (DB) and camelCase (API) formats
 */
export const normalizePlayer = (player) => {
    if (!player) return null;

    return {
        ...player,
        // Ensure camelCase for team reference
        teamId: player.team_id || player.teamId,
        teamName: player.teamName || player.teams?.name || 'Unknown',

        // Normalize attributes
        attrPace: player.attr_pace || player.attrPace || 50,
        attrShooting: player.attr_shooting || player.attrShooting || 50,
        attrPassing: player.attr_passing || player.attrPassing || 50,
        attrDribbling: player.attr_dribbling || player.attrDribbling || 50,
        attrDefending: player.attr_defending || player.attrDefending || 50,
        attrPhysical: player.attr_physical || player.attrPhysical || 50,

        // Normalize stats object
        stats: {
            goals: player.stats?.goals ?? player.goals ?? 0,
            assists: player.stats?.assists ?? player.assists ?? 0,
            yellowCards: player.stats?.yellowCards ?? player.yellow_cards ?? 0,
            redCards: player.stats?.redCards ?? player.red_cards ?? 0,
            minutes: player.stats?.minutes ?? player.minutes ?? 0
        }
    };
};

/**
 * Normalizes an array of players
 */
export const normalizePlayers = (players) => {
    if (!Array.isArray(players)) return [];
    return players.map(normalizePlayer).filter(Boolean);
};

/**
 * Calculates player overall rating based on position and attributes
 */
export const calculateOverall = (player) => {
    const pos = (player.position || '').toUpperCase();
    const attrs = {
        pace: player.attrPace || 50,
        shooting: player.attrShooting || 50,
        passing: player.attrPassing || 50,
        dribbling: player.attrDribbling || 50,
        defending: player.attrDefending || 50,
        physical: player.attrPhysical || 50
    };

    // Weight by position
    let weights = {};

    if (pos.includes('ARQUERO') || pos.includes('GK')) {
        weights = { pace: 0.05, shooting: 0.05, passing: 0.10, dribbling: 0.05, defending: 0.35, physical: 0.40 };
    } else if (pos.includes('DEFENSA') || pos.includes('DF')) {
        weights = { pace: 0.15, shooting: 0.05, passing: 0.10, dribbling: 0.10, defending: 0.40, physical: 0.20 };
    } else if (pos.includes('MEDIO') || pos.includes('MF')) {
        weights = { pace: 0.15, shooting: 0.15, passing: 0.25, dribbling: 0.20, defending: 0.15, physical: 0.10 };
    } else if (pos.includes('DELANTERO') || pos.includes('FW')) {
        weights = { pace: 0.25, shooting: 0.30, passing: 0.10, dribbling: 0.20, defending: 0.05, physical: 0.10 };
    } else {
        // Default balanced
        weights = { pace: 0.17, shooting: 0.17, passing: 0.17, dribbling: 0.17, defending: 0.16, physical: 0.16 };
    }

    const overall = Math.round(
        attrs.pace * weights.pace +
        attrs.shooting * weights.shooting +
        attrs.passing * weights.passing +
        attrs.dribbling * weights.dribbling +
        attrs.defending * weights.defending +
        attrs.physical * weights.physical
    );

    return Math.min(99, Math.max(1, overall));
};

/**
 * Gets player role for tactical positioning
 */
export const getPlayerRole = (player) => {
    const pos = (player.position || '').toUpperCase();

    if (pos.includes('ARQUERO') || pos.includes('GK')) return 'GK';
    if (pos.includes('DEFENSA') || pos.includes('DF')) return 'DF';
    if (pos.includes('MEDIO') || pos.includes('MF')) return 'MF';
    if (pos.includes('DELANTERO') || pos.includes('FW')) return 'FW';

    return 'MF'; // Default
};

/**
 * Sorts players by registration order (by ID)
 */
export const sortByRegistration = (players) => {
    return [...players].sort((a, b) => a.id - b.id);
};

/**
 * Gets starters (first 11 by registration)
 */
export const getStarters = (players) => {
    return sortByRegistration(players).slice(0, 11);
};

/**
 * Gets substitutes (after first 11)
 */
export const getSubstitutes = (players) => {
    return sortByRegistration(players).slice(11);
};
