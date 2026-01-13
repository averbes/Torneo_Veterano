import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, ChevronLeft, Save, Shield, GripVertical } from 'lucide-react';

const LineupModal = ({ match, teams = [], onClose, onSave }) => {
    const [allPlayers, setAllPlayers] = useState([]);
    const [teamARoster, setTeamARoster] = useState([]);
    const [teamBRoster, setTeamBRoster] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [draggingId, setDraggingId] = useState(null);

    const teamAName = teams.find(t => t.id === match.teamA)?.name || 'TEAM A';
    const teamBName = teams.find(t => t.id === match.teamB)?.name || 'TEAM B';

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await fetch('/api/players');
            const data = await res.json();
            setAllPlayers(data);

            const existingA = match.rosters?.teamA || [];
            const existingB = match.rosters?.teamB || [];

            setTeamARoster(data.filter(p => existingA.includes(p.id)));
            setTeamBRoster(data.filter(p => existingB.includes(p.id)));

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

    const handleDragStart = (e, player, source) => {
        e.dataTransfer.setData('playerId', player.id);
        e.dataTransfer.setData('source', source);
        setDraggingId(player.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, target) => {
        e.preventDefault();
        const playerId = e.dataTransfer.getData('playerId');
        setDraggingId(null);

        const player = allPlayers.find(p => p.id === playerId);
        if (!player) return;

        // Remove from everywhere first
        setAvailablePlayers(prev => prev.filter(p => p.id !== playerId));
        setTeamARoster(prev => prev.filter(p => p.id !== playerId));
        setTeamBRoster(prev => prev.filter(p => p.id !== playerId));

        // Add to target
        if (target === 'A') setTeamARoster(prev => [...prev, player]);
        if (target === 'B') setTeamBRoster(prev => [...prev, player]);
        if (target === 'global') setAvailablePlayers(prev => [...prev, player]);
    };

    const moveTo = (player, target) => {
        setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
        setTeamARoster(prev => prev.filter(p => p.id !== player.id));
        setTeamBRoster(prev => prev.filter(p => p.id !== player.id));

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
            <div className="relative w-full max-w-7xl h-[90vh] bg-[#0a0a1a] border border-white/10 rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">TACTICAL DEPLOYMENT</h2>
                        <p className="text-white/40 font-mono text-xs uppercase">Drag and drop units to assign squads</p>
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

                    {/* Team A Zone */}
                    <div
                        className="flex flex-col bg-[#00f2ff]/5 transition-colors relative"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'A')}
                    >
                        <div className="p-4 text-center border-b border-[#00f2ff]/20 bg-[#00f2ff]/10">
                            <h3 className="text-[#00f2ff] font-black uppercase text-xl">{teamAName}</h3>
                            <div className="text-xs font-mono text-[#00f2ff]/60">{teamARoster.length} UNITS ASSIGNED</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filterList(teamARoster).map(p => (
                                <DraggableCard
                                    key={p.id}
                                    player={p}
                                    source="A"
                                    onDragStart={handleDragStart}
                                    action={() => moveTo(p, 'global')}
                                    icon={<X size={14} />}
                                    color="text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                    isDragging={draggingId === p.id}
                                />
                            ))}
                            {teamARoster.length === 0 && <EmptyState text="DROP UNITS HERE" />}
                        </div>
                    </div>

                    {/* Reserve Pool Zone */}
                    <div
                        className="flex flex-col bg-black/40"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'global')}
                    >
                        <div className="p-4 text-center border-b border-white/10">
                            <h3 className="text-white/40 font-black uppercase text-sm">RESERVE POOL</h3>
                            <div className="text-xs font-mono text-white/30">{availablePlayers.length} UNITS AVAILABLE</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filterList(availablePlayers).map(p => (
                                <DraggableCard
                                    key={p.id}
                                    player={p}
                                    source="global"
                                    onDragStart={handleDragStart}
                                    actionClickLeft={() => moveTo(p, 'A')}
                                    actionClickRight={() => moveTo(p, 'B')}
                                    iconLeft={<ChevronLeft size={16} />}
                                    iconRight={<ChevronRight size={16} />}
                                    isReserve={true}
                                    isDragging={draggingId === p.id}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Team B Zone */}
                    <div
                        className="flex flex-col bg-[#00f2ff]/5"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'B')}
                    >
                        <div className="p-4 text-center border-b border-[#00f2ff]/20 bg-[#00f2ff]/10">
                            <h3 className="text-[#00f2ff] font-black uppercase text-xl">{teamBName}</h3>
                            <div className="text-xs font-mono text-[#00f2ff]/60">{teamBRoster.length} UNITS ASSIGNED</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filterList(teamBRoster).map(p => (
                                <DraggableCard
                                    key={p.id}
                                    player={p}
                                    source="B"
                                    onDragStart={handleDragStart}
                                    action={() => moveTo(p, 'global')}
                                    icon={<X size={14} />}
                                    color="text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                    alignRight
                                    isDragging={draggingId === p.id}
                                />
                            ))}
                            {teamBRoster.length === 0 && <EmptyState text="DROP UNITS HERE" />}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const DraggableCard = ({ player, onDragStart, source, action, icon, color, alignRight, isReserve, actionClickLeft, actionClickRight, iconLeft, iconRight, isDragging }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, player, source)}
        className={`
            flex items-center gap-3 p-3 bg-[#0a0a1a] border border-white/10 rounded-xl 
            hover:border-[#00f2ff]/50 hover:bg-[#00f2ff]/5 transition-all cursor-grab active:cursor-grabbing
            ${alignRight ? 'flex-row-reverse text-right' : ''}
            ${isDragging ? 'opacity-50 border-dashed border-[#00f2ff]' : 'opacity-100'}
        `}
    >
        {/* Grip Handle */}
        <div className="text-white/10"><GripVertical size={16} /></div>

        {/* Reserve Controls (Arrows) */}
        {isReserve && (
            <button onClick={actionClickLeft} className="p-2 hover:bg-[#00f2ff]/20 hover:text-[#00f2ff] text-white/20 rounded-lg transition-all"><ChevronLeft size={16} /></button>
        )}

        {/* Player Info */}
        <div className="flex-1">
            <div className="font-bold text-white leading-none text-sm">{player.name}</div>
            <div className="text-[10px] text-white/40 font-mono mt-1 uppercase">{player.position} • {player.teamId === 'free_agent' ? 'NO TEAM' : 'REGISTERED'}</div>
        </div>

        {/* Remove Button for Team Columns */}
        {!isReserve && (
            <button onClick={action} className={`p-1.5 rounded-lg ${color} transition-colors`}>{icon}</button>
        )}

        {/* Reserve Controls (Right Arrow) */}
        {isReserve && (
            <button onClick={actionClickRight} className="p-2 hover:bg-[#00f2ff]/20 hover:text-[#00f2ff] text-white/20 rounded-lg transition-all"><ChevronRight size={16} /></button>
        )}
    </div>
);

const EmptyState = ({ text }) => (
    <div className="h-24 border-2 border-dashed border-[#00f2ff]/10 rounded-xl flex items-center justify-center text-[#00f2ff]/30 font-black text-xs uppercase tracking-widest pointer-events-none">
        {text}
    </div>
);

export default LineupModal;
