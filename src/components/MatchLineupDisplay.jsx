import React, { useState, useEffect } from 'react';
import { X, Users, Shield, User, Zap, Layout as LayoutIcon, Eye } from 'lucide-react';
import { FORMATIONS } from '../utils/formations';

const MatchLineupDisplay = ({ match, onClose }) => {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTeamId, setActiveTeamId] = useState(match.teamA);
    const [stadiumMode, setStadiumMode] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const [pRes, tRes] = await Promise.all([
                    fetch('/api/players'),
                    fetch('/api/teams')
                ]);
                const pData = await pRes.json();
                const tData = await tRes.json();
                setPlayers(pData);
                setTeams(tData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    const getTeam = (id) => teams.find(t => t.id === id);
    const getTeamName = (id) => getTeam(id)?.name || 'Unknown';
    const getTeamLogo = (id) => getTeam(id)?.logo;

    const getTacticalLayout = (teamId) => {
        const formationKey = teamId === match.teamA
            ? match.formations?.teamA || '4-4-2'
            : match.formations?.teamB || '4-4-2';

        const basePositions = FORMATIONS[formationKey] || FORMATIONS['4-4-2'];

        const rosterIds = teamId === match.teamA ? match.rosters?.teamA : match.rosters?.teamB;
        if (!rosterIds || rosterIds.length === 0) return basePositions.map(pos => ({ ...pos, player: null }));

        const teamPlayers = players.filter(p => rosterIds.includes(p.id));

        // Smart Assignment Logic to prevent positioning errors
        const assignedIds = new Set();
        const matchesRole = (p, role) => {
            const pos = (p.position || '').toUpperCase();
            if (role === 'GK') return pos.includes('ARQUERO') || pos.includes('GK');
            if (role === 'DF') return pos.includes('DEFENSA') || pos.includes('DF');
            if (role === 'MF') return pos.includes('MEDIO') || pos.includes('MF');
            if (role === 'FW') return pos.includes('DELANTERO') || pos.includes('FW');
            return false;
        };

        const layout = basePositions.map(p => ({ ...p, player: null }));

        // 1. Assign players to their preferred roles first (Strict Match)
        ['GK', 'DF', 'MF', 'FW'].forEach(role => {
            const roleSlots = layout.filter(slot => slot.role === role);
            roleSlots.forEach(slot => {
                const candidate = teamPlayers.find(p => !assignedIds.has(p.id) && matchesRole(p, role));
                if (candidate) {
                    slot.player = candidate;
                    assignedIds.add(candidate.id);
                }
            });
        });

        // 2. Fill empty slots with remaining players (Fallback)
        layout.filter(slot => !slot.player).forEach(slot => {
            const candidate = teamPlayers.find(p => !assignedIds.has(p.id));
            if (candidate) {
                slot.player = candidate;
                assignedIds.add(candidate.id);
            }
        });

        return layout;
    };

    if (loading) return null;

    const currentTeam = getTeam(activeTeamId);
    const tacticalLineup = getTacticalLayout(activeTeamId);
    const teamAPlayers = players.filter(p => match.rosters?.teamA?.includes(p.id));
    const teamBPlayers = players.filter(p => match.rosters?.teamB?.includes(p.id));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 lg:p-8 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-[#050510]/98 backdrop-blur-3xl" onClick={onClose} />

            <div className="relative w-full md:w-[95%] lg:max-w-6xl h-full md:h-[92vh] bg-[#0a0a1a] border-t md:border border-[#00d4ff]/20 rounded-none md:rounded-[2.5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.9)] flex flex-col">

                {/* Header */}
                <div className="px-4 md:px-8 py-4 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="flex -space-x-3 md:-space-x-4">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-black border border-[#00d4ff]/30 rounded-full flex items-center justify-center p-1 md:p-1.5 z-10 shadow-[0_0_15px_#00d4ff20]">
                                <img src={getTeamLogo(match.teamA)} className="w-full h-full object-contain" />
                            </div>
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-black border border-red-500/30 rounded-full flex items-center justify-center p-1 md:p-1.5 z-0">
                                <img src={getTeamLogo(match.teamB)} className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm md:text-2xl font-black text-white uppercase tracking-tighter leading-none italic">TACTICAL BATTLEFIELD</h2>
                            <div className="text-[7px] md:text-[9px] font-mono text-[#00d4ff] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 flex items-center gap-1 md:gap-2">
                                <Zap size={6} className="animate-pulse" /> <span className="hidden sm:inline">OFFICIAL MATCH LINEUP // </span> <User size={6} /> {match.referee || 'AutoRef'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => setStadiumMode(!stadiumMode)}
                            className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border font-black text-[8px] md:text-[9px] uppercase transition-all duration-300 ${stadiumMode
                                ? 'bg-[#00d4ff] text-[#050510] border-[#00f2ff] shadow-[0_0_15px_#00d4ff40]'
                                : 'bg-white/5 text-white/40 border-white/10 hover:border-[#00d4ff]/50'
                                }`}
                        >
                            {stadiumMode ? <LayoutIcon size={10} /> : <Eye size={10} />}
                            <span className="hidden xs:inline">{stadiumMode ? 'DATA' : 'STADIUM'}</span>
                        </button>
                        <div className="hidden sm:flex bg-white/5 p-1 rounded-xl border border-white/10">
                            {[match.teamA, match.teamB].map(id => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTeamId(id)}
                                    className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all duration-300 ${activeTeamId === id
                                        ? 'bg-[#00d4ff] text-[#050510] shadow-[0_0_15px_#00d4ff40]'
                                        : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {getTeamName(id).split(' ')[0]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white/5 text-white/20 hover:text-red-500 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
                    {/* Tactical View */}
                    <div className="w-full lg:w-3/5 relative flex items-center justify-center bg-black p-4 shrink-0 min-h-[450px]">
                        {/* Team Toggle for Mobile */}
                        <div className="sm:hidden absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                            {[match.teamA, match.teamB].map(id => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTeamId(id)}
                                    className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300 ${activeTeamId === id
                                        ? 'bg-[#00d4ff] text-[#050510]'
                                        : 'text-white/40'
                                        }`}
                                >
                                    {getTeamName(id).split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        <div className={`relative w-full aspect-[3/4] max-w-[360px] md:max-w-[450px] border border-[#00d4ff]/20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${stadiumMode ? 'scale-[1.02]' : ''}`}>
                            {!stadiumMode ? (
                                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] via-[#0a0a20] to-[#00d4ff10]" />
                            ) : (
                                <div className="absolute inset-0 bg-black">
                                    <img src="/stadium_bg.png" className="w-full h-full object-cover opacity-60 scale-110" alt="Stadium" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                                </div>
                            )}

                            {/* Field Lines */}
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <div className="absolute inset-4 border border-[#00d4ff] rounded-lg" />
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#00d4ff]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-[#00d4ff] rounded-full" />
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/2 h-[80px] border-b border-x border-[#00d4ff]" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-[80px] border-t border-x border-[#00d4ff]" />
                            </div>

                            {/* Players */}
                            {tacticalLineup.map((pos) => (
                                <div
                                    key={pos.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                >
                                    <PlayerMinNode player={pos.player} color={pos.color || currentTeam?.color || '#00d4ff'} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roster List Split View */}
                    <div className="w-full lg:w-2/5 md:grid md:grid-cols-2 lg:flex lg:flex-col bg-[#0a0a1a] border-l border-white/5 overflow-auto custom-scrollbar">
                        {/* Team A List */}
                        <div className="p-6 border-b border-white/5">
                            <h4 className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-1 h-1 bg-[#00d4ff] animate-pulse" /> {getTeamName(match.teamA)}
                            </h4>
                            <div className="space-y-1.5">
                                {teamAPlayers.map(p => <RosterItem key={p.id} player={p} />)}
                            </div>
                        </div>

                        {/* Team B List */}
                        <div className="p-6">
                            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 text-right justify-end">
                                {getTeamName(match.teamB)} <div className="w-1 h-1 bg-red-500 animate-pulse" />
                            </h4>
                            <div className="space-y-1.5">
                                {teamBPlayers.map(p => <RosterItem key={p.id} player={p} reverse />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlayerMinNode = ({ player, color }) => {
    if (!player) return <div className="w-6 h-1 bg-white/10 rounded-full" />;
    return (
        <div className="flex flex-col items-center gap-1 group/p">
            <div
                className="w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur-sm p-0.5 shadow-lg group-hover/p:scale-110 transition-transform"
                style={{ borderColor: `${color}60` }}
            >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#ffffff05] flex items-center justify-center">
                    {player.photo ? (
                        <img src={player.photo} className="w-full h-full object-cover" alt="" />
                    ) : <span className="text-[10px] font-black text-white">{player.number}</span>}
                </div>
            </div>
            <div className="px-1.5 py-0.5 bg-black/80 border border-white/10 rounded-sm skew-x-[-10deg]">
                <span className="text-[8px] font-black text-white uppercase block skew-x-[10deg]">{player.name.split(' ').pop()}</span>
            </div>
        </div>
    );
};

const RosterItem = ({ player, reverse }) => (
    <div className={`flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.03] ${reverse ? 'flex-row-reverse text-right' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-black border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {player.photo ? <img src={player.photo} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-white">{player.number}</span>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-white uppercase truncate">{player.name}</div>
            <div className="text-[8px] font-mono text-white/30 uppercase">{player.position}</div>
        </div>
    </div>
);

export default MatchLineupDisplay;
