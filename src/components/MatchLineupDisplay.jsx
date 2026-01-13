import React, { useState, useEffect } from 'react';
import { X, Users, Shield } from 'lucide-react';

const MatchLineupDisplay = ({ match, onClose }) => {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const [pRes, tRes] = await Promise.all([
                    fetch('/api/players'),
                    fetch('/api/teams')
                ]);
                const pData = await pRes.json();
                const tData = await tRes.json();
                setPlayers(pData);
                setTeams(tData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    const getTeamName = (id) => teams.find(t => t.id === id)?.name || 'Unknown';
    const getTeamLogo = (id) => teams.find(t => t.id === id)?.logo;

    const teamAPlayers = players.filter(p => match.rosters?.teamA?.includes(p.id));
    const teamBPlayers = players.filter(p => match.rosters?.teamB?.includes(p.id));

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#0a0a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <Users className="text-[#00f2ff]" />
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">MATCH ROSTER</h2>
                            <div className="text-xs font-mono text-white/40">OFFICIAL LINEUP RECORD</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="text-white" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Team A Column */}
                    <div>
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#00f2ff]/20">
                            <div className="w-12 h-12 bg-[#00f2ff]/10 rounded-xl flex items-center justify-center border border-[#00f2ff]/20">
                                {getTeamLogo(match.teamA) ? (
                                    <img src={getTeamLogo(match.teamA)} className="w-8 h-8 object-contain" />
                                ) : <Shield className="text-[#00f2ff]" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase leading-none">{getTeamName(match.teamA)}</h3>
                                <div className="text-xs font-mono text-[#00f2ff] mt-1">{teamAPlayers.length} PLAYERS</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {teamAPlayers.length > 0 ? (
                                teamAPlayers.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-[#00f2ff] text-black font-black flex items-center justify-center text-xs">
                                            {p.number}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{p.name}</div>
                                            <div className="text-[10px] text-white/40 font-mono uppercase">{p.position}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center border font-mono text-xs uppercase text-white/30 border-dashed border-white/10 rounded-xl">No lineup data available</div>
                            )}
                        </div>
                    </div>

                    {/* Team B Column */}
                    <div>
                        <div className="flex items-center justify-end gap-4 mb-6 pb-4 border-b border-red-500/20 text-right">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase leading-none">{getTeamName(match.teamB)}</h3>
                                <div className="text-xs font-mono text-red-500 mt-1">{teamBPlayers.length} PLAYERS</div>
                            </div>
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                {getTeamLogo(match.teamB) ? (
                                    <img src={getTeamLogo(match.teamB)} className="w-8 h-8 object-contain" />
                                ) : <Shield className="text-red-500" />}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {teamBPlayers.length > 0 ? (
                                teamBPlayers.map(p => (
                                    <div key={p.id} className="flex flex-row-reverse items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-right">
                                        <div className="w-8 h-8 rounded-full bg-red-500 text-white font-black flex items-center justify-center text-xs">
                                            {p.number}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{p.name}</div>
                                            <div className="text-[10px] text-white/40 font-mono uppercase">{p.position}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center border font-mono text-xs uppercase text-white/30 border-dashed border-white/10 rounded-xl">No lineup data available</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MatchLineupDisplay;
