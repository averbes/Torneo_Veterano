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
        <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-2xl backdrop-blur-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-[#ffffff05] bg-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-[#7000ff]" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Battle Stats</h2>
                </div>

                {/* Category Picker */}
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                    {Object.entries(categories).map(([key, cat]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeCategory === key
                                    ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                                    : 'text-white/30 hover:text-white/60'
                                }`}
                        >
                            {cat.icon}
                            <span className="hidden sm:inline">{cat.title.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {current.data.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-[#00000020] border border-[#ffffff05] hover:border-white/10 transition-all group relative overflow-hidden"
                    >
                        {/* Rank Badge */}
                        <div className={`
                            w-6 h-6 flex items-center justify-center rounded-md font-black text-[10px] z-10
                            ${index === 0 ? 'bg-[#ffd700] text-black' :
                                index === 1 ? 'bg-[#c0c0c0] text-black' :
                                    index === 2 ? 'bg-[#cd7f32] text-black' : 'bg-white/5 text-white/40'}
                        `}>
                            {index + 1}
                        </div>

                        {/* Player Photo/Avatar */}
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                            {player.photo ? (
                                <img src={player.photo} className="w-full h-full object-cover" alt={player.name} />
                            ) : (
                                <User size={20} className="text-white/20" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate group-hover:text-[#00f2ff] transition-colors">
                                {player.name}
                            </div>
                            <div className="text-[10px] text-[#ffffff30] font-mono uppercase tracking-wider truncate">
                                {player.teamName}
                            </div>
                        </div>

                        <div className="text-right">
                            {activeCategory === 'discipline' ? (
                                <div className="flex gap-2 items-center">
                                    {player.stats.yellowCards > 0 && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-3 bg-yellow-400 rounded-sm" />
                                            <span className="text-xs font-bold text-white/60">{player.stats.yellowCards}</span>
                                        </div>
                                    )}
                                    {player.stats.redCards > 0 && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-3 bg-red-600 rounded-sm" />
                                            <span className="text-xs font-black text-red-500">{player.stats.redCards}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="text-[10px] font-mono text-white/30 uppercase mb-0.5">{current.label}</div>
                                    <div className="text-xl font-black italic italic tracking-tighter" style={{ color: current.color }}>
                                        {player.stats[current.statKey]}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {current.data.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-[#ffffff20] font-mono uppercase text-[10px] gap-2">
                        <Shield size={24} className="opacity-20" />
                        No data recorded for this sector
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopStats;

