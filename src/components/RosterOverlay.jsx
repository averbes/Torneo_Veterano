import React, { useState, useEffect } from 'react';
import PlayerDetailModal from './PlayerDetailModal';

const RosterOverlay = ({ team, onClose }) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlayers = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/players?teamId=${team.id}`);
            const data = await res.json();
            setPlayers(data);
        } catch (_) {
            console.error("Failed to fetch players");
        } finally {
            setLoading(false);
        }
    }, [team.id]);

    useEffect(() => {
        if (team) {
            fetchPlayers();
        }
    }, [team, fetchPlayers]);

    if (!team) return null;

    const getFormation = () => {
        // Ideal distribution for 4-4-2
        const formation = {
            gk: [],
            df: [],
            mf: [],
            fw: []
        };

        // If we don't have players yet
        if (!players.length) return formation;

        // 1. Try to find actual GKs, DFs, etc among the first 11 or explicitly marked starters
        // For simplicity, let's take the first 11 players as the "Starters" if no 'isStarter' flag is reliable
        // Or if 'isStarter' exists, use it.
        let pool = players.filter(p => p.isStarter);
        if (pool.length < 11) {
            // Fill with subs if not enough starters marked
            const nonStarters = players.filter(p => !p.isStarter);
            pool = [...pool, ...nonStarters].slice(0, 11);
        }

        const remaining = [...pool];

        // Specific Position Filling Helper
        const fillSlot = (targetRole, count, exactPosKey) => {
            for (let i = 0; i < count; i++) {
                const idx = remaining.findIndex(p => p.position === exactPosKey);
                if (idx !== -1) {
                    formation[targetRole].push(remaining[idx]);
                    remaining.splice(idx, 1);
                }
            }
        };

        // Try to fill designated spots first
        fillSlot('gk', 1, 'GK');
        fillSlot('df', 4, 'DF');
        fillSlot('mf', 4, 'MF');
        fillSlot('fw', 2, 'FW');

        // Fill remaining slots with whoever is left (out of position players)
        while (formation.gk.length < 1 && remaining.length > 0) formation.gk.push(remaining.shift());
        while (formation.df.length < 4 && remaining.length > 0) formation.df.push(remaining.shift());
        while (formation.mf.length < 4 && remaining.length > 0) formation.mf.push(remaining.shift());
        while (formation.fw.length < 2 && remaining.length > 0) formation.fw.push(remaining.shift());

        return formation;
    };

    const formation = getFormation();

    if (!team) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl"
                onClick={onClose}
            />

            <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[#0a0a1a] border border-[#ffffff10] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-[#ffffff10] flex justify-between items-center bg-[#ffffff02]">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 flex items-center justify-center bg-[#ffffff05] rounded-2xl border border-[#ffffff10]">
                            {team.logo && team.logo.startsWith('data:') ? (
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <span className="text-3xl">{team.logo || '🛡️'}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {team.name}
                            </h2>
                            <div className="text-[10px] font-mono text-[#ffffff40] uppercase tracking-[0.3em]">
                                Tactical Overview & Roster
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#ffffff05] text-[#ffffff40] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
                    {/* Left Column: Tactical Field */}
                    <div className="w-full md:w-1/2 lg:w-3/5 relative bg-[#0a1512] p-8 flex items-center justify-center border-r border-[#ffffff10]">
                        {/* Field Graphic */}
                        <div className="relative w-full h-full border-2 border-[#ffffff10] rounded-xl bg-[#0f2922] shadow-2xl overflow-hidden">
                            {/* Grass Pattern */}
                            <div className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #ffffff 40px, #ffffff 41px)'
                                }}
                            />

                            {/* Center Circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#ffffff20] rounded-full" />
                            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#ffffff20]" />

                            {/* Penalty Areas */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[15%] border-b-2 border-x-2 border-[#ffffff20]" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-[15%] border-t-2 border-x-2 border-[#ffffff20]" />

                            {/* Corner Arcs */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-b-2 border-r-2 border-[#ffffff20] rounded-br-full" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-b-2 border-l-2 border-[#ffffff20] rounded-bl-full" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-t-2 border-r-2 border-[#ffffff20] rounded-tr-full" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-t-2 border-l-2 border-[#ffffff20] rounded-tl-full" />

                            {/* PLAYERS ON FIELD (4-4-2) */}
                            {/* Goalkeeper (Bottom) */}
                            <div className="absolute bottom-[5%] left-0 right-0 flex justify-center">
                                {formation.gk.map(p => <PlayerNode key={p.id} player={p} color={team.color || '#ffff00'} isGK />)}
                            </div>

                            {/* Defenders */}
                            <div className="absolute bottom-[25%] left-0 right-0 flex justify-around px-12">
                                {formation.df.map(p => <PlayerNode key={p.id} player={p} color={team.color || '#00f2ff'} />)}
                            </div>

                            {/* Midfielders */}
                            <div className="absolute top-[45%] left-0 right-0 flex justify-around px-8">
                                {formation.mf.map(p => <PlayerNode key={p.id} player={p} color={team.color || '#00f2ff'} />)}
                            </div>

                            {/* Forwards */}
                            <div className="absolute top-[15%] left-0 right-0 flex justify-around px-32">
                                {formation.fw.map(p => <PlayerNode key={p.id} player={p} color={team.color || '#00f2ff'} />)}
                            </div>

                            {loading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                                    <div className="text-[#00f2ff] animate-pulse font-mono tracking-widest text-xs">SUMMONING SQUAD...</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Roster List */}
                    <div className="w-full md:w-1/2 lg:w-2/5 overflow-auto bg-[#0a0a1a]">
                        <div className="p-6">
                            <h3 className="text-sm font-mono text-[#ffffff40] uppercase tracking-widest mb-6 border-b border-[#ffffff10] pb-2">Full Roster</h3>

                            <div className="space-y-2">
                                {players.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPlayer(p)}
                                        className="flex items-center gap-4 p-3 rounded-xl bg-[#ffffff03] hover:bg-[#ffffff08] border border-transparent hover:border-[#00f2ff]/30 cursor-pointer transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#ffffff05] flex items-center justify-center font-black text-[#00f2ff] border border-[#ffffff10] group-hover:bg-[#00f2ff] group-hover:text-black transition-colors">
                                            {p.number}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-[#00f2ff] transition-colors">{p.name}</div>
                                            <div className="text-[10px] font-mono text-[#ffffff40] uppercase">{p.position} // {p.nickname}</div>
                                        </div>
                                        {p.stats && (
                                            <div className="flex gap-3 text-center">
                                                <div>
                                                    <div className="text-[10px] text-[#ffffff30] uppercase">G</div>
                                                    <div className="text-xs font-bold text-white">{p.stats.goals}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-[#ffffff30] uppercase">A</div>
                                                    <div className="text-xs font-bold text-white">{p.stats.assists}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Player Details */}
            {selectedPlayer && (
                <PlayerDetailModal
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}
        </div>
    );
};

const PlayerNode = ({ player, color, isGK, onClick }) => (
    <div className="relative group cursor-pointer flex flex-col items-center" onClick={onClick}>
        {/* Holographic Circle */}
        <div
            className={`
                w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#ffffff40] 
                bg-black/40 backdrop-blur-sm flex items-center justify-center 
                transition-all duration-300 group-hover:scale-110 
                shadow-lg hover:shadow-[0_0_15px_var(--player-ptr-color)]
                ${isGK ? 'border-yellow-400' : ''}
            `}
            style={{
                '--player-ptr-color': color,
                backgroundColor: isGK ? 'rgba(255, 200, 0, 0.2)' : 'rgba(0, 0, 0, 0.4)'
            }}
        >
            <span className="text-xs font-black text-white">{player.number || '?'}</span>
        </div>

        {/* Player Name Tag */}
        <div className="mt-1 px-2 py-0.5 bg-black/60 rounded text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-md border border-[#ffffff10]">
            {player.name.split(' ').pop()}
        </div>
    </div>
);

export default RosterOverlay;
