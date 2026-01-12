import React from 'react';

const DisciplineTable = ({ players }) => {
    // Filter players with cards and sort by red cards (desc), then yellow cards (desc)
    const cardedPlayers = players
        .filter(p => p.stats.yellowCards > 0 || p.stats.redCards > 0)
        .sort((a, b) => (b.stats.redCards - a.stats.redCards) || (b.stats.yellowCards - a.stats.yellowCards))
        .slice(0, 5); // Take top 5

    return (
        <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-2xl backdrop-blur-sm overflow-hidden h-full">
            <div className="p-6 border-b border-[#ffffff05]">
                <h2 className="text-xl font-bold text-[#ff0055] flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#ff0055]" />
                    Discipline
                </h2>
            </div>

            <div className="p-4 space-y-4">
                {cardedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-[#00000020] border border-[#ffffff05] hover:border-[#ff0055]/30 transition-all group"
                    >
                        <div className="w-8 h-8 flex items-center justify-center bg-[#ffffff10] rounded-lg text-[#ffffff60] font-mono text-sm">
                            {index + 1}
                        </div>

                        <div className="flex-1">
                            <div className="text-sm font-bold text-white group-hover:text-[#ff0055] transition-colors">
                                {player.name}
                            </div>
                            <div className="text-[10px] text-[#ffffff40] uppercase tracking-wider">
                                {player.teamName}
                            </div>
                        </div>

                        <div className="flex gap-4 text-right items-center">
                            {player.stats.redCards > 0 && (
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-6 bg-red-600 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.5)] border border-red-400/50 mb-1" />
                                    <div className="text-xs font-black text-white">{player.stats.redCards}</div>
                                </div>
                            )}
                            {player.stats.yellowCards > 0 && (
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.5)] border border-yellow-200/50 mb-1" />
                                    <div className="text-xs font-black text-white">{player.stats.yellowCards}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {cardedPlayers.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-[#ffffff80] font-mono uppercase text-xs">
                        No disciplinary records
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisciplineTable;
