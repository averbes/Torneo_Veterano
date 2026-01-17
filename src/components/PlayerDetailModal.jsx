import React, { useState, useEffect } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import {
    X, Shield, Activity, TrendingUp, History,
    Zap, Target, Award, Info, Loader2
} from 'lucide-react';

const PlayerDetailModal = ({ player, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        if (player?.id) {
            fetchHistory();
        }
    }, [player]);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await fetch(`/api/players/${player.id}/history`);
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!player) return null;

    const radarData = [
        { subject: 'PAC', A: player.attrPace || 50, fullMark: 100 },
        { subject: 'SHO', A: player.attrShooting || 50, fullMark: 100 },
        { subject: 'PAS', A: player.attrPassing || 50, fullMark: 100 },
        { subject: 'DRI', A: player.attrDribbling || 50, fullMark: 100 },
        { subject: 'DEF', A: player.attrDefending || 50, fullMark: 100 },
        { subject: 'PHY', A: player.attrPhysical || 50, fullMark: 100 },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop with neural grid effect */}
            <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl" onClick={onClose}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #00f2ff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="relative w-full max-w-5xl bg-[#0a0a1a] border border-[#00f2ff]/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,242,255,0.15)] flex flex-col md:flex-row animate-in fade-in zoom-in duration-500 max-h-[90vh]">

                {/* Left Section: Identity & Radar */}
                <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-[#ffffff08] flex flex-col bg-gradient-to-br from-[#00f2ff05] to-transparent">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-[#00f2ff] text-[#050510] text-[9px] font-black rounded-sm skew-x-[-20deg]">ELITE OPERATIVE</span>
                                <span className="text-[10px] font-mono text-[#00f2ff]/40">#{player.id?.slice(0, 8)}</span>
                            </div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{player.nickname || player.name}</h2>
                            <p className="text-[#ffffff40] font-mono text-xs mt-2 flex items-center gap-2">
                                <Shield size={12} className="text-[#00f2ff]" /> {player.teamName} <span className="text-[#ffffff10]">/</span> {player.position}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-5xl font-black text-[#00f2ff] italic opacity-20">#{player.number}</span>
                        </div>
                    </div>

                    {/* FIFA style Radar Chart */}
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 border border-[#00f2ff]/5 rounded-full animate-ping" />
                        </div>
                        <div className="w-full h-full max-h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#ffffff10" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 12, fontWeight: 'black' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name={player.name}
                                        dataKey="A"
                                        stroke="#00f2ff"
                                        fill="#00f2ff"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Attribute Badges */}
                        <div className="grid grid-cols-6 gap-2 w-full mt-4">
                            {radarData.map(attr => (
                                <div key={attr.subject} className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-white">{attr.A}</span>
                                    <span className="text-[8px] font-mono text-[#ffffff20] uppercase">{attr.subject}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Section: Detailed Stats & History */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar bg-black/20">
                    <div className="flex items-center gap-4 mb-8">
                        <TrendingUp className="text-[#00f2ff]" size={20} />
                        <h3 className="text-lg font-black text-white tracking-widest uppercase italic">Operational Performance</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#00f2ff]/20 to-transparent"></div>
                    </div>

                    {/* Core Numbers */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-[#00f2ff]/30 transition-all">
                            <div className="text-[10px] font-mono text-[#ffffff30] uppercase mb-1">Goals</div>
                            <div className="text-2xl font-black text-white group-hover:text-[#00f2ff] transition-colors">{player.stats?.goals || 0}</div>
                        </div>
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-[#00f2ff]/30 transition-all">
                            <div className="text-[10px] font-mono text-[#ffffff30] uppercase mb-1">Assists</div>
                            <div className="text-2xl font-black text-white group-hover:text-[#00f2ff] transition-colors">{player.stats?.assists || 0}</div>
                        </div>
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-yellow-500/30 transition-all">
                            <div className="text-[10px] font-mono text-[#ffffff30] uppercase mb-1">Yellow</div>
                            <div className="text-2xl font-black text-white group-hover:text-yellow-500 transition-colors">{player.stats?.yellowCards || 0}</div>
                        </div>
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-red-500/30 transition-all">
                            <div className="text-[10px] font-mono text-[#ffffff30] uppercase mb-1">Red</div>
                            <div className="text-2xl font-black text-white group-hover:text-red-500 transition-colors">{player.stats?.redCards || 0}</div>
                        </div>
                    </div>

                    {/* Match History */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <History className="text-[#00f2ff]" size={20} />
                            <h3 className="text-sm font-black text-white/40 tracking-widest uppercase italic">Deployment History</h3>
                        </div>

                        {loadingHistory ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="animate-spin text-[#00f2ff]/40" size={32} />
                                <span className="text-[10px] font-mono text-[#00f2ff]/40 uppercase animate-pulse">Accessing Battle Logs...</span>
                            </div>
                        ) : history.length > 0 ? (
                            <div className="space-y-2">
                                {history.map((m, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group/match">
                                        <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[8px] font-mono text-white/20 uppercase">{m.date?.split('-')[1]}/{m.date?.split('-')[2]}</span>
                                            <span className="text-xs font-black text-white">R-{i + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-white/30 uppercase font-mono">VS</span>
                                                <span className="text-xs font-black text-white uppercase truncate">{m.opponent}</span>
                                            </div>
                                            <div className="text-[9px] font-mono text-[#00f2ff]/60 mt-0.5">FINAL: {m.result}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {m.goals > 0 && Array(m.goals).fill(0).map((_, idx) => <Zap key={idx} size={14} className="text-[#00f2ff] fill-[#00f2ff]" />)}
                                            {m.yellowCards > 0 && <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.4)]" />}
                                            {m.redCards > 0 && <div className="w-2.5 h-3.5 bg-red-600 rounded-sm shadow-[0_0_8px_rgba(220,38,38,0.4)]" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                                <p className="text-[10px] font-mono text-white/20 uppercase italic">No combat events recorded for this unit.</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-8 w-full py-4 rounded-2xl border border-[#00f2ff]/20 bg-[#00f2ff]/5 text-[#00f2ff] text-xs font-black uppercase tracking-[0.3em] hover:bg-[#00f2ff] hover:text-[#050510] transition-all duration-300 shadow-[0_0_30px_rgba(0,242,255,0.1)]"
                    >
                        Return to Dashboard
                    </button>
                </div>

                {/* Close Button X */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all z-10"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default PlayerDetailModal;
