import React from 'react';

const StandingsTable = ({ standings, teams }) => {
    return (
        <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-[#ffffff05]">
                <h2 className="text-lg md:text-xl font-bold text-[#00f2ff] flex items-center gap-3">
                    <div className="w-1 h-5 md:h-6 bg-[#00f2ff]" />
                    League Standings
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-[#ffffff03] text-[#ffffff60] uppercase font-mono text-[10px] tracking-widest border-b border-[#ffffff05]">
                            <th className="px-6 py-4 text-center">Pos</th>
                            <th className="px-6 py-4">Team</th>
                            <th className="px-6 py-4 text-center">P</th>
                            <th className="px-6 py-4 text-center">W</th>
                            <th className="px-6 py-4 text-center">D</th>
                            <th className="px-6 py-4 text-center">L</th>
                            <th className="px-6 py-4 text-center">GF</th>
                            <th className="px-6 py-4 text-center">GA</th>
                            <th className="px-6 py-4 text-center">GD</th>
                            <th className="px-6 py-4 text-center font-bold text-white">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ffffff05]">
                        {standings.map((teamData, index) => {
                            const team = teams.find(t => t.id === teamData.teamId);

                            return (
                                <tr
                                    key={teamData.teamId}
                                    className="hover:bg-[#ffffff05] transition-colors group"
                                >
                                    <td className="px-6 py-4 text-center font-mono text-[#ffffff40] group-hover:text-white transition-colors">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-[#ffffff05] rounded-lg border border-[#ffffff10] p-1">
                                                {team?.logo && (team.logo.startsWith('data:') || team.logo.startsWith('http')) ? (
                                                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-sm">{team?.logo || '🛡️'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-[#00f2ff] transition-colors">
                                                    {team?.name || 'Unknown'}
                                                </div>
                                                <div className="text-[10px] text-[#ffffff40] uppercase tracking-wider">
                                                    {team?.nickname || 'Squad'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[#ffffff80]">{teamData.played}</td>
                                    <td className="px-6 py-4 text-center text-green-400/80">{teamData.won}</td>
                                    <td className="px-6 py-4 text-center text-[#ffffff60]">{teamData.drawn}</td>
                                    <td className="px-6 py-4 text-center text-red-400/80">{teamData.lost}</td>
                                    <td className="px-6 py-4 text-center text-[#ffffff80]">{teamData.gf}</td>
                                    <td className="px-6 py-4 text-center text-[#ffffff80]">{teamData.ga}</td>
                                    <td className="px-6 py-4 text-center text-[#ffffff60]">{teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}</td>
                                    <td className="px-6 py-4 text-center font-black text-[#00f2ff] text-base">{teamData.points}</td>
                                </tr>
                            );
                        })}

                        {standings.length === 0 && (
                            <tr>
                                <td colSpan="10" className="px-6 py-8 text-center text-[#ffffff30] font-mono uppercase text-xs">
                                    No ranking data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StandingsTable;
