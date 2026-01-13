import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, ChevronLeft, Save, Shield } from 'lucide-react';

const LineupModal = ({ match, onClose, onSave }) => {
    const [allPlayers, setAllPlayers] = useState([]);
    const [teamARoster, setTeamARoster] = useState([]);
    const [teamBRoster, setTeamBRoster] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await fetch('/api/players');
            const data = await res.json();
            setAllPlayers(data);

            // Initial distribution
            const existingA = match.rosters?.teamA || [];
            const existingB = match.rosters?.teamB || [];

            setTeamARoster(data.filter(p => existingA.includes(p.id)));
            setTeamBRoster(data.filter(p => existingB.includes(p.id)));

            // If no roster saved, maybe pre-fill with team members? 
            // The requirement says players can be anywhere, but pre-filling might be helpful.
            // Let's stick to: if saved roster exists, use it. If not, put everyone in available.
            // Actually, better UX: if NO roster saved, put team A players in A and team B in B as a default starting point.

            if (!match.rosters || (!match.rosters.teamA?.length && !match.rosters.teamB?.length)) {
                const defaultA = data.filter(p => p.teamId === match.teamA);
                const defaultB = data.filter(p => p.teamId === match.teamB);
                setTeamARoster(defaultA);
                setTeamBRoster(defaultB);
                setAvailablePlayers(data.filter(p => p.teamId !== match.teamA && p.teamId !== match.teamB));
            } else {
                setAvailablePlayers(data.filter(p => !existingA.includes(p.id) && !existingB.includes(p.id)));
            }

        } catch (_) {
            console.error("Error fetching players");
        } finally {
            setLoading(false);
        }
    };

    const moveTo = (player, target) => {
        // Remove from current spots
        setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
        setTeamARoster(prev => prev.filter(p => p.id !== player.id));
        setTeamBRoster(prev => prev.filter(p => p.id !== player.id));

        // Add to target
        if (target === 'A') setTeamARoster(prev => [...prev, player]);
        if (target === 'B') setTeamBRoster(prev => [...prev, player]);
        if (target === 'global') setAvailablePlayers(prev => [...prev, player]);
    };

    const handleSave = () => {
        onSave({
            teamA: teamARoster.map(p => p.id),
            teamB: teamBRoster.map(p => p.id)
        });
    };

    const filterList = (list) => {
        if (!search) return list;
        return list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.nickname?.toLowerCase().includes(search.toLowerCase()));
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-6xl h-[90vh] bg-[#0a0a1a] border border-white/10 rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">TACTICAL DEPLOYMENT</h2>
                        <p className="text-white/40 font-mono text-xs uppercase">Assign active units to combat squads</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="text-white" /></button>
                </div>

                {/* Controls */}
                <div className="p-4 border-b border-white/10 flex gap-4 bg-black/20">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="SEARCH UNIT DATABASE..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono focus:border-[#00f2ff] outline-none"
                        />
                    </div>
                    <button onClick={handleSave} className="px-8 bg-[#00f2ff] hover:bg-[#00f2ff]/80 text-black font-black uppercase tracking-wider rounded-xl flex items-center gap-2 hover:scale-105 transition-all">
                        <Save size={18} /> CONFIRM ROSTER
                    </button>
                </div>

                {/* Columns */}
                <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-[#050510]">

                    {/* Team A */}
                    <div className="flex flex-col bg-[#00f2ff]/5">
                        <div className="p-4 text-center border-b border-[#00f2ff]/20 bg-[#00f2ff]/10">
                            <h3 className="text-[#00f2ff] font-black uppercase text-xl">TEAM A</h3>
                            <div className="text-xs font-mono text-[#00f2ff]/60">{teamARoster.length} UNITS ASSIGNED</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filterList(teamARoster).map(p => (
                                <PlayerCard key={p.id} player={p} action={() => moveTo(p, 'global')} icon={<X size={14} />} color="text-red-400" />
                            ))}
                        </div>
                    </div>

                    {/* Available */}
                    <div className="flex flex-col bg-black/40">
                        <div className="p-4 text-center border-b border-white/10">
                            <h3 className="text-white/40 font-black uppercase text-sm">RESERVE POOL</h3>
                            <div className="text-xs font-mono text-white/30">{availablePlayers.length} UNITS AVAILABLE</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filterList(availablePlayers).map(p => (
                                <div key={p.id} className="flex items-center gap-1 p-2 bg-white/5 border border-white/5 rounded-lg group">
                                    <button onClick={() => moveTo(p, 'A')} className="p-2 hover:bg-[#00f2ff]/20 hover:text-[#00f2ff] rounded md:opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={16} /></button>
                                    <div className="flex-1 text-center">
                                        <div className="font-bold text-white text-sm">{p.name}</div>
                                        <div className="text-[10px] text-white/40 font-mono uppercase">{p.position}</div>
                                    </div>
                                    <button onClick={() => moveTo(p, 'B')} className="p-2 hover:bg-[#00f2ff]/20 hover:text-[#00f2ff] rounded md:opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="flex flex-col bg-[#00f2ff]/5">
                        <div className="p-4 text-center border-b border-[#00f2ff]/20 bg-[#00f2ff]/10">
                            <h3 className="text-[#00f2ff] font-black uppercase text-xl">TEAM B</h3>
                            <div className="text-xs font-mono text-[#00f2ff]/60">{teamBRoster.length} UNITS ASSIGNED</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filterList(teamBRoster).map(p => (
                                <PlayerCard key={p.id} player={p} action={() => moveTo(p, 'global')} icon={<X size={14} />} color="text-red-400" alignRight />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const PlayerCard = ({ player, action, icon, color, alignRight }) => (
    <div className={`flex items-center gap-3 p-3 bg-[#0a0a1a] border border-white/10 hover:border-[#00f2ff]/50 rounded-lg transition-all ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
        <button onClick={action} className={`p-1.5 hover:bg-white/10 rounded-md ${color} transition-colors`}>{icon}</button>
        <div className="flex-1">
            <div className="font-bold text-white leading-none">{player.name}</div>
            <div className="text-[10px] text-white/40 font-mono mt-1">{player.position}</div>
        </div>
    </div>
);

export default LineupModal;
