import React from 'react';
import './StandingsFIFA.css';

const StandingsTable = ({ standings, teams }) => {
    const downloadStandings = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(standings, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "league_standings_export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="fifa-table bg-[#0a0a1a]/80 backdrop-blur-3xl border border-[#FF6B35]/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="fifa-table-header p-6 bg-white/[0.02] border-b border-white/5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-black text-white italic flex items-center gap-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        <div className="w-1.5 h-8 bg-[#FF6B35] transform skew-x-[-20deg]" />
                        LEAGUE TABLE // <span className="text-[#FF6B35]">SECTOR: ALPHA</span>
                    </h2>
                    <button
                        onClick={downloadStandings}
                        className="hidden md:flex items-center gap-3 px-4 py-2 bg-black/40 border border-[#FF6B35]/30 rounded-xl text-[10px] font-mono text-[#FF6B35] uppercase tracking-widest hover:bg-[#FF6B35] hover:text-black transition-all duration-300 group"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] group-hover:bg-black animate-ping" />
                        EXPORT_DATA_UNIT
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 uppercase text-[10px] font-mono text-white/40">
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
                                    className="fifa-table-row group h-20 transition-colors hover:bg-[#FF6B35]/5"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <div className={`rank-badge ${index === 0 ? 'rank-top' : ''} font-Orbitron`}>
                                                {index + 1}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center bg-black border border-white/10 rounded-xl p-2 shadow-2xl transition-transform group-hover:scale-110">
                                                {team.logo && (team.logo.startsWith('data:') || team.logo.startsWith('http')) ? (
                                                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-xl">{team.logo || '🛡️'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="team-name-fifa text-lg font-black text-white italic truncate max-w-[150px]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                                    {team.name}
                                                </div>
                                                <div className="text-[9px] font-mono text-[#FF6B35]/50 uppercase tracking-[0.2em]">
                                                    {team.nickname || 'OPERATIVE UNIT'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/80 font-mono">{teamData.played}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-[#00ff88] font-mono">{teamData.won}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/40 font-mono">{teamData.drawn}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-red-500 font-mono">{teamData.lost}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/20 hidden sm:table-cell font-mono">{teamData.gf}</td>
                                    <td className="px-4 py-4 text-center stats-mono text-white/20 hidden sm:table-cell font-mono">{teamData.ga}</td>
                                    <td className={`px-4 py-4 text-center stats-mono font-mono ${teamData.gd > 0 ? 'text-[#FF6B35]' : teamData.gd < 0 ? 'text-red-500/60' : 'text-white/20'}`}>
                                        {teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}
                                    </td>
                                    <td className="px-6 py-4 text-center stats-mono pts-high font-black text-[#FF6B35] text-xl italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                        {teamData.points}
                                    </td>
                                </tr>
                            );
                        })}

                        {standings.length === 0 && (
                            <tr>
                                <td colSpan="10" className="px-6 py-12 text-center text-white/20 font-mono uppercase text-[10px] tracking-[0.5em] animate-pulse">
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
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                        <span className="text-[8px] font-mono text-[#ffffff30] uppercase">HYPER_SYNC_MODULE_ENABLED</span>
                    </div>
                </div>
                <div className="text-[8px] font-mono text-[#ffffff10] uppercase tracking-widest italic font-bold">
                    NEO_LEAGUE TACTICALranking Build_v3.0.1
                </div>
            </div>
        </div>
    );
};

export default StandingsTable;
