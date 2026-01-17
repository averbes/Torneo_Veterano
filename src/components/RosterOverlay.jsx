import React, { useState, useEffect } from 'react';
import PlayerDetailModal from './PlayerDetailModal';
import { X, Users, MapPin, Eye, Zap, Shield, Circle, Layout as LayoutIcon, User } from 'lucide-react';

const RosterOverlay = ({ team, onClose }) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stadiumMode, setStadiumMode] = useState(false);

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

    const getTacticalLayout = () => {
        // Precise Coordinates for 4-4-2 as requested
        const positions = [
            { id: 'gk', role: 'GK', x: 50, y: 85, label: 'GOALKEEPER' },
            { id: 'ld', role: 'DF', x: 75, y: 70, label: 'RIGHT BACK' },
            { id: 'c1', role: 'DF', x: 40, y: 70, label: 'CENTER BACK' },
            { id: 'c2', role: 'DF', x: 60, y: 70, label: 'CENTER BACK' },
            { id: 'li', role: 'DF', x: 25, y: 70, label: 'LEFT BACK' },
            { id: 'md', role: 'MF', x: 75, y: 50, label: 'RIGHT MID' },
            { id: 'id', role: 'MF', x: 60, y: 50, label: 'INT RIGHT' },
            { id: 'ii', role: 'MF', x: 40, y: 50, label: 'INT LEFT' },
            { id: 'mi', role: 'MF', x: 25, y: 50, label: 'LEFT MID' },
            { id: 'd1', role: 'FW', x: 40, y: 30, label: 'STRIKER' },
            { id: 'd2', role: 'FW', x: 60, y: 30, label: 'STRIKER' }
        ];

        if (!players.length) return positions.map(pos => ({ ...pos, player: null }));

        let pool = players.filter(p => p.isStarter);
        if (pool.length < 11) {
            const nonStarters = players.filter(p => !p.isStarter);
            pool = [...pool, ...nonStarters].slice(0, 11);
        }

        const remaining = [...pool];
        return positions.map(pos => {
            const idx = remaining.findIndex(p => {
                if (pos.role === 'GK') return p.position === 'GK';
                if (pos.role === 'DF') return p.position === 'DF' || p.position === 'Defender';
                if (pos.role === 'MF') return p.position === 'MF' || p.position === 'Mediocampista' || p.position === 'Midfielder';
                if (pos.role === 'FW') return p.position === 'FW' || p.position === 'Forward' || p.position === 'Delantero';
                return false;
            });
            const p = idx !== -1 ? remaining.splice(idx, 1)[0] : remaining.shift();
            return { ...pos, player: p };
        });
    };

    const tacticalLineup = getTacticalLayout();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8">
            {/* Holographic Background Layer */}
            <div
                className="absolute inset-0 bg-[#050510]/98 backdrop-blur-3xl"
                onClick={onClose}
            >
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #00d4ff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative w-full lg:max-w-7xl h-full lg:max-h-[92vh] bg-[#0a0a1a] border-t lg:border border-[#00d4ff]/20 lg:rounded-[2.5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.9)] flex flex-col group/modal">

                {/* HUD Header */}
                <div className="px-4 md:px-8 py-4 md:py-6 border-b border-[#00d4ff]/10 flex justify-between items-center bg-gradient-to-r from-[#00d4ff0a] to-transparent shrink-0">
                    <div className="flex items-center gap-3 md:gap-8 overflow-hidden">
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 md:w-16 md:h-16 bg-black border border-[#00d4ff]/30 rounded-xl md:rounded-2xl flex items-center justify-center p-1.5 md:p-2 overflow-hidden group-hover:border-[#00d4ff] transition-all duration-500">
                                {team.logo && (team.logo.startsWith('data:') || team.logo.startsWith('http')) ? (
                                    <img src={team.logo} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]" />
                                ) : <Shield className="text-[#00d4ff] w-6 h-6 md:w-10 md:h-10" />}
                            </div>
                            <div className="absolute -inset-1.5 border-2 border-[#00d4ff]/10 rounded-xl md:rounded-[1.25rem] animate-[spin_10s_linear_infinite] hidden md:block" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-3">
                                <h2 className="text-xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none italic truncate">
                                    {team.name}
                                </h2>
                                <div className="hidden sm:block px-2 py-0.5 bg-[#00d4ff] text-[#050510] text-[8px] md:text-[10px] font-black rounded-sm skew-x-[-20deg] shrink-0">TACTICAL HUD</div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2">
                                <div className="text-[7px] md:text-[10px] font-mono text-[#00d4ff] uppercase tracking-[0.2em] md:tracking-[0.4em] flex items-center gap-1 md:gap-2">
                                    <Zap size={8} className="animate-pulse" /> <span className="hidden xs:inline">SQUAD SYNCHRONIZED</span>
                                </div>
                                <div className="h-0.5 md:h-1 w-12 md:w-24 bg-[#ffffff05] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00d4ff] w-3/4 animate-[pulse_2s_infinite]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <button
                            onClick={() => setStadiumMode(!stadiumMode)}
                            className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border font-black text-[8px] md:text-[10px] uppercase transition-all duration-300 ${stadiumMode
                                ? 'bg-[#00d4ff] text-[#050510] border-[#00f2ff] shadow-[0_0_20px_#00d4ff40]'
                                : 'bg-white/5 text-white/40 border-white/10 hover:border-[#00d4ff]/50'
                                }`}
                        >
                            {stadiumMode ? <LayoutIcon size={12} /> : <Eye size={12} />}
                            <span className="hidden xs:inline">{stadiumMode ? 'DATA' : 'STADIUM'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-2xl bg-white/5 text-white/20 hover:bg-red-500/10 hover:text-red-500 border border-white/5 hover:border-red-500/30 transition-all duration-300 group/close"
                        >
                            <X size={18} className="group-hover/close:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
                    {/* Tactical Theater */}
                    <div className="w-full lg:w-2/3 relative flex items-center justify-center overflow-hidden bg-black border-b lg:border-r border-white/5 p-4 md:p-8 shrink-0 min-h-[450px]">
                        {/* THE PITCH */}
                        <div className={`relative w-full aspect-[3/4] max-w-[500px] border-2 border-[#00d4ff]/20 rounded-2xl overflow-hidden transition-all duration-700 ${stadiumMode ? 'scale-[1.05] shadow-[0_0_80px_rgba(0,0,0,0.8)]' : ''
                            }`}>
                            {/* Background Layers */}
                            {!stadiumMode ? (
                                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] via-[#0a0a20] to-[#00d4ff10]">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #00d4ff 0, #00d4ff 1px, transparent 1px, transparent 50px)' }} />
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #00d4ff 0, #00d4ff 1px, transparent 1px, transparent 50px)' }} />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-black">
                                    <img src="/stadium_bg.png" className="w-full h-full object-cover opacity-60 scale-110" alt="Stadium" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                                </div>
                            )}

                            {/* Neon Pitch Lines */}
                            <div className="absolute inset-0 pointer-events-none opacity-40">
                                <div className="absolute inset-4 border border-[#00d4ff] rounded-lg shadow-[inset_0_0_20px_#00d4ff20]" />
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#00d4ff]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#00d4ff] rounded-full shadow-[0_0_15px_#00d4ff20]" />
                                {/* Penalty Areas */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/5 h-[120px] border-b border-x border-[#00d4ff]" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/5 h-[120px] border-t border-x border-[#00d4ff]" />
                            </div>

                            {/* PLAYERS GRID Rendering */}
                            {tacticalLineup.map((pos) => (
                                <div
                                    key={pos.id}
                                    className="absolute transition-all duration-1000 ease-in-out z-20"
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    <PlayerHUDNode
                                        player={pos.player}
                                        roleLabel={pos.label}
                                        color={team.color || '#00d4ff'}
                                        onClick={() => pos.player && setSelectedPlayer(pos.player)}
                                    />
                                </div>
                            ))}

                            {/* Floating Particles Mask */}
                            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
                        </div>
                    </div>

                    {/* Roster Scanner */}
                    <div className="w-full lg:w-1/3 bg-[#0a0a1a] flex flex-col border-l border-[#00d4ff]/10">
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.5em] flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-ping" />
                                Operation Squad
                            </h3>
                            <div className="text-[10px] font-mono text-[#00d4ff]">{players.length} Operatives</div>
                        </div>

                        <div className="flex-1 overflow-auto px-8 pb-8 space-y-3 custom-scrollbar">
                            {players.map((p, idx) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPlayer(p)}
                                    className="group/item relative flex items-center gap-5 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#00d4ff]/40 rounded-2xl cursor-pointer transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black text-[#00d4ff] text-lg overflow-hidden relative">
                                        {p.photo ? (
                                            <img src={p.photo} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" alt={p.number} />
                                        ) : p.number}
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-[#00d4ff] scale-0 group-hover/item:scale-100 transition-transform" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white uppercase group-hover/item:text-[#00d4ff] transition-colors">{p.name}</span>
                                            {p.isStarter && <span className="text-[8px] bg-[#00d4ff15] text-[#00d4ff] px-1.5 py-0.5 rounded font-black uppercase">Start</span>}
                                        </div>
                                        <div className="text-[9px] font-mono text-white/30 uppercase mt-1 flex items-center gap-2">
                                            {p.position} <span className="text-white/10">|</span> <span className="text-[#00d4ff]/40">{p.nickname || 'NO NICKNAME'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-white/20 font-black">G</span>
                                            <span className="text-xs font-bold text-white leading-none">{p.stats?.goals || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-white/20 font-black">A</span>
                                            <span className="text-xs font-bold text-white/60 leading-none">{p.stats?.assists || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedPlayer && (
                <PlayerDetailModal
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}
        </div>
    );
};

const PlayerHUDNode = ({ player, roleLabel, color, onClick }) => {
    if (!player) return (
        <div className="group/node flex flex-col items-center gap-2 opacity-20 filter grayscale">
            <div className="w-10 h-10 rounded-full border border-dashed border-white/40 flex items-center justify-center">
                <LayoutIcon size={16} className="text-white" />
            </div>
            <span className="text-[8px] font-mono text-white uppercase text-center px-2 bg-white/10 rounded">{roleLabel}</span>
        </div>
    );

    return (
        <div
            className="group/node cursor-pointer flex flex-col items-center transition-all duration-500 hover:z-50"
            onClick={onClick}
        >
            {/* Holographic Avatar Circle */}
            <div className="relative">
                <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 p-1 bg-black/40 backdrop-blur-md transition-all duration-500 group-hover/node:scale-125 group-hover/node:shadow-[0_0_20px_var(--glow-color)]"
                    style={{
                        borderColor: `${color}40`,
                        '--glow-color': color
                    }}
                >
                    <div className="w-full h-full rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                        {player.photo ? (
                            <img src={player.photo} className="w-full h-full object-cover group-hover/node:scale-110 transition-transform duration-700" alt={player.name} />
                        ) : (
                            <span className="text-lg font-black text-white">{player.number}</span>
                        )}
                    </div>
                </div>

                {/* HUD Rings */}
                <div className="absolute -inset-1 border border-[#00d4ff]/10 rounded-full group-hover/node:animate-spin-slow transition-all group-hover/node:border-[#00d4ff]/40" />
                <div className="absolute -inset-2 border border-white/5 rounded-full group-hover/node:scale-110 transition-all" />

                {/* Position Marker */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00d4ff] rounded border-2 border-black flex items-center justify-center text-[8px] font-black text-black z-20">
                    {player.number}
                </div>
            </div>

            {/* Floating Info Plate */}
            <div className="mt-3 relative flex flex-col items-center">
                <div className="px-3 py-1 bg-black/80 backdrop-blur-md border border-[#00d4ff]/20 rounded-md shadow-2xl skew-x-[-15deg] group-hover/node:border-[#00d4ff] group-hover/node:bg-[#00d4ff] group-hover/node:text-black transition-all duration-300">
                    <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap block skew-x-[15deg]">{player.name.split(' ').pop()}</span>
                </div>

                {/* HUD Data Bits */}
                <div className="flex gap-1 mt-1 opacity-0 group-hover/node:opacity-100 transition-all duration-500 translate-y-2 group-hover/node:translate-y-0">
                    <div className="w-1.5 h-0.5 bg-[#00d4ff] shadow-[0_0_5px_#00d4ff]" />
                    <div className="w-1.5 h-0.5 bg-[#00d4ff] shadow-[0_0_5px_#00d4ff]" />
                    <div className="w-1.5 h-0.5 bg-[#00d4ff] shadow-[0_0_5px_#00d4ff]" />
                </div>
            </div>
        </div>
    );
};

export default RosterOverlay;
