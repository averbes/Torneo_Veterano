import React from 'react';

const TeamCard = ({ team, onManage }) => {
    // Calculate win rate dynamically
    const winRate = team.stats.played > 0
        ? Math.round((team.stats.wins / team.stats.played) * 100)
        : 0;

    return (
        <div
            onClick={() => onManage(team)}
            className="relative group p-6 rounded-2xl border border-[#FF6B35]/20 bg-[#0a0a1a]/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-[#FF6B35]/60 hover:shadow-[0_0_40px_rgba(255,107,53,0.2)] cursor-pointer"
        >
            {/* HUD Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35] opacity-[0.05] blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-[0.15] transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-full border-t border-l border-white/5 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 flex items-center justify-center bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-transform group-hover:scale-110">
                            {team.logo && (team.logo.startsWith('data:') || team.logo.startsWith('http')) ? (
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <span className="text-5xl filter drop-shadow-[0_0_15px_#FF6B35]">{team.logo || '🛡️'}</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF6B35]/60">SYST_WIN_RATE</div>
                        <div className="text-3xl font-black text-white italic font-serif" style={{ fontFamily: 'Orbitron, sans-serif' }}>{winRate}<span className="text-[#FF6B35] text-sm">%</span></div>
                    </div>
                </div>

                <h3 className="text-4xl font-black text-white mb-1 group-hover:text-[#FF6B35] transition-colors duration-300 uppercase italic tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {team.name}
                </h3>
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-3 bg-[#FF6B35] transform skew-x-[-20deg]" />
                    <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30">
                        {team.nickname || 'ELITE_OPERATIVE_UNIT'}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8 border-y border-white/5 py-6 bg-white/[0.02]">
                    <div className="text-center">
                        <div className="text-[9px] font-mono text-white/20 uppercase mb-1 tracking-widest">WINS</div>
                        <div className="text-2xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{team.stats.wins}</div>
                    </div>
                    <div className="text-center border-x border-white/5">
                        <div className="text-[9px] font-mono text-white/20 uppercase mb-1 tracking-widest">DRAW</div>
                        <div className="text-2xl font-black text-white/60" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{team.stats.draws}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] font-mono text-white/20 uppercase mb-1 tracking-widest">LOSS</div>
                        <div className="text-2xl font-black text-red-500/80" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{team.stats.losses}</div>
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onManage(team); }}
                    className="w-full py-4 rounded-xl border border-[#FF6B35]/40 bg-[#FF6B35]/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#FF6B35] hover:text-[#050510] transition-all duration-300 shadow-[0_0_20px_rgba(255,107,53,0.1)] hover:shadow-[0_0_30px_rgba(255,107,53,0.3)]"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                    TACTICAL ROSTER
                </button>
            </div>

            {/* Scanner Line Effect */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent opacity-0 group-hover:opacity-100 group-hover:transition-all animate-scan" />
        </div>
    );
};

export default TeamCard;
