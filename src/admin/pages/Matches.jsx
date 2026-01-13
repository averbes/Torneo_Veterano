import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, MapPin, User, Info, CheckCircle, Clock, Users } from 'lucide-react';
import LineupModal from '../components/LineupModal';

const Matches = () => {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        teamA: '',
        teamB: '',
        date: '',
        time: '',
        field: 'Neo Stadium',
        referee: 'AutoRef',
        status: 'scheduled',
        scoreA: 0,
        scoreB: 0
    });
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [eventData, setEventData] = useState({
        type: 'goal',
        teamId: '',
        playerId: '',
        minute: ''
    });
    const [matchPlayers, setMatchPlayers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mRes, tRes] = await Promise.all([
                fetch('/api/matches'),
                fetch('/api/teams')
            ]);
            const mData = await mRes.json();
            const tData = await tRes.json();
            setMatches(mData || []);
            setTeams(tData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.teamA || !formData.teamB) {
            setFormError("Select both teams");
            return;
        }
        if (formData.teamA === formData.teamB) {
            setFormError("Teams must be different");
            return;
        }

        const payload = {
            ...formData,
            score: { teamA: parseInt(formData.scoreA), teamB: parseInt(formData.scoreB) }
        };

        const url = editingMatch ? `/api/matches/${editingMatch.id}` : '/api/matches';
        const method = editingMatch ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setIsModalOpen(false);
                setEditingMatch(null);
                fetchData();
            } else {
                setFormError(data.error || "Error saving match");
            }
        } catch (_) {
            setFormError("System link failure. Check connectivity.");
        }
    };

    const handleDeleteMatch = async (id) => {
        if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS BATTLE LOG? This will recalculate all standings.")) return;
        try {
            const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (_) {
            console.error("Delete failed");
        }
    };

    const openEditMatch = (match) => {
        setEditingMatch(match);
        setFormData({
            teamA: match.teamA,
            teamB: match.teamB,
            date: match.date,
            time: match.time,
            field: match.field,
            referee: match.referee || 'AutoRef',
            status: match.status,
            scoreA: match.score.teamA,
            scoreB: match.score.teamB
        });
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/matches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            }); if (res.ok) fetchData();
        } catch (_) { console.error("Update failed"); }
    };

    const openLineupModal = (match) => {
        setSelectedMatch(match);
        setIsLineupModalOpen(true);
    };

    const handleSaveLineup = async (rosters) => {
        try {
            const res = await fetch(`/api/matches/${selectedMatch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rosters })
            });
            if (res.ok) {
                setIsLineupModalOpen(false);
                fetchData();
            }
        } catch (_) {
            console.error("Error saving lineup");
        }
    };

    const openEventModal = async (match) => {
        setSelectedMatch(match);
        setEventData({ type: 'goal', teamId: match.teamA, playerId: '', minute: '' });

        // Fetch players logic updated for dynamic rosters
        try {
            let playersList = [];

            // If rosters exist, fetch/use those specific players
            if (match.rosters && (match.rosters.teamA?.length > 0 || match.rosters.teamB?.length > 0)) {
                const res = await fetch('/api/players');
                const allPlayers = await res.json();
                const rosterIds = [...(match.rosters.teamA || []), ...(match.rosters.teamB || [])];
                playersList = allPlayers.filter(p => rosterIds.includes(p.id));
            } else {
                // Fallback to legacy team fetch
                const [pARes, pBRes] = await Promise.all([
                    fetch(`/api/players?teamId=${match.teamA}`),
                    fetch(`/api/players?teamId=${match.teamB}`)
                ]);
                const pAData = await pARes.json();
                const pBData = await pBRes.json();
                playersList = [...pAData, ...pBData];
            }

            setMatchPlayers(playersList);
            setIsEventModalOpen(true);
        } catch (_) {
            console.error("Error fetching match players");
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        if (!eventData.playerId) {
            setFormError("Select an operative player");
            return;
        }

        try {
            const res = await fetch(`/api/matches/${selectedMatch.id}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (res.ok) {
                setIsEventModalOpen(false);
                fetchData();
            }
        } catch (_) {
            console.error("Error recording event");
        }
    };

    const getTeamName = (id) => teams.find(t => t.id === id)?.name || 'Unknown';

    if (loading && matches.length === 0) {
        return <div className="p-8 text-center text-[#00f2ff] font-mono animate-pulse">SCANNING FIXTURE GRID...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">BATTLE <span className="text-[#00f2ff]">LOGS</span></h2>
                    <p className="text-[#ffffff50] text-sm font-mono mt-1 uppercase">Match Scheduling & Results</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMatch(null);
                        setFormData({
                            teamA: teams[0]?.id || '',
                            teamB: teams[1]?.id || '',
                            date: '',
                            time: '',
                            field: 'Neo Stadium',
                            referee: 'AutoRef',
                            status: 'scheduled',
                            scoreA: 0,
                            scoreB: 0
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-[#00f2ff] text-[#050510] px-6 py-2 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                >
                    + ADD FIXTURE
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {matches.map(match => (
                    <div key={match.id} className="bg-[#ffffff02] border border-[#ffffff08] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 flex gap-2">
                            <button
                                onClick={() => openEditMatch(match)}
                                className="p-1.5 text-white/20 hover:text-[#00f2ff] hover:bg-white/5 rounded-lg transition-all"
                                title="Edit Match"
                            >
                                <CheckCircle size={14} className="opacity-0 group-hover:opacity-100" />
                            </button>
                            <button
                                onClick={() => handleDeleteMatch(match.id)}
                                className="p-1.5 text-white/20 hover:text-red-500 hover:bg-white/5 rounded-lg transition-all"
                                title="Delete Match"
                            >
                                <X size={14} className="opacity-0 group-hover:opacity-100" />
                            </button>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-bl-xl border-l border-b border-[#ffffff10] uppercase ${match.status === 'finished' ? 'bg-red-500/20 text-red-400' :
                                match.status === 'live' ? 'bg-green-500/20 text-green-400 animate-pulse' :
                                    'bg-[#00f2ff]/10 text-[#00f2ff]'
                                }`}>
                                {match.status}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex-1 text-center">
                                <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center bg-[#ffffff05] rounded-2xl border border-[#ffffff10] overflow-hidden">
                                    {teams.find(t => t.id === match.teamA)?.logo && teams.find(t => t.id === match.teamA)?.logo.startsWith('data:') ? (
                                        <img src={teams.find(t => t.id === match.teamA)?.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-4xl">{teams.find(t => t.id === match.teamA)?.logo || '🛡️'}</span>
                                    )}
                                </div>
                                <div className="text-sm font-black text-white uppercase tracking-tight truncate">{getTeamName(match.teamA)}</div>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div className="text-4xl font-black text-white font-mono flex gap-3">
                                    <span className={match.status === 'finished' ? 'text-[#00f2ff]' : ''}>{match.score.teamA}</span>
                                    <span className="text-[#ffffff20]">-</span>
                                    <span className={match.status === 'finished' ? 'text-[#00f2ff]' : ''}>{match.score.teamB}</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center">
                                <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center bg-[#ffffff05] rounded-2xl border border-[#ffffff10] overflow-hidden">
                                    {teams.find(t => t.id === match.teamB)?.logo && teams.find(t => t.id === match.teamB)?.logo.startsWith('data:') ? (
                                        <img src={teams.find(t => t.id === match.teamB)?.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-4xl">{teams.find(t => t.id === match.teamB)?.logo || '🛡️'}</span>
                                    )}
                                </div>
                                <div className="text-sm font-black text-white uppercase tracking-tight truncate">{getTeamName(match.teamB)}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#ffffff05]">
                            <div className="flex items-center gap-2 text-lg text-white font-black uppercase tracking-tighter">
                                <MapPin size={18} className="text-[#00f2ff]" /> {match.field}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#ffffff40] font-mono">
                                <Calendar size={14} /> {match.date}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                            {/* Lineup Button - Always Visible & Prominent */}
                            <button
                                onClick={() => openLineupModal(match)}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white border border-purple-400 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-[1.02]"
                            >
                                <Users size={20} /> MANAGE TACTICAL LINEUP / ROSTER
                            </button>

                            <div className="flex gap-2">
                                {match.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleStatusUpdate(match.id, 'live')}
                                        className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-black uppercase hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Play size={16} /> GO LIVE
                                    </button>
                                )}
                                {match.status === 'live' && (
                                    <button
                                        onClick={() => handleStatusUpdate(match.id, 'finished')}
                                        className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black uppercase hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> END MATCH
                                    </button>
                                )}
                                {match.status === 'finished' && (
                                    <div className="flex-1 flex gap-2">
                                        <div className="hidden md:flex flex-1 py-2 items-center justify-center gap-2 text-[10px] text-[#ffffff20] font-black uppercase bg-[#ffffff05] rounded-xl border border-transparent">
                                            <CheckCircle size={12} /> COMPLETED
                                        </div>
                                        <button
                                            onClick={() => openEditMatch(match)}
                                            className="flex-1 px-4 py-2 rounded-xl bg-[#ffffff05] border border-[#ffffff10] text-[#00f2ff] text-[10px] font-black uppercase hover:bg-[#00f2ff]/10 transition-all"
                                        >
                                            EDIT
                                        </button>
                                    </div>
                                )}

                                {(match.status === 'live' || match.status === 'finished') && (
                                    <button
                                        onClick={() => openEventModal(match)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/20 text-[#00f2ff] text-xs font-black uppercase hover:bg-[#00f2ff]/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> LOG EVENT
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* EVENT RECORDING MODAL */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000000a0] backdrop-blur-md" onClick={() => setIsEventModalOpen(false)}></div>
                    <div className="relative bg-[#0a0a1a] border border-[#ffffff15] rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 border-b border-[#ffffff10] flex items-center justify-between font-black uppercase text-white tracking-widest text-2xl bg-[#ffffff03]">
                            <span>Record Battlefield Event</span>
                            <button onClick={() => setIsEventModalOpen(false)} className="text-[#ffffff20] hover:text-[#ff0055] transition-colors"><X size={32} /></button>
                        </div>
                        <form onSubmit={handleEventSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-[#ffffff40] mb-3 font-mono uppercase">Event Type</label>
                                    <select
                                        value={eventData.type}
                                        onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
                                        className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-xl px-4 py-3 text-white outline-none focus:border-[#00f2ff] font-bold"
                                    >
                                        <option value="goal">GOAL RECORDED</option>
                                        <option value="assist">ASSIST CREDIT</option>
                                        <option value="yellow_card">YELLOW CARD (WARNING)</option>
                                        <option value="red_card">RED CARD (EXPULSION)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-[#ffffff40] mb-3 font-mono uppercase">Minute</label>
                                    <input
                                        type="number"
                                        placeholder="0-90+"
                                        value={eventData.minute}
                                        onChange={(e) => setEventData({ ...eventData, minute: e.target.value })}
                                        className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-xl px-4 py-3 text-white outline-none focus:border-[#00f2ff] font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-[#ffffff40] mb-3 font-mono uppercase">Target Operative (Player)</label>
                                <select
                                    value={eventData.playerId}
                                    onChange={(e) => {
                                        const p = matchPlayers.find(pl => pl.id === e.target.value);
                                        setEventData({ ...eventData, playerId: e.target.value, teamId: p?.teamId });
                                    }}
                                    className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-xl px-4 py-3 text-white outline-none focus:border-[#00f2ff] font-bold"
                                >
                                    <option value="">SELECT PLAYER...</option>
                                    {matchPlayers.map(p => (
                                        <option key={p.id} value={p.id}>[{getTeamName(p.teamId)}] {p.name} (#{p.number})</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="w-full py-6 bg-[#00f2ff] text-[#050510] font-black uppercase tracking-widest rounded-2xl text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                                LOG TO SYSTEM
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD MATCH MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000000a0] backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-[#0a0a1a] border border-[#ffffff15] rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 border-b border-[#ffffff10] flex items-center justify-between font-black uppercase text-white tracking-widest text-3xl bg-[#ffffff03]">
                            <span>{editingMatch ? 'EDIT BATTLE LOG' : 'ADD NEW FIXTURE'}</span>
                            <button onClick={() => { setIsModalOpen(false); setEditingMatch(null); }} className="text-[#ffffff20] hover:text-[#ff0055] transition-colors p-2 hover:bg-white/5 rounded-full"><X size={36} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Home Team</label>
                                    <select name="teamA" value={formData.teamA} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] font-black cursor-pointer">
                                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Away Team</label>
                                    <select name="teamB" value={formData.teamB} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] font-black cursor-pointer">
                                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Date</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] [color-scheme:dark] font-black" />
                                </div>
                                <div>
                                    <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Time</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] [color-scheme:dark] font-black" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Location / Field</label>
                                <input name="field" value={formData.field} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] font-black" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-[#ffffff05] p-6 rounded-2xl border border-[#ffffff10]">
                                <div>
                                    <label className="block text-sm font-black text-[#ffffff40] mb-2 font-mono uppercase">Initial Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#ffffff10] border border-[#ffffff10] rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#00f2ff]">
                                        <option value="scheduled">SCHEDULED</option>
                                        <option value="live">LIVE</option>
                                        <option value="finished">FINISHED (Manual Result)</option>
                                    </select>
                                </div>
                                {formData.status === 'finished' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff40] mb-2 font-mono uppercase">Score Home</label>
                                            <input type="number" name="scoreA" value={formData.scoreA} onChange={handleInputChange} className="w-full bg-[#ffffff10] border border-[#ffffff10] rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#00f2ff]" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff40] mb-2 font-mono uppercase">Score Away</label>
                                            <input type="number" name="scoreB" value={formData.scoreB} onChange={handleInputChange} className="w-full bg-[#ffffff10] border border-[#ffffff10] rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#00f2ff]" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {formError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono flex items-center gap-2">
                                    <Info size={14} /> {formError.toUpperCase()}
                                </div>
                            )}

                            <div className="pt-4">
                                <button type="submit" className="w-full py-8 bg-[#00f2ff] text-[#050510] font-black uppercase tracking-[0.3em] rounded-2xl text-4xl hover:scale-[1.03] active:scale-95 transition-all shadow-[0_0_60px_rgba(0,242,255,0.5)]">
                                    {editingMatch ? 'OVERWRITE LOG' : 'ESTABLISH FIXTURE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LINEUP MODAL */}
            {isLineupModalOpen && selectedMatch && (
                <LineupModal
                    match={selectedMatch}
                    onClose={() => setIsLineupModalOpen(false)}
                    onSave={handleSaveLineup}
                />
            )}
        </div>
    );
};

export default Matches;
