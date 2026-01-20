import React, { useState, useEffect } from 'react';
import { X, Shield, Zap, Target, Activity, ChevronRight, Layout, Info } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { normalizePlayers } from '../utils/playerHelpers';
import './TacticalHUD.css';

const RosterOverlay = ({ team, onClose }) => {
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dataUpdated, setDataUpdated] = useState(false);

    const fetchPlayers = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/players?teamId=${team.id}`);
            const data = await res.json();
            const normalized = normalizePlayers(data);
            setPlayers(normalized);
            // Default select the first starter if available
            const firstStarter = normalized.find(p => p.isStarter) || normalized[0];
            if (firstStarter) setSelectedPlayer(firstStarter);
        } catch (_) {
            console.error("Failed to fetch players");
        } finally {
            setLoading(false);
        }
    }, [team.id]);

    // ✅ REAL-TIME SYNC: Listen to WebSocket updates
    useSocket((update) => {
        if (update.type === 'players') {
            console.log('>>> [RosterOverlay]: Received player update via WebSocket');
            // Filter only players from current team
            const teamPlayers = update.data.filter(p =>
                (p.team_id === team.id) || (p.teamId === team.id)
            );
            const normalized = normalizePlayers(teamPlayers);
            setPlayers(normalized);

            // Update selected player if still in list
            if (selectedPlayer) {
                const updatedSelected = normalized.find(p => p.id === selectedPlayer.id);
                if (updatedSelected) setSelectedPlayer(updatedSelected);
            }

            // Visual feedback
            setDataUpdated(true);
            setTimeout(() => setDataUpdated(false), 600);
        }
    });

    useEffect(() => {
        if (team) fetchPlayers();
    }, [team, fetchPlayers]);

    // 4-4-2 Diamond Positions - UPDATED COORDINATES & LOGIC
    const getDiamondLayout = () => {
        // Exact coordinates from requirements
        const positions = [
            { id: 'gk', role: 'GK', x: 50, y: 85, label: '01. PORTERO', color: '#FFD700' }, // Yellow
            { id: 'rb', role: 'DF', x: 75, y: 70, label: '02. LATERAL DER', color: '#556B2F' }, // Olive/Green
            { id: 'cd1', role: 'DF', x: 40, y: 70, label: '03. CENTRAL 1', color: '#556B2F' },
            { id: 'cd2', role: 'DF', x: 60, y: 70, label: '04. CENTRAL 2', color: '#556B2F' },
            { id: 'lb', role: 'DF', x: 25, y: 70, label: '05. LATERAL IZQ', color: '#556B2F' },
            { id: 'md', role: 'MF', x: 50, y: 55, label: '06. MEDIO DEF', color: '#FFA500' }, // Orange
            { id: 'id', role: 'MF', x: 70, y: 50, label: '07. INT DER', color: '#FFA500' },
            { id: 'ii', role: 'MF', x: 30, y: 50, label: '08. INT IZQ', color: '#FFA500' },
            { id: 'mo', role: 'MF', x: 50, y: 45, label: '10. MEDIO OFE', color: '#FFA500' },
            { id: 'd1', role: 'FW', x: 40, y: 25, label: '09. DELANTERO 1', color: '#FF0000' }, // Red
            { id: 'd2', role: 'FW', x: 60, y: 25, label: '11. DELANTERO 2', color: '#FF0000' }
        ];

        if (!players.length) return positions.map(pos => ({ ...pos, player: null }));

        // LOGIC: First 11 registered players are TITULARES (Starters)
        // We assume 'players' array is already in registration/ID order from the API
        const starters = players.slice(0, 11);
        const assignedIds = new Set();

        // Helper to check role matching
        const matchesRole = (p, role) => {
            const pos = (p.position || '').toUpperCase();
            if (role === 'GK') return pos.includes('ARQUERO') || pos.includes('GK');
            if (role === 'DF') return pos.includes('DEFENSA') || pos.includes('DF');
            if (role === 'MF') return pos.includes('MEDIO') || pos.includes('MF');
            if (role === 'FW') return pos.includes('DELANTERO') || pos.includes('FW');
            return false;
        };

        const layout = positions.map(p => ({ ...p, player: null }));

        // 1. Assign players to their preferred roles first (Strict Match)
        // We process roles in priority order: GK -> DF -> MF -> FW
        ['GK', 'DF', 'MF', 'FW'].forEach(role => {
            const roleSlots = layout.filter(slot => slot.role === role);
            roleSlots.forEach(slot => {
                const candidate = starters.find(p => !assignedIds.has(p.id) && matchesRole(p, role));
                if (candidate) {
                    slot.player = candidate;
                    assignedIds.add(candidate.id);
                }
            });
        });

        // 2. Fill empty slots with remaining starters (Fallback)
        layout.filter(slot => !slot.player).forEach(slot => {
            const candidate = starters.find(p => !assignedIds.has(p.id));
            if (candidate) {
                slot.player = candidate;
                assignedIds.add(candidate.id);
            }
        });

        return layout;
    };

    const lineup = getDiamondLayout();

    if (!team) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000f0] backdrop-blur-md fifa-hud overflow-hidden animate-in fade-in duration-500">
            {/* Main HUD Container */}
            <div className="w-full h-full max-w-[1600px] flex flex-col p-4 md:p-8 relative">

                {/* TOP HEADER: TACTICAL OPERATION */}
                <header className="flex justify-between items-center mb-6 shrink-0 border-b-2 border-[#FF6B35]/30 pb-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-black border border-[#FF6B35]/50 flex items-center justify-center p-2 transform skew-x-[-10deg]">
                            {team.logo ? <img src={team.logo} className="w-full h-full object-contain" /> : <Shield color="#FF6B35" size={32} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
                                    {team.name}
                                </h1>
                                <span className="bg-[#FF6B35] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest skew-x-[-15deg]">Tactical Operation</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-military text-[#FF6B35]/70 uppercase tracking-[0.3em]">Sector: Operations_Squad // Status: Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end mr-8">
                            <span className="text-[10px] font-military text-[#ffffff30] uppercase">Uplink Status</span>
                            <span className="text-sm font-black text-green-500 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                STABLE_CONNECTION
                            </span>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-black transition-all group/close">
                            <X size={24} className="group-hover/close:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </header>

                <div className="flex-grow flex flex-col lg:flex-row gap-8 overflow-hidden">

                    {/* LEFT PANEL: SQUAD STATUS */}
                    <aside className="w-full lg:w-[350px] flex flex-col gap-4 shrink-0 overflow-y-auto lg:overflow-hidden">
                        <div className="bg-[#0a0a10] border-l-4 border-[#FF6B35] p-6 rounded-r-2xl">
                            <h3 className="text-xs font-black text-[#FF6B45] uppercase tracking-[0.4em] mb-4">Formation Analysis</h3>
                            <div className="text-4xl font-black text-white mb-2 italic">4-4-2 <span className="text-[#FF6B35]">DIAMOND</span></div>
                            <p className="text-[10px] font-military text-[#ffffff40] leading-relaxed uppercase">High-precision tactical deployment optimized for diagonal infiltration and central dominance.</p>
                        </div>

                        <div className="flex-grow bg-white/[0.02] border border-white/5 rounded-2xl p-6 overflow-hidden flex flex-col">
                            <h3 className="text-[10px] font-military text-[#ffffff30] uppercase tracking-[0.3em] mb-4 flex justify-between items-center">
                                <span>Operatives List</span>
                                <div className="flex items-center gap-2">
                                    <span>{players.length} UNITS</span>
                                    {dataUpdated && (
                                        <div className="flex items-center gap-1 text-[#00f2ff] animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]" />
                                            <span className="text-[8px]">SYNCED</span>
                                        </div>
                                    )}
                                </div>
                            </h3>
                            <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {players.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPlayer(p)}
                                        className={`flex items-center gap-4 p-3 border rounded-xl transition-all cursor-pointer ${selectedPlayer?.id === p.id ? 'bg-[#FF6B35]/20 border-[#FF6B35]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="w-10 h-10 bg-black border border-white/10 flex items-center justify-center text-[#FF6B35] font-black text-xs overflow-hidden">
                                            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : p.number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-black text-white uppercase truncate">{p.name}</div>
                                            <div className="text-[9px] font-military text-white/30 uppercase">{p.position}</div>
                                        </div>
                                        <ChevronRight size={14} className={selectedPlayer?.id === p.id ? 'text-[#FF6B35]' : 'text-white/20'} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER: ISOMETRIC TACTICAL PITCH */}
                    <main className="flex-grow relative flex items-center justify-center bg-black/40 border border-[#FF6B35]/10 rounded-3xl hex-grid overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] z-10" />

                        {/* Dynamic Field Borders */}
                        <div className="absolute inset-8 border border-[#FF6B35]/20 rounded-2xl z-0" />

                        <div className="relative w-full aspect-[4/5] max-w-[650px] pitch-isometric">
                            {/* Pitch Branding */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                                {team.logo ? <img src={team.logo} className="w-64 h-64 object-contain grayscale" /> : <Shield size={256} />}
                            </div>

                            {/* Neon Pitch Lines */}
                            <div className="absolute inset-0 border-2 border-[#FF6B35]/30 rounded-xl overflow-hidden pointer-events-none">
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#FF6B35]/20" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#FF6B35]/20 rounded-full" />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[15%] border-b-2 border-x-2 border-[#FF6B35]/20" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-[15%] border-t-2 border-x-2 border-[#FF6B35]/20" />
                            </div>

                            {/* Render Players */}
                            {lineup.map(pos => (
                                <div
                                    key={pos.id}
                                    className="absolute transition-all duration-1000"
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    <div
                                        onClick={() => pos.player && setSelectedPlayer(pos.player)}
                                        className={`group relative cursor-pointer flex flex-col items-center ${!pos.player ? 'opacity-20' : ''}`}
                                    >
                                        <div
                                            className="player-token flex items-center justify-center bg-black border-2 transition-colors duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                            style={{ borderColor: pos.color || '#FF6B35', boxShadow: `0 0 10px ${pos.color}40` }}
                                        >
                                            {pos.player?.photo ? (
                                                <img src={pos.player.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <span className="text-xl font-black text-white">{pos.player?.number || '??'}</span>
                                            )}
                                        </div>

                                        {/* Label Tag */}
                                        <div className="mt-2 text-center group-hover:scale-110 transition-transform">
                                            <div
                                                className="border px-2 py-0.5 rounded backdrop-blur-sm transition-colors"
                                                style={{
                                                    borderColor: `${pos.color || '#FF6B35'}60`,
                                                    backgroundColor: `${pos.color || '#FF6B35'}20`
                                                }}
                                            >
                                                <span className="text-[10px] font-black text-white whitespace-nowrap uppercase">
                                                    {pos.player?.name.split(' ').pop() || 'EMPTY'}
                                                </span>
                                            </div>
                                            <div
                                                className="text-[8px] font-military font-bold mt-0.5 tracking-tighter"
                                                style={{ color: pos.color || '#FF6B35' }}
                                            >
                                                {pos.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Scanline overlay */}
                        <div className="absolute inset-0 pointer-events-none scanlines opacity-50 z-20" />
                    </main>

                    {/* RIGHT PANEL: OPERATIVE INTEL */}
                    <aside className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 order-last lg:order-none">
                        {selectedPlayer ? (
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col h-full overflow-y-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="text-[10px] font-military text-[#FF6B35] tracking-[0.5em] uppercase">Intelligence_Report</div>
                                    <div className="text-4xl font-black text-white opacity-20 italic">#{selectedPlayer.number}</div>
                                </div>

                                <div className="relative w-full aspect-square bg-black border border-[#FF6B35]/30 rounded-2xl overflow-hidden mb-6 group/avatar">
                                    {selectedPlayer.photo ? (
                                        <img src={selectedPlayer.photo} className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5"><Layout size={64} color="#333" /></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B35]/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                </div>

                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-1">
                                    {selectedPlayer.name}
                                </h2>
                                <div className="text-sm font-military text-[#FF6B35] uppercase tracking-widest mb-6">
                                    {selectedPlayer.nickname || 'Codename: REDACTED'}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="text-[8px] font-military text-white/30 uppercase mb-1">Combat Role</div>
                                        <div className="text-lg font-black text-white uppercase">{selectedPlayer.position}</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="text-[8px] font-military text-white/30 uppercase mb-1">Nationality</div>
                                        <div className="text-lg font-black text-white uppercase">{selectedPlayer.nationality || 'UNK'}</div>
                                    </div>
                                </div>

                                {/* Performance Matrix */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-military text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Activity size={12} className="text-[#FF6B35]" /> Performance_Telemetry
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                            <span className="text-[10px] font-black text-white/40 uppercase">Assists</span>
                                            <span className="text-xl font-black text-[#FF6B35]">{selectedPlayer.stats?.assists || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-[#FF6B35]/10 rounded-lg border border-[#FF6B35]/20">
                                            <span className="text-[10px] font-black text-[#FF6B35] uppercase">Goals</span>
                                            <span className="text-2xl font-black text-white">{selectedPlayer.stats?.goals || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 text-center italic">
                                    <p className="text-[10px] font-military text-white/20 uppercase tracking-widest">Digital Authentication Signature Valid</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center opacity-30 text-center px-12">
                                <Info size={64} className="mb-6" />
                                <h3 className="text-xl font-black text-white uppercase">Waiting for Data Link</h3>
                                <p className="text-[10px] font-military text-white/50 uppercase mt-4">Select an operative from the squad or the tactical grid to initialize intelligence analysis.</p>
                            </div>
                        )}
                    </aside>
                </div>

                {/* FOOTER CONTROLS */}
                <footer className="mt-6 flex justify-between items-center bg-[#FF6B35]/5 border border-[#FF6B35]/20 p-4 rounded-2xl shrink-0">
                    <div className="flex gap-4 overflow-x-auto pb-1 lg:pb-0">
                        {['DEFENSIVE', 'BALANCED', 'ATTACKING', 'ULTRA_OFFENSIVE'].map(strat => (
                            <button key={strat} className="text-[9px] font-black text-[#FF6B35] border border-[#FF6B35]/30 px-4 py-1.5 rounded-sm hover:bg-[#FF6B35] hover:text-black transition-all whitespace-nowrap">
                                [ {strat} ]
                            </button>
                        ))}
                    </div>
                    <div className="hidden sm:block text-[10px] font-military text-white/30 uppercase">
                        NEO-Tactical Interface v2.0.4 // © 2026 EA SPORTS FUTURIST
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default RosterOverlay;
