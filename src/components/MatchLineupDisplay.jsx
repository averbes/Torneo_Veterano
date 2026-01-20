import React, { useState, useEffect } from 'react';
import { X, Users, Shield, User, Zap, Layout as LayoutIcon, Eye, Target } from 'lucide-react';
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

    const themeColor = '#FF6B35';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 lg:p-8 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-3xl" onClick={onClose} />

            <div className="relative w-full md:w-[95%] lg:max-w-7xl h-full md:h-[94vh] bg-[#0a0a1a] border-t md:border border-[#FF6B35]/20 rounded-none md:rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.9)] flex flex-col">

                {/* HUD Elements - Corners */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[#FF6B35]/30 rounded-tl-[3rem] pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[#FF6B35]/10 rounded-tr-[3rem] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-[#FF6B35]/10 rounded-bl-[3rem] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#FF6B35]/30 rounded-br-[3rem] pointer-events-none" />

                {/* Header */}
                <div className="px-6 md:px-12 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl shrink-0 z-20">
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="flex -space-x-4">
                            <div className="w-10 h-10 md:w-16 md:h-16 bg-black border-2 border-[#FF6B35] rounded-full flex items-center justify-center p-1.5 md:p-2 z-10 shadow-[0_0_25px_#FF6B3540]">
                                <img src={getTeamLogo(match.teamA)} className="w-full h-full object-contain" />
                            </div>
                            <div className="w-10 h-10 md:w-16 md:h-16 bg-black border-2 border-white/10 rounded-full flex items-center justify-center p-1.5 md:p-2 z-0 opacity-40">
                                <img src={getTeamLogo(match.teamB)} className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                NEURAL<span className="text-[#FF6B35]">_STADIUM</span>
                            </h2>
                            <div className="text-[8px] md:text-[10px] font-mono text-[#FF6B35]/60 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                <Zap size={8} className="animate-pulse" /> HYPER-REALISTIC TACTICAL INTERFACE // v3.0.1
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button
                            onClick={() => setStadiumMode(!stadiumMode)}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl border-2 font-black text-[9px] md:text-[11px] uppercase transition-all duration-500 hover:scale-105 active:scale-95 ${stadiumMode
                                ? 'bg-[#FF6B35] text-black border-[#FF6B35] shadow-[0_0_30px_#FF6B3560]'
                                : 'bg-white/5 text-[#FF6B35] border-[#FF6B35]/30 hover:bg-[#FF6B35]/10'
                                }`}
                        >
                            {stadiumMode ? <LayoutIcon size={14} /> : <Eye size={14} />}
                            <span>{stadiumMode ? '2D HUD' : '3D STADIUM'}</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-white/5 text-[#FF6B35] hover:bg-red-500 hover:text-white transition-all duration-300 border border-white/10"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
                    {/* Tactical View - The Pitch */}
                    <div className="w-full lg:w-[65%] relative flex items-center justify-center bg-black p-4 md:p-8 shrink-0 min-h-[550px] overflow-hidden lg:perspective-[2000px]">

                        {/* Stadium Ambience - Spotlights */}
                        {stadiumMode && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-[#FF6B35]/20 to-transparent rotate-[20deg] blur-sm" />
                                <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-[#FF6B35]/20 to-transparent -rotate-[20deg] blur-sm" />
                            </div>
                        )}

                        {/* Team Toggle HUD */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex bg-black/80 p-1.5 rounded-2xl border-2 border-white/5 backdrop-blur-2xl shadow-2xl">
                            {[match.teamA, match.teamB].map(id => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTeamId(id)}
                                    className={`px-8 md:px-12 py-3 rounded-xl text-[10px] md:text-[12px] font-black uppercase transition-all duration-500 flex items-center gap-3 ${activeTeamId === id
                                        ? 'bg-[#FF6B35] text-black shadow-[0_0_20px_#FF6B3540]'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${activeTeamId === id ? 'bg-black animate-pulse' : 'bg-white/10'}`} />
                                    {getTeamName(id).split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        {/* The Field */}
                        <div
                            className={`relative w-full aspect-[4/5] max-w-[400px] md:max-w-[550px] border-4 border-[#FF6B35]/20 rounded-[3rem] transition-all duration-1000 ease-out preserve-3d shadow-[0_0_80px_rgba(0,0,0,0.8)] ${stadiumMode
                                    ? 'transform rotateX(45deg) rotateZ(0deg) scale(0.9) translateY(100px)'
                                    : 'transform rotateX(0deg) scale(1)'
                                }`}
                        >
                            {!stadiumMode ? (
                                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] via-[#050510] to-[#FF6B35]/10" />
                            ) : (
                                <div className="absolute inset-0 bg-[#001100]">
                                    {/* Artificial Turf Texture */}
                                    <div className="absolute inset-0 opacity-30" style={{
                                        backgroundImage: 'repeating-linear-gradient(90deg, #113311 0px, #113311 50px, #1a441a 50px, #1a441a 100px)'
                                    }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                                </div>
                            )}

                            {/* Field Lines - Tactic Style */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-8 border-2 border-[#FF6B35]/30 rounded-2xl" />
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#FF6B35]/20" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-[#FF6B35]/20 rounded-full" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#FF6B35]/40 rounded-full" />
                                {/* Penalty Areas */}
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[60%] h-[120px] border-b-2 border-x-2 border-[#FF6B35]/20" />
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-[120px] border-t-2 border-x-2 border-[#FF6B35]/20" />
                            </div>

                            {/* Players */}
                            {tacticalLineup.map((pos) => (
                                <div
                                    key={pos.id}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out preserve-3d ${stadiumMode ? 'rotateX(-45deg)' : ''}`}
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transitionDelay: `${pos.id * 30}ms` }}
                                >
                                    <PlayerHologram player={pos.player} color={themeColor} is3D={stadiumMode} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roster & Analitics Sidebar */}
                    <div className="w-full lg:w-[35%] bg-[#050510] border-l border-white/5 flex flex-col overflow-hidden custom-scrollbar">
                        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <h4 className="text-[11px] font-black text-[#FF6B35] uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <Activity size={14} className="animate-spin-slow" /> ACTIVE_SQUAD_TRANSCRIPT
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-black border border-white/5 rounded-2xl">
                                    <div className="text-[9px] font-mono text-white/30 uppercase mb-1">FORMATION</div>
                                    <div className="text-lg font-black text-white italic">4-4-2 DIAMOND</div>
                                </div>
                                <div className="p-4 bg-black border border-white/5 rounded-2xl">
                                    <div className="text-[9px] font-mono text-white/30 uppercase mb-1">TEAM_CHEM</div>
                                    <div className="text-lg font-black text-[#FF6B35] italic">94%</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3">
                            {tacticalLineup.filter(p => p.player).map(pos => (
                                <RosterDetailedItem key={pos.id} player={pos.player} role={pos.role} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlayerHologram = ({ player, color, is3D }) => {
    if (!player) return <div className="w-8 h-8 rounded-full border border-dashed border-white/20 animate-pulse" />;

    return (
        <div className="flex flex-col items-center gap-3 group/p">
            <div className="relative">
                {/* Holographic Glow Base */}
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#FF6B35]/20 blur-md rounded-full transition-opacity duration-1000 ${is3D ? 'opacity-100' : 'opacity-0'}`} />

                {/* Player Card Node */}
                <div
                    className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl border-2 border-[#FF6B35]/30 bg-black/80 backdrop-blur-xl p-1 shadow-2xl group-hover/p:scale-110 transition-all duration-500 overflow-hidden relative ${is3D ? 'shadow-[#FF6B35]/20' : ''}`}
                >
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative">
                        {player.photo ? (
                            <img src={player.photo} className="w-full h-full object-cover filter brightness-110 contrast-125" alt="" />
                        ) : (
                            <div className="text-2xl font-black text-white/20">{player.number}</div>
                        )}
                        {/* Status Bar */}
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                <div className="px-3 py-1 bg-[#FF6B35] text-black text-[9px] md:text-[11px] font-black italic uppercase skew-x-[-15deg] shadow-[0_0_15px_#FF6B3560]">
                    <div className="skew-x-[15deg]">{player.name.split(' ').pop()}</div>
                </div>
                <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{player.number} // {player.position.substring(0, 3)}</div>
            </div>
        </div>
    );
};

const RosterDetailedItem = ({ player, role }) => (
    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-[#FF6B35]/5 hover:border-[#FF6B35]/30 transition-all duration-500">
        <div className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
            {player.photo ? <img src={player.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20 font-black">{player.number}</div>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black text-black uppercase ${role === 'GK' ? 'bg-yellow-400' :
                        role === 'DF' ? 'bg-green-500' :
                            role === 'MF' ? 'bg-[#FF6B35]' : 'bg-red-500'
                    }`}>
                    {role}
                </span>
                <div className="text-xs font-black text-white uppercase truncate tracking-tight">{player.name}</div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-[10px] font-mono text-white/40">RAT: <span className="text-white">88</span></div>
                <div className="text-[10px] font-mono text-white/40">G: <span className="text-[#FF6B35]">{player.stats?.goals || 0}</span></div>
            </div>
        </div>
        <div className="text-right shrink-0">
            <div className="text-xl font-black text-white/10 group-hover:text-[#FF6B35]/20 italic transition-colors">#{player.number}</div>
        </div>
    </div>
);

export default MatchLineupDisplay;
