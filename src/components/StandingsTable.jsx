import React from 'react';
import './StandingsFIFA.css';

const StandingsTable = ({ standings, teams }) => {
    return (
        <div className="fifa-table">
            <div className="fifa-table-header">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-black text-white italic flex items-center gap-4">
                        <div className="w-1 h-8 bg-[#FF6B35] transform skew-x-[-20deg]" />
                        LEAGUE TABLE // <span className="text-[#FF6B35]">SECTOR: ALPHA</span>
                    </h2>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-[10px] font-military text-[#ffffff30] uppercase tracking-widest">System Link: Active</div>
                        <div className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 uppercase">
                            <th className="px-6 py-4 text-center w-20">Rank</th>
                            <th className="px-6 py-4">Squad Intel</th>
                            <th className="px-4 py-4 text-center">P</th>
                            <th className="px-4 py-4 text-center">W</th>
                            <th className="px-4 py-4 text-center">D</th>
                            <th className="px-4 py-4 text-center">L</th>
                            <th className="px-4 py-4 text-center hidden sm:table-cell">GF</th>
                            <th className="px-4 py-4 text-center hidden sm:table-cell">GA</th>
                            <th className="px-4 py-4 text-center">GD</th>
                            <th className="px-6 py-4 text-center font-black text-[#FF6B35]">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {standings.map((teamData, index) => {
                            const team = teams.find(t => t.id === teamData.teamId);
                            if (!team) return null;

                            return (
                                <tr
                                    key={teamData.teamId}
                                    className="fifa-table-row group h-20"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <div className={`rank-badge ${index === 0 ? 'rank-top' : ''}`}>
                                                {index + 1}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black border border-white/10 rounded-xl p-1.5 shadow-xl transition-transform group-hover:scale-110">
                                                {team.logo && (team.logo.startsWith('data:') || team.logo.startsWith('http')) ? (
                                                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-xl">{team.logo || '🛡️'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="team-name-fifa text-lg">
                                                    {team.name}
                                                </div>
                                                <div className="text-[9px] font-military text-[#FF6B35]/50 uppercase tracking-[0.2em]">
                                                    {team.nickname || 'OPERATIVE UNIT'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/80">{teamData.played}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-green-400">{teamData.won}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/40">{teamData.drawn}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-red-400">{teamData.lost}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/40 hidden sm:table-cell">{teamData.gf}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/40 hidden sm:table-cell">{teamData.ga}</td>
                                    <td className={`px-4 py-4 text-center stats-mono ${teamData.gd > 0 ? 'text-[#00f2ff]' : teamData.gd < 0 ? 'text-red-500/60' : 'text-white/20'}`}>
                                        {teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}
                                    </td>
                                    <td className="px-6 py-4 text-center stats-mono pts-high">
                                        {teamData.points}
                                    </td>
                                </tr>
                            );
                        })}

                        {standings.length === 0 && (
                            <tr>
                                <td colSpan="10" className="px-6 py-12 text-center text-white/20 font-military uppercase text-xs tracking-[0.5em] animate-pulse">
                                    No Squad Data Synchronized
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer info tag */}
            <div className="bg-white/5 p-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00f2ff]" />
                        <span className="text-[8px] font-military text-[#ffffff20] uppercase">Advancement Zone</span>
                    </div>
                </div>
                <div className="text-[8px] font-military text-[#ffffff10] uppercase tracking-widest">
                    Tactical Ranking System // Build v4.2.0
                </div>
            </div>
        </div>
    );
};

export default StandingsTable;
