import React from 'react';
import { Shield } from 'lucide-react';

const DisciplineTable = ({ players }) => {
    // Filter players with cards and sort by red cards (desc), then yellow cards (desc)
    const cardedPlayers = players
        .filter(p => p.stats.yellowCards > 0 || p.stats.redCards > 0)
        .sort((a, b) => (b.stats.redCards - a.stats.redCards) || (b.stats.yellowCards - a.stats.yellowCards))
        .slice(0, 5); // Take top 5

    return (
        <div className="bg-[#0a0a1a]/80 border border-[#FF6B35]/20 rounded-2xl backdrop-blur-xl overflow-hidden h-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-xl font-black text-white italic flex items-center gap-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <div className="w-1 h-6 bg-red-600 transform skew-x-[-20deg]" />
                    DISCIPLINARY // <span className="text-red-500">SECTOR</span>
                </h2>
            </div>

            <div className="p-4 space-y-4">
                {cardedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all group"
                    >
                        <div className="w-8 h-8 flex items-center justify-center bg-black border border-white/10 rounded-lg text-white/40 font-mono text-sm italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            {index + 1}
                        </div>

                        <div className="flex-1">
                            <div className="text-sm font-black text-white group-hover:text-red-500 transition-colors uppercase italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                {player.name}
                            </div>
                            <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">
                                {player.teamName || 'ELITE_UNIT'}
                            </div>
                        </div>

                        <div className="flex gap-4 text-right items-center">
                            {player.stats.redCards > 0 && (
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-6 bg-red-600 rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/50 mb-1" />
                                    <div className="text-[10px] font-black text-white font-mono">{player.stats.redCards}</div>
                                </div>
                            )}
                            {player.stats.yellowCards > 0 && (
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-[0_0_15px_rgba(250,204,21,0.5)] border border-yellow-200/50 mb-1" />
                                    <div className="text-[10px] font-black text-white font-mono">{player.stats.yellowCards}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {cardedPlayers.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-white/10 font-mono uppercase text-[10px] tracking-widest gap-2">
                        <Shield size={24} className="opacity-10" />
                        No Disciplinary Records Found
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisciplineTable;
