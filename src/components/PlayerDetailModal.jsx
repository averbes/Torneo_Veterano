import React from 'react';

const PlayerDetailModal = ({ player, onClose }) => {
    if (!player) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#050510]/80 backdrop-blur-md">
            {/* Backdrop for closing */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-[#0a0a1a] border border-[#00f2ff]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.2)] animate-in fade-in zoom-in duration-300">

                {/* Silhouette / Photo Placeholder */}
                <div className="h-64 bg-gradient-to-b from-[#0a0a1a] to-[#00f2ff]/10 flex items-center justify-center relative overflow-hidden">
                    <div className="w-48 h-48 bg-[#ffffff10] rounded-full blur-3xl absolute -bottom-10" />
                    <svg className="w-40 h-40 text-white/5 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>

                    {/* Large Centered Number */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[120px] font-black text-white/5 font-mono select-none -mb-10">
                            {player.number}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center relative">
                    {/* Glitch Nickname */}
                    <h2 className="text-4xl font-black italic tracking-tighter mb-1 relative inline-block">
                        <span className="text-[#00f2ff] drop-shadow-[0_0_8px_rgba(0,242,255,0.8)] animate-glitch-1">
                            {player.nickname}
                        </span>
                        <span className="absolute inset-0 text-[#ff0055] opacity-50 animate-glitch-2 pointer-events-none">
                            {player.nickname}
                        </span>
                    </h2>

                    <div className="flex flex-col items-center mt-4">
                        <span className="text-xl font-bold text-white tracking-tight">
                            {player.name}
                        </span>
                        <span className="text-xs font-mono uppercase tracking-[0.4em] text-[#00f2ff]/60 mt-1">
                            {player.position} // UNIT_{player.id}
                        </span>
                    </div>

                    {/* Stats Preview */}
                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#ffffff05] pt-6">
                        {Object.entries(player.stats || {}).map(([key, val]) => (
                            <div key={key}>
                                <div className="text-[10px] font-mono uppercase text-[#ffffff30]">{key}</div>
                                <div className="text-lg font-bold text-white">{val}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-10 w-full py-3 rounded-xl border border-[#ffffff10] bg-[#ffffff05] text-[#ffffff50] text-xs font-black uppercase tracking-widest hover:text-white hover:bg-[#ffffff10] transition-all duration-300"
                    >
                        Terminal Return
                    </button>
                </div>

                {/* Decorative Scanner Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent animate-scan-modal" />
            </div>
        </div>
    );
};

export default PlayerDetailModal;
