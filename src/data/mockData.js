export const MOCK_DATA = {
    teams: [
        {
            id: 'strikers',
            name: 'Neon Strikers',
            nickname: 'The Cyber Prowlers',
            logo: '⚡',
            color: '#00f2ff',
            stats: { wins: 12, draws: 2, losses: 1 },
            players: [
                // Starters (11) - 4-4-2
                { id: 's1', name: 'Zoltan V', nickname: 'The Wall', position: 'GK', number: 1, isStarter: true, stats: { saves: 45 } },
                { id: 's2', name: 'Kaelen R', nickname: 'Iron Guard', position: 'DF', number: 4, isStarter: true, stats: { tackles: 32 } },
                { id: 's3', name: 'Jax S', nickname: 'Shield', position: 'DF', number: 5, isStarter: true, stats: { blocks: 28 } },
                { id: 's4', name: 'Nova B', nickname: 'Velocity', position: 'DF', number: 2, isStarter: true, stats: { clears: 15 } },
                { id: 's5', name: 'Ryon V', nickname: 'Anchor', position: 'DF', number: 3, isStarter: true, stats: { steals: 12 } },
                { id: 's6', name: 'Cypher X', nickname: 'Neural', position: 'MF', number: 8, isStarter: true, stats: { assists: 14 } },
                { id: 's7', name: 'Link M', nickname: 'Conductor', position: 'MF', number: 6, isStarter: true, stats: { passes: 450 } },
                { id: 's8', name: 'Echo T', nickname: 'Pulse', position: 'MF', number: 10, isStarter: true, stats: { dribbles: 85 } },
                { id: 's9', name: 'Vex K', nickname: 'Ghost', position: 'MF', number: 7, isStarter: true, stats: { recovery: 22 } },
                { id: 's10', name: 'Titan J', nickname: 'Behemoth', position: 'FW', number: 9, isStarter: true, stats: { goals: 18 } },
                { id: 's11', name: 'Neon G', nickname: 'Spark', position: 'FW', number: 11, isStarter: true, stats: { shots: 44 } },
                // Substitutes (5)
                { id: 'sub1', name: 'Dante F', nickname: 'Wildcard', position: 'FW', number: 18, isStarter: false, stats: { goals: 2 } },
                { id: 'sub2', name: 'Zara Q', nickname: 'Blade', position: 'MF', number: 14, isStarter: false, stats: { assists: 3 } },
                { id: 'sub3', name: 'Mako L', nickname: 'Tide', position: 'DF', number: 15, isStarter: false, stats: { blocks: 5 } },
                { id: 'sub4', name: 'Orion P', nickname: 'Star', position: 'MF', number: 16, isStarter: false, stats: { passes: 40 } },
                { id: 'sub5', name: 'Sora Y', nickname: 'Sky', position: 'GK', number: 12, isStarter: false, stats: { saves: 5 } },
            ]
        },
        {
            id: 'phantoms',
            name: 'Cyber Phantoms',
            nickname: 'Wraiths of the Grid',
            logo: '👻',
            color: '#7000ff',
            stats: { wins: 10, draws: 4, losses: 1 },
            players: [
                // Starters (11) - 4-4-2
                { id: 'p1', name: 'Shadow S', nickname: 'Void', position: 'GK', number: 99, isStarter: true, stats: { saves: 38 } },
                { id: 'p2', name: 'Drake M', nickname: 'Stone', position: 'DF', number: 22, isStarter: true, stats: { tackles: 28 } },
                { id: 'p3', name: 'Leo N', nickname: 'Bastion', position: 'DF', number: 33, isStarter: true, stats: { blocks: 30 } },
                { id: 'p4', name: 'Gale H', nickname: 'Drift', position: 'DF', number: 44, isStarter: true, stats: { clears: 12 } },
                { id: 'p5', name: 'Sven B', nickname: 'Wall', position: 'DF', number: 55, isStarter: true, stats: { steals: 14 } },
                { id: 'p6', name: 'Aria L', nickname: 'Lyric', position: 'MF', number: 66, isStarter: true, stats: { assists: 9 } },
                { id: 'p7', name: 'Finn D', nickname: 'Spark', position: 'MF', number: 77, isStarter: true, stats: { passes: 380 } },
                { id: 'p8', name: 'Kole R', nickname: 'Fuse', position: 'MF', number: 88, isStarter: true, stats: { dribbles: 60 } },
                { id: 'p9', name: 'Jade T', nickname: 'Gem', position: 'MF', number: 11, isStarter: true, stats: { recovery: 18 } },
                { id: 'p10', name: 'Rex W', nickname: 'King', position: 'FW', number: 10, isStarter: true, stats: { goals: 15 } },
                { id: 'p11', name: 'Luna V', nickname: 'Moon', position: 'FW', number: 13, isStarter: true, stats: { shots: 40 } },
                // Substitutes (5)
                { id: 'psub1', name: 'Ash C', nickname: 'Smoke', position: 'FW', number: 21, isStarter: false, stats: { goals: 1 } },
                { id: 'psub2', name: 'Nix J', nickname: 'Zero', position: 'MF', number: 24, isStarter: false, stats: { assists: 2 } },
                { id: 'psub3', name: 'Ron K', nickname: 'Bull', position: 'DF', number: 25, isStarter: false, stats: { blocks: 3 } },
                { id: 'psub4', name: 'Zoe E', nickname: 'Zen', position: 'MF', number: 26, isStarter: false, stats: { passes: 20 } },
                { id: 'psub5', name: 'Kai P', nickname: 'Dolphin', position: 'GK', number: 22, isStarter: false, stats: { saves: 2 } },
            ]
        }
    ]
};
