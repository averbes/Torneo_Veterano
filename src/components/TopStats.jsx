import React, { useState } from 'react';
import { Trophy, Target, Shield, User } from 'lucide-react';

const TopStats = ({ players }) => {
    const [activeCategory, setActiveCategory] = useState('goals');

    // Categorized rankings
    const categories = {
        goals: {
            title: 'Top Scorers',
            icon: <Trophy size={18} className="text-[#ffd700]" />,
            label: 'Goals',
            statKey: 'goals',
            color: '#ffd700',
            data: [...players].sort((a, b) => (b.stats.goals - a.stats.goals) || (b.stats.assists - a.stats.assists)).slice(0, 5)
        },
        assists: {
            title: 'Assists Leaders',
            icon: <Target size={18} className="text-[#00f2ff]" />,
            label: 'Assists',
            statKey: 'assists',
            color: '#00f2ff',
            data: [...players].sort((a, b) => (b.stats.assists - a.stats.assists) || (b.stats.goals - a.stats.goals)).slice(0, 5)
        },
        discipline: {
            title: 'Discipline',
            icon: <Shield size={18} className="text-red-500" />,
            label: 'Cards',
            statKey: 'cards',
            color: '#ef4444',
            data: [...players]
                .map(p => ({ ...p, totalCards: (p.stats.yellowCards || 0) + (p.stats.redCards || 0) }))
                .sort((a, b) => (b.totalCards - a.totalCards))
                .slice(0, 5)
        }
    };

    const current = categories[activeCategory];

    return (
        <div className="bg-[#0a0a1a]/80 border border-[#FF6B35]/20 rounded-2xl backdrop-blur-xl overflow-hidden h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-[#FF6B35] transform skew-x-[-20deg]" />
                        <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>Battle Stats</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
                        <span className="text-[8px] font-mono text-[#FF6B35]/40 uppercase tracking-widest">Live Telemetry</span>
                    </div>
                </div>

                {/* Category Picker */}
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                    {Object.entries(categories).map(([key, cat]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeCategory === key
                                ? 'bg-[#FF6B35] text-black shadow-[0_0_20px_rgba(255,107,53,0.3)]'
                                : 'text-white/30 hover:text-white/60'
                                }`}
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                            {activeCategory === key ? React.cloneElement(cat.icon, { className: 'text-black' }) : cat.icon}
                            <span className="hidden sm:inline">{cat.title.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {current.data.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#FF6B35]/30 hover:bg-[#FF6B35]/5 transition-all group relative overflow-hidden"
                    >
                        {/* Rank Badge */}
                        <div className={`
                            w-7 h-7 flex items-center justify-center rounded-lg font-black text-[12px] z-10 italic
                            ${index === 0 ? 'bg-[#FF6B35] text-black shadow-[0_0_15px_rgba(255,107,53,0.4)]' :
                                index === 1 ? 'bg-white/20 text-white' :
                                    index === 2 ? 'bg-white/10 text-white/60' : 'bg-white/5 text-white/30'}
                        `} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            {index + 1}
                        </div>

                        {/* Player Photo/Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
                            {player.photo ? (
                                <img src={player.photo} className="w-full h-full object-cover" alt={player.name} />
                            ) : (
                                <User size={20} className="text-white/20" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-black text-white truncate group-hover:text-[#FF6B35] transition-colors uppercase italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                {player.name}
                            </div>
                            <div className="text-[9px] text-[#ffffff30] font-mono uppercase tracking-widest truncate">
                                {player.teamName || 'ELITE_UNIT'}
                            </div>
                        </div>

                        <div className="text-right">
                            {activeCategory === 'discipline' ? (
                                <div className="flex gap-2 items-center justify-end">
                                    {player.stats.yellowCards > 0 && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-3 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.3)]" />
                                            <span className="text-xs font-bold text-white/60 font-mono">{player.stats.yellowCards}</span>
                                        </div>
                                    )}
                                    {player.stats.redCards > 0 && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-3 bg-red-600 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.3)]" />
                                            <span className="text-xs font-black text-red-500 font-mono">{player.stats.redCards}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="text-[8px] font-mono text-white/20 uppercase mb-0.5 tracking-tighter">DATA_VAL</div>
                                    <div className="text-xl font-black italic tracking-tighter" style={{ color: '#FF6B35', fontFamily: 'Orbitron, sans-serif' }}>
                                        {player.stats[current.statKey]}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Side Accent */}
                        <div className="absolute left-0 top-0 h-full w-[2px] bg-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}

                {current.data.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-[#ffffff10] font-mono uppercase text-[9px] gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center animate-spin-slow">
                            <Shield size={16} />
                        </div>
                        Scanning Battlefield Data...
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopStats;

