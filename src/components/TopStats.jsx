import React from 'react';

const TopStats = ({ players }) => {
    // Sort players by goals (desc), then assists (desc)
    const topScorers = [...players]
        .sort((a, b) => (b.stats.goals - a.stats.goals) || (b.stats.assists - a.stats.assists))
        .slice(0, 5); // Take top 5

    return (
        <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-2xl backdrop-blur-sm overflow-hidden h-full">
            <div className="p-6 border-b border-[#ffffff05]">
                <h2 className="text-xl font-bold text-[#7000ff] flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#7000ff]" />
                    Top Performers
                </h2>
            </div>

            <div className="p-4 space-y-4">
                {topScorers.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-[#00000020] border border-[#ffffff05] hover:border-[#7000ff]/30 transition-all group"
                    >
                        <div className={`
              w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm
              ${index === 0 ? 'bg-[#ffd700] text-black shadow-[0_0_15px_#ffd70040]' :
                                index === 1 ? 'bg-[#c0c0c0] text-black' :
                                    index === 2 ? 'bg-[#cd7f32] text-black' : 'bg-[#ffffff10] text-[#ffffff60]'}
            `}>
                            {index + 1}
                        </div>

                        <div className="flex-1">
                            <div className="text-sm font-bold text-white group-hover:text-[#7000ff] transition-colors">
                                {player.name}
                            </div>
                            <div className="text-[10px] text-[#ffffff40] uppercase tracking-wider">
                                {player.teamName}
                            </div>
                        </div>

                        <div className="flex gap-4 text-right">
                            <div>
                                <div className="text-xs font-mono text-[#ffffff60] uppercase tracking-wider mb-0.5">G</div>
                                <div className="text-lg font-black text-[#00f2ff]">{player.stats.goals}</div>
                            </div>
                            <div>
                                <div className="text-xs font-mono text-[#ffffff60] uppercase tracking-wider mb-0.5">A</div>
                                <div className="text-lg font-bold text-[#ffffff]">{player.stats.assists}</div>
                            </div>
                        </div>
                    </div>
                ))}

                {topScorers.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-[#ffffff30] font-mono uppercase text-xs">
                        No player stats available
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopStats;
