import React, { useState, useEffect } from 'react';
import PlayerDetailModal from './PlayerDetailModal';

const RosterOverlay = ({ team, onClose }) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (team) {
            fetchPlayers();
        }
    }, [team]);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/players?teamId=${team.id}`);
            const data = await res.json();
            setPlayers(data);
        } catch (err) {
            console.error("Failed to fetch players:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!team) return null;

    const starters = players.filter(p => p.isStarter);
    const subs = players.filter(p => !p.isStarter);

    // Group starters by row for 4-4-2
    const goalkeeper = starters.filter(p => p.position === 'GK');
    const defenders = starters.filter(p => p.position === 'DF');
    const midfielders = starters.filter(p => p.position === 'MF');
    const forwards = starters.filter(p => p.position === 'FW');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-[#0a0a1a] border border-[#ffffff10] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">

                {/* Header */}
                <div className="p-8 border-b border-[#ffffff10] grid grid-cols-3 items-center bg-[#ffffff02]">
                    <div className="flex items-center">
                        <div className="w-24 h-24 flex items-center justify-center bg-[#ffffff05] rounded-3xl border-2 border-[#ffffff10] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                            {team.logo && team.logo.startsWith('data:') ? (
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-3" />
                            ) : (
                                <span className="text-5xl">{team.logo || '🛡️'}</span>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {team.name}
                        </h2>
                        <div className="text-xs font-mono text-[#00f2ff] uppercase tracking-[0.5em] mt-2 opacity-50">Tactical Deployment Protocol</div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="w-16 h-16 flex items-center justify-center rounded-3xl bg-[#ffffff05] text-[#ffffff20] hover:text-[#ff0055] hover:bg-[#ff0055]/10 hover:border-[#ff0055]/50 transition-all border-2 border-[#ffffff10] text-4xl font-light"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="w-12 h-12 border-4 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-mono text-[#00f2ff] animate-pulse uppercase">Uplinking Roster Data...</span>
                        </div>
                    ) : (
                        <div className="bg-[#ffffff02] border border-[#ffffff08] rounded-2xl overflow-hidden backdrop-blur-sm">
                            <table className="w-full text-left">
                                <thead className="bg-[#ffffff05] border-b border-[#ffffff08]">
                                    <tr>
                                        <th className="p-6 text-xs font-black text-[#ffffff30] uppercase tracking-[0.2em]">Combat Identity</th>
                                        <th className="p-6 text-xs font-black text-[#ffffff30] uppercase tracking-[0.2em]">Field Position</th>
                                        <th className="p-6 text-xs font-black text-[#ffffff30] uppercase tracking-[0.2em] text-center">Unit #</th>
                                        <th className="p-6 text-xs font-black text-[#ffffff30] uppercase tracking-[0.2em] text-center">Battle Stats</th>
                                        <th className="p-6 text-xs font-black text-[#ffffff30] uppercase tracking-[0.2em] text-center">Discipline</th>
                                        <th className="p-6 text-xs font-black text-[#ffffff30] uppercase tracking-[0.2em]">Deploy Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ffffff05]">
                                    {players.map(p => (
                                        <tr
                                            key={p.id}
                                            onClick={() => setSelectedPlayer(p)}
                                            className="group hover:bg-[#ffffff05] transition-all cursor-pointer border-l-4 border-transparent hover:border-[#00f2ff]"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffffff10] to-transparent flex items-center justify-center border border-[#ffffff10] text-3xl group-hover:scale-110 transition-transform">
                                                        {p.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-black text-white group-hover:text-[#00f2ff] transition-colors uppercase tracking-tighter">{p.name}</div>
                                                        <div className="text-xs font-mono text-[#ffffff20] uppercase tracking-widest">{p.nickname || 'ALPHA_UNIT'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="inline-block px-4 py-2 bg-[#ffffff05] border border-[#ffffff10] rounded-xl text-lg font-black text-[#ffffff60] uppercase tracking-widest">
                                                    {p.position}
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="text-4xl font-black text-[#00f2ff] font-mono">#{String(p.number || 0).padStart(2, '0')}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-center gap-8">
                                                    <div className="text-center">
                                                        <div className="text-3xl font-black text-white">{p.stats?.goals || 0}</div>
                                                        <div className="text-[10px] font-black text-[#ffffff20] uppercase">Goals</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-3xl font-black text-white">{p.stats?.assists || 0}</div>
                                                        <div className="text-[10px] font-black text-[#ffffff20] uppercase">Asts</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-3xl font-black text-white">{p.stats?.minutes || 0}</div>
                                                        <div className="text-[10px] font-black text-[#ffffff20] uppercase">Mins</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                                                        <span className="text-sm font-black text-white mt-1">{p.stats?.yellowCards || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-4 h-6 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                                                        <span className="text-sm font-black text-white mt-1">{p.stats?.redCards || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`text-xs font-black px-4 py-2 rounded-full border ${p.status === 'Active'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    } uppercase tracking-widest`}>
                                                    {p.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {players.length === 0 && (
                                <div className="p-20 text-center border-t border-[#ffffff05]">
                                    <div className="text-4xl mb-4 opacity-20">📡</div>
                                    <p className="text-[#ffffff20] font-black uppercase tracking-[0.3em]">No personnel detected in this sector</p>
                                </div>
                            )}
                        </div>
                    )}
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
    <div className="relative group cursor-pointer" onClick={onClick}>
        <div className="flex flex-col items-center">
            {/* Holographic Circle */}
            <div
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#ffffff20] bg-[#ffffff05] backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--player-color)] group-hover:shadow-[0_0_20px_var(--player-color)]"
                style={{ '--player-color': color }}
            >
                <span className="text-xs md:text-sm font-black text-white">{player.number}</span>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-[var(--player-color)] opacity-0 group-hover:opacity-20 blur-md transition-opacity" />
            </div>

            {/* Label */}
            <div className="mt-2 text-center">
                <div className="text-[8px] md:text-[10px] font-bold text-white uppercase tracking-tighter truncate max-w-[80px]">
                    {player.name.split(' ')[0]}
                </div>
                <div className="text-[6px] md:text-[8px] font-mono text-[#ffffff40] uppercase">
                    {player.nickname}
                </div>
            </div>
        </div>
    </div>
);

export default RosterOverlay;
