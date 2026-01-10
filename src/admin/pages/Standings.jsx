import React, { useState, useEffect } from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const Standings = () => {
    const [standings, setStandings] = useState([]);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCard, setEditingCard] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, tRes, pRes] = await Promise.all([
                fetch('/api/standings'),
                fetch('/api/teams'),
                fetch('/api/players')
            ]);
            const sData = await sRes.json();
            const tData = await tRes.json();
            const pData = await pRes.json();
            setStandings(sData || []);
            setTeams(tData || []);
            setPlayers(pData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTeamInfo = (id) => teams.find(t => t.id === id) || { name: 'Unknown Team', logo: '🛡️' };

    const handleEditCards = (player) => {
        setEditingCard({
            playerId: player.id,
            yellowCards: player.stats?.yellowCards || 0,
            redCards: player.stats?.redCards || 0
        });
    };

    const handleSaveCards = async (playerId) => {
        try {
            const player = players.find(p => p.id === playerId);
            if (!player) return;

            const updatedStats = {
                ...player.stats,
                yellowCards: editingCard.yellowCards,
                redCards: editingCard.redCards
            };

            const response = await fetch(`/api/players/${playerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stats: updatedStats })
            });

            if (response.ok) {
                // Update local state
                setPlayers(players.map(p =>
                    p.id === playerId
                        ? { ...p, stats: updatedStats }
                        : p
                ));
                setEditingCard(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Failed to update cards'}`);
            }
        } catch (err) {
            console.error('Error saving cards:', err);
            alert('Failed to save card data');
        }
    };

    if (loading && standings.length === 0) {
        return <div className="p-8 text-center text-[#00f2ff] font-mono animate-pulse">RECALCULATING LEAGUE TABLE...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">LEAGUE <span className="text-[#00f2ff]">STANDINGS</span></h2>
                <p className="text-[#ffffff50] text-sm font-mono mt-1 uppercase tracking-widest">Global Ranking & Division Stats</p>
            </div>

            <div className="bg-[#ffffff02] border border-[#ffffff08] rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#ffffff05] border-b border-[#ffffff08]">
                        <tr>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center w-16">Rank</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Squad Identity</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">P</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">W</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">D</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">L</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">GF</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">GA</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">GD</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center font-bold text-white">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ffffff05]">
                        {standings.length > 0 ? (
                            standings.map((entry, index) => {
                                const team = getTeamInfo(entry.teamId);
                                return (
                                    <tr key={entry.teamId} className={`group transition-colors ${index < 3 ? 'bg-[#00f2ff]/05' : 'hover:bg-[#ffffff02]'}`}>
                                        <td className="p-4 text-center">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black mx-auto ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                                                index === 1 ? 'bg-slate-300/20 text-slate-300' :
                                                    index === 2 ? 'bg-amber-700/20 text-amber-600' :
                                                        'text-[#ffffff20] font-mono'
                                                }`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-[#ffffff05] rounded-xl border border-[#ffffff10] overflow-hidden">
                                                    {team.logo && team.logo.startsWith('data:') ? (
                                                        <img src={team.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <span className="text-2xl">{team.logo || '🛡️'}</span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-white uppercase tracking-tight">{team.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-mono text-[#ffffff50]">{entry.played}</td>
                                        <td className="p-4 text-center font-mono text-[#ffffff50]">{entry.won}</td>
                                        <td className="p-4 text-center font-mono text-[#ffffff50]">{entry.drawn}</td>
                                        <td className="p-4 text-center font-mono text-[#ffffff50]">{entry.lost}</td>
                                        <td className="p-4 text-center font-mono text-[#ffffff50]">{entry.gf}</td>
                                        <td className="p-4 text-center font-mono text-[#ffffff50]">{entry.ga}</td>
                                        <td className="p-4 text-center font-mono">
                                            <span className={`font-bold ${entry.gd > 0 ? 'text-green-400' : entry.gd < 0 ? 'text-red-400' : 'text-[#ffffff50]'}`}>
                                                {entry.gd > 0 ? '+' : ''}{entry.gd}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-lg font-black text-[#00f2ff] drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">{entry.points}</span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="10" className="p-12 text-center text-[#ffffff20] font-mono uppercase italic">
                                    No combat data recorded yet...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-[#00f2ff]/05 border border-[#00f2ff]/10 rounded-2xl p-6 flex items-start gap-4">
                <Trophy className="text-[#00f2ff] shrink-0" size={24} />
                <div>
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-1">League Protocol</h4>
                    <p className="text-[#ffffff50] text-xs leading-relaxed">
                        Standings are updated automatically upon match finalization. Rank priority: Points &gt; Goal Difference &gt; Goals Scored.
                        Elite squads (Top 1) qualify for the Grand Final Championship.
                    </p>
                </div>
            </div>

            {/* Player Cards Table */}
            <div className="mt-8">
                <div className="mb-4">
                    <h2 className="text-3xl font-black text-white tracking-tighter">DISCIPLINARY <span className="text-yellow-400">RECORDS</span></h2>
                    <p className="text-[#ffffff50] text-sm font-mono mt-1 uppercase tracking-widest">Player Cards Registry</p>
                </div>

                <div className="bg-[#ffffff02] border border-[#ffffff08] rounded-2xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#ffffff05] border-b border-[#ffffff08]">
                            <tr>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">#</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Player</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Team</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Position</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">Yellow Cards</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">Red Cards</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ffffff05]">
                            {players.length > 0 ? (
                                players
                                    .sort((a, b) => {
                                        const totalA = (a.stats?.yellowCards || 0) + (a.stats?.redCards || 0) * 2;
                                        const totalB = (b.stats?.yellowCards || 0) + (b.stats?.redCards || 0) * 2;
                                        return totalB - totalA;
                                    })
                                    .map((player) => {
                                        const team = getTeamInfo(player.teamId);
                                        const isEditing = editingCard?.playerId === player.id;

                                        return (
                                            <tr key={player.id} className="group hover:bg-[#ffffff02] transition-colors">
                                                <td className="p-4 font-mono text-[#ffffff50]">{player.number}</td>
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-bold text-white">{player.name}</div>
                                                        {player.nickname && (
                                                            <div className="text-xs text-[#00f2ff] font-mono">"{player.nickname}"</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 flex items-center justify-center bg-[#ffffff05] rounded-lg border border-[#ffffff10] overflow-hidden">
                                                            {team.logo && team.logo.startsWith('data:') ? (
                                                                <img src={team.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                                                            ) : (
                                                                <span className="text-sm">{team.logo || '🛡️'}</span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-[#ffffff70]">{team.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-[#ffffff70]">{player.position}</td>
                                                <td className="p-4 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-16 bg-[#ffffff10] border border-[#ffffff20] rounded px-2 py-1 text-center text-yellow-400 font-mono"
                                                            value={editingCard.yellowCards}
                                                            onChange={(e) => setEditingCard({ ...editingCard, yellowCards: parseInt(e.target.value) || 0 })}
                                                        />
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 font-mono font-bold">
                                                            🟨 {player.stats?.yellowCards || 0}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-16 bg-[#ffffff10] border border-[#ffffff20] rounded px-2 py-1 text-center text-red-400 font-mono"
                                                            value={editingCard.redCards}
                                                            onChange={(e) => setEditingCard({ ...editingCard, redCards: parseInt(e.target.value) || 0 })}
                                                        />
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 font-mono font-bold">
                                                            🟥 {player.stats?.redCards || 0}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {isEditing ? (
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                onClick={() => handleSaveCards(player.id)}
                                                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-xs font-mono"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingCard(null)}
                                                                className="px-3 py-1 bg-[#ffffff10] text-[#ffffff50] rounded hover:bg-[#ffffff20] transition-colors text-xs font-mono"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEditCards(player)}
                                                            className="px-3 py-1 bg-[#00f2ff]/10 text-[#00f2ff] rounded hover:bg-[#00f2ff]/20 transition-colors text-xs font-mono"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-[#ffffff20] font-mono uppercase italic">
                                        No players registered yet...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Standings;
