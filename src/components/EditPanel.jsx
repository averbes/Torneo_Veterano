import React, { useState } from 'react';

const EditPanel = ({ team, onUpdate, onClose }) => {
    const [formData, setFormData] = useState({ ...team });

    const handleNameChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleNicknameChange = (e) => {
        setFormData({ ...formData, nickname: e.target.value });
    };

    const handleStatChange = (stat, value) => {
        setFormData({
            ...formData,
            stats: { ...formData.stats, [stat]: parseInt(value) || 0 }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-md z-[110] flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#00000080] backdrop-blur-sm lg:hidden"
                onClick={onClose}
            />

            <div className="relative flex-grow bg-[#0a0a1a] border-l border-[#ffffff10] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] p-8 flex flex-col">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-black text-white">
                        Squad <span className="text-[var(--team-color)]">Config</span>
                    </h2>
                    <button onClick={onClose} className="text-[#ffffff30] hover:text-white transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow space-y-8" style={{ '--team-color': team.color }}>

                    {/* Identity Section */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ffffff30]">Squad Identity</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase text-[#ffffff50] mb-2 font-mono">Operations Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full bg-[#ffffff05] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:border-[var(--team-color)] focus:ring-1 focus:ring-[var(--team-color)] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase text-[#ffffff50] mb-2 font-mono">Combat Nickname</label>
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={handleNicknameChange}
                                    className="w-full bg-[#ffffff05] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:border-[var(--team-color)] focus:ring-1 focus:ring-[var(--team-color)] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Records Section */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ffffff30]">Engagement History</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[8px] uppercase text-[#ffffff30] mb-2 font-mono text-center">Wins</label>
                                <input
                                    type="number"
                                    value={formData.stats.wins}
                                    onChange={(e) => handleStatChange('wins', e.target.value)}
                                    className="w-full bg-[#ffffff05] border border-[#ffffff10] rounded-xl px-2 py-3 text-white text-center focus:border-[var(--team-color)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] uppercase text-[#ffffff30] mb-2 font-mono text-center">Draws</label>
                                <input
                                    type="number"
                                    value={formData.stats.draws}
                                    onChange={(e) => handleStatChange('draws', e.target.value)}
                                    className="w-full bg-[#ffffff05] border border-[#ffffff10] rounded-xl px-2 py-3 text-white text-center focus:border-[var(--team-color)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] uppercase text-[#ffffff30] mb-2 font-mono text-center">Losses</label>
                                <input
                                    type="number"
                                    value={formData.stats.losses}
                                    onChange={(e) => handleStatChange('losses', e.target.value)}
                                    className="w-full bg-[#ffffff05] border border-[#ffffff10] rounded-xl px-2 py-3 text-white text-center focus:border-[var(--team-color)] outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="pt-8">
                        <button
                            type="submit"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--team-color)] to-[var(--team-color)]/60 text-[#050510] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(var(--team-color-rgb),0.3)]"
                        >
                            Update Telemetry
                        </button>
                    </div>
                </form>

                <div className="mt-auto pt-8 border-t border-[#ffffff05]">
                    <p className="text-[10px] font-mono text-[#ffffff20] text-center uppercase tracking-tighter">
                        Authorized admin access only // NeoLeague Secure Sync
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EditPanel;
