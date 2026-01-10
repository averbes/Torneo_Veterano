import React from 'react';

const TeamCard = ({ team, onManage, onEdit }) => {
    return (
        <div
            onClick={() => onManage(team)}
            className="relative group p-6 rounded-2xl border border-[#ffffff10] bg-[#ffffff05] backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-[var(--team-color)] hover:shadow-[0_0_30px_rgba(var(--team-color-rgb),0.2)] cursor-pointer"
            style={{
                '--team-color': team.color,
                '--team-color-rgb': team.color === '#00f2ff' ? '0, 242, 255' : '112, 0, 255'
            }}
        >
            {/* Decorative Gradient Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--team-color)] opacity-[0.03] blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-[0.1] transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-28 h-28 flex items-center justify-center bg-[#ffffff05] rounded-3xl border border-[#ffffff10] overflow-hidden shadow-2xl">
                            {team.logo && team.logo.startsWith('data:') ? (
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <span className="text-6xl filter drop-shadow-[0_0_15px_var(--team-color)]">{team.logo || '🛡️'}</span>
                            )}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(team); }}
                            className="p-3 rounded-xl bg-[#ffffff05] border border-[#ffffff10] text-[#ffffff30] hover:text-[var(--team-color)] hover:border-[var(--team-color)] transition-all hover:scale-110 active:scale-90"
                            title="Edit Team Config"
                        >
                            <span className="text-xl">⚙️</span>
                        </button>
                    </div>
                    <div className="text-right">
                        <div className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#ffffff40]">Win Rate</div>
                        <div className="text-2xl font-black text-white">84%</div>
                    </div>
                </div>

                <h3 className="text-5xl font-black text-white mb-2 group-hover:text-[var(--team-color)] transition-colors duration-300 uppercase tracking-tighter">
                    {team.name}
                </h3>
                <p className="text-sm font-mono uppercase tracking-[0.4em] text-[#ffffff50] mb-8">
                    {team.nickname || 'Elite Squad'}
                </p>

                <div className="grid grid-cols-3 gap-6 mb-10 border-t border-[#ffffff05] pt-8">
                    <div className="text-center group/stat">
                        <div className="text-xs font-mono text-[#ffffff30] uppercase mb-2 tracking-[0.2em] group-hover/stat:text-[#00f2ff] transition-colors">W</div>
                        <div className="text-3xl font-black text-white">{team.stats.wins}</div>
                    </div>
                    <div className="text-center group/stat">
                        <div className="text-xs font-mono text-[#ffffff30] uppercase mb-2 tracking-[0.2em] group-hover/stat:text-[#ffffff60] transition-colors">D</div>
                        <div className="text-3xl font-black text-white">{team.stats.draws}</div>
                    </div>
                    <div className="text-center group/stat">
                        <div className="text-xs font-mono text-[#ffffff30] uppercase mb-2 tracking-[0.2em] group-hover/stat:text-red-500 transition-colors">L</div>
                        <div className="text-3xl font-black text-white">{team.stats.losses}</div>
                    </div>
                </div>

                <button
                    onClick={() => onManage(team)}
                    className="w-full py-3 rounded-lg border border-[var(--team-color)]/30 bg-[var(--team-color)]/5 text-[var(--team-color)] text-xs font-black uppercase tracking-widest hover:bg-[var(--team-color)] hover:text-[#050510] transition-all duration-300 transform active:scale-95"
                >
                    Manage Roster
                </button>
            </div>

            {/* Scanner Line Effect */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--team-color)] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan" />
        </div>
    );
};

export default TeamCard;
