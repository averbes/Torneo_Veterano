import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, Eye,
    X, ChevronLeft, ChevronRight, Info,
    User, Shield, MapPin, Ruler, Weight, Footprints, Calendar, Hash, Target, Zap, Activity
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [formError, setFormError] = useState('');

    const radarData = selectedPlayer ? [
        { subject: 'PAC', A: selectedPlayer.attrPace || 50, fullMark: 100 },
        { subject: 'SHO', A: selectedPlayer.attrShooting || 50, fullMark: 100 },
        { subject: 'PAS', A: selectedPlayer.attrPassing || 50, fullMark: 100 },
        { subject: 'DRI', A: selectedPlayer.attrDribbling || 50, fullMark: 100 },
        { subject: 'DEF', A: selectedPlayer.attrDefending || 50, fullMark: 100 },
        { subject: 'PHY', A: selectedPlayer.attrPhysical || 50, fullMark: 100 },
    ] : [];

    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        birthDate: '',
        position: 'Mediocampista',
        teamId: '',
        number: '',
        nationality: '',
        height: '',
        weight: '',
        preferredFoot: 'Right',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        photo: '',
        attrPace: 50,
        attrShooting: 50,
        attrPassing: 50,
        attrDribbling: 50,
        attrDefending: 50,
        attrPhysical: 50
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [playersRes, teamsRes] = await Promise.all([
                fetch('/api/players'),
                fetch('/api/teams')
            ]);
            const playersData = await playersRes.json();
            const teamsData = await teamsRes.json();
            setPlayers(playersData);
            setTeams(teamsData);
        } catch (_) {
            console.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase())) ||
        (p.teamName && p.teamName.toLowerCase().includes(search.toLowerCase()))
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPlayers = filteredPlayers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);

    const openCreateModal = () => {
        setEditingPlayer(null);
        setFormData({
            name: '',
            nickname: '',
            birthDate: '',
            position: 'Mediocampista',
            teamId: teams.length > 0 ? teams[0].id : '',
            number: '',
            nationality: '',
            height: '',
            weight: '',
            preferredFoot: 'Right',
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            photo: '',
            attrPace: 50,
            attrShooting: 50,
            attrPassing: 50,
            attrDribbling: 50,
            attrDefending: 50,
            attrPhysical: 50
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (player) => {
        setEditingPlayer(player);
        setFormData({
            name: player.name,
            nickname: player.nickname || '',
            birthDate: player.birthDate || '',
            position: player.position || 'Mediocampista',
            teamId: player.teamId,
            number: player.number,
            nationality: player.nationality || '',
            height: player.height || '',
            weight: player.weight || '',
            preferredFoot: player.preferredFoot || 'Right',
            joinDate: player.joinDate || new Date().toISOString().split('T')[0],
            status: player.status || 'Active',
            photo: player.photo || '',
            attrPace: player.attrPace || 50,
            attrShooting: player.attrShooting || 50,
            attrPassing: player.attrPassing || 50,
            attrDribbling: player.attrDribbling || 50,
            attrDefending: player.attrDefending || 50,
            attrPhysical: player.attrPhysical || 50
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openViewModal = (player) => {
        setSelectedPlayer(player);
        setIsViewModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name) return "Full Name is required";
        if (!formData.teamId) return "Team is required";
        if (!formData.number) return "Jersey Number is required";
        if (new Date(formData.birthDate) > new Date()) return "Birth date cannot be in the future";
        if (formData.height && (formData.height < 150 || formData.height > 220)) return "Height must be between 150 and 220 cm";
        if (formData.weight && (formData.weight < 40 || formData.weight > 120)) return "Weight must be between 40 and 120 kg";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateForm();
        if (error) {
            setFormError(error);
            return;
        }

        const url = editingPlayer ? `/api/players/${editingPlayer.id}` : '/api/players';
        const method = editingPlayer ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            } else {
                const data = await res.json();
                setFormError(data.error || "An error occurred");
            }
        } catch (_) {
            setFormError("Server error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this player?")) return;

        try {
            const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            }
        } catch (_) {
            console.error("Error deleting player");
        }
    };

    if (loading && players.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-[#00f2ff]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00f2ff]"></div>
                <span className="ml-3 font-mono">LOADING PLAYERS...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">PLAYER <span className="text-[#00f2ff]">ROSTER</span></h2>
                    <p className="text-[#ffffff50] text-[10px] md:text-sm font-mono mt-1 uppercase tracking-wider">Management & Authentication Protocol</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ffffff30]" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH AGENT..."
                            value={search}
                            onChange={handleSearch}
                            className="bg-[#ffffff05] border border-[#ffffff10] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-[#00f2ff] outline-none transition-all w-full lg:w-64 font-mono"
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-[#00f2ff] hover:bg-[#00f2ff]/80 text-[#050510] font-black px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                    >
                        <Plus size={16} />
                        ENLIST PLAYER
                    </button>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-[#ffffff02] border border-[#ffffff08] rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#ffffff05] border-b border-[#ffffff08]">
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Identity</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Squad Assignment</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Combat Position</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Unit #</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-center">Stats (G/A)</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Status</th>
                                <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ffffff05]">
                            {currentPlayers.length > 0 ? (
                                currentPlayers.map(player => (
                                    <tr key={player.id} className="group hover:bg-[#ffffff03] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffffff10] to-[#ffffff05] flex items-center justify-center border border-[#ffffff10] text-[#00f2ff] font-bold overflow-hidden">
                                                    {player.photo ? (
                                                        <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        player.name ? player.name.charAt(0) : '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-[#00f2ff] transition-colors">{player.name}</div>
                                                    <div className="text-[10px] text-[#ffffff30] font-mono uppercase">{player.nickname || 'NO ALIAS'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#00f2ff]/50"></div>
                                                <span className="text-sm font-medium text-[#ffffff70] uppercase">{player.teamName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-mono text-[#ffffff40] px-2 py-1 bg-[#ffffff05] rounded border border-[#ffffff05]">{player.position}</span>
                                        </td>
                                        <td className="p-4 font-mono text-[#00f2ff]/70 font-bold">#{String(player.number).padStart(2, '0')}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-white">{player.stats?.goals || 0}</span>
                                                    <span className="text-[8px] text-[#ffffff20] uppercase font-mono">GOLS</span>
                                                </div>
                                                <div className="w-px h-4 bg-[#ffffff10]"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-white">{player.stats?.assists || 0}</span>
                                                    <span className="text-[8px] text-[#ffffff20] uppercase font-mono">ASTS</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${player.status === 'Active'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {player.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openViewModal(player)}
                                                    className="p-2 text-[#ffffff30] hover:text-[#00f2ff] hover:bg-[#00f2ff]/10 rounded-lg transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(player)}
                                                    className="p-2 text-[#ffffff30] hover:text-[#00f2ff] hover:bg-[#00f2ff]/10 rounded-lg transition-all"
                                                    title="Edit Data"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(player.id)}
                                                    className="p-2 text-[#ffffff30] hover:text-[#ff0055] hover:bg-[#ff0055]/10 rounded-lg transition-all"
                                                    title="Decommission"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-[#ffffff20] font-mono italic uppercase">
                                        No agents found matching criteria...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-[#ffffff08] flex items-center justify-between">
                        <div className="text-[10px] font-mono text-[#ffffff20]">
                            SHOWING {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPlayers.length)} OF {filteredPlayers.length} UNITS
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-[#ffffff30] hover:text-white disabled:opacity-20 transition-all border border-[#ffffff08] rounded-lg"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 font-mono text-xs rounded-lg transition-all border ${currentPage === i + 1
                                        ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]'
                                        : 'border-[#ffffff08] text-[#ffffff30] hover:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 text-[#ffffff30] hover:text-white disabled:opacity-20 transition-all border border-[#ffffff08] rounded-lg"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000000a0] backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-[#0a0a1a] border border-[#ffffff15] rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 md:px-10 md:py-8 border-b border-[#ffffff10] flex items-center justify-between bg-[#ffffff03] shrink-0">
                            <h3 className="text-xl md:text-4xl font-black text-white uppercase tracking-tighter">
                                {editingPlayer ? 'RECONFIGURE' : 'ENLIST'} PLAYER <span className="text-[#00f2ff]">DEVICES</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#ffffff40] hover:text-[#ff0055] transition-colors p-2 hover:bg-white/5 rounded-full"><X size={24} className="md:hidden" /><X size={32} className="hidden md:block" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 md:p-10 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-mono text-[#00f2ff] uppercase tracking-widest mb-4">GENERAL IDENTITY</h4>

                                    <div>
                                        <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">FULL NAME *</label>
                                        <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-bold" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">ALIAS / NICKNAME</label>
                                        <input name="nickname" value={formData.nickname} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-bold" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">BIRTH DATE *</label>
                                        <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all [color-scheme:dark] font-bold" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">NATIONALITY</label>
                                        <input name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-bold" />
                                    </div>
                                </div>

                                {/* Deployment Info */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-mono text-[#00f2ff] uppercase tracking-widest mb-4">TACTICAL PROFILE</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">POSITION</label>
                                            <select name="position" value={formData.position} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] cursor-pointer font-bold">
                                                <option value="Arquero">Arquero</option>
                                                <option value="Defensa">Defensa</option>
                                                <option value="Mediocampista">Mediocampista</option>
                                                <option value="Delantero">Delantero</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">JERSEY # *</label>
                                            <input required type="number" name="number" value={formData.number} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-bold" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">ASSIGNED TEAM *</label>
                                        <select name="teamId" value={formData.teamId} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] cursor-pointer font-bold">
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">HEIGHT (CM)</label>
                                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">WEIGHT (KG)</label>
                                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-bold" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">DOMINANT FOOT</label>
                                            <select name="preferredFoot" value={formData.preferredFoot} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] cursor-pointer font-bold">
                                                <option value="Left">Left</option>
                                                <option value="Right">Right</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">UNIT STATUS</label>
                                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-6 py-5 text-2xl text-white outline-none focus:border-[#00f2ff] cursor-pointer font-bold">
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest tracking-tighter">PHOTO (BASE64/URL)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (file.size > 5 * 1024 * 1024) {
                                                                setFormError("IMAGE TOO LARGE (MAX 5MB)");
                                                                return;
                                                            }

                                                            const formDataUpload = new FormData();
                                                            formDataUpload.append('image', file);

                                                            try {
                                                                const res = await fetch('/api/upload/image', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
                                                                    },
                                                                    body: formDataUpload
                                                                });

                                                                const data = await res.json();

                                                                if (res.ok && data.url) {
                                                                    setFormData(prev => ({ ...prev, photo: data.url }));
                                                                    setFormError('');
                                                                } else {
                                                                    setFormError(data.error || "PHOTO UPLOAD FAILED");
                                                                }
                                                            } catch (err) {
                                                                console.error("Upload failed", err);
                                                                setFormError("CONNECTION ERROR: UPLOAD INTERRUPTED");
                                                            }
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id="photo-upload"
                                                />
                                                <label
                                                    htmlFor="photo-upload"
                                                    className="flex-1 bg-[#ffffff05] border-2 border-[#ffffff10] border-dashed rounded-2xl px-6 py-5 text-sm text-[#ffffff50] font-mono cursor-pointer hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all flex items-center justify-center gap-2"
                                                >
                                                    {formData.photo ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                                                </label>
                                                {formData.photo && (
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#ffffff10]">
                                                        <img src={formData.photo} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attributes Section */}
                            <div className="mt-8 pt-8 border-t border-[#ffffff10]">
                                <h4 className="text-lg font-mono text-[#00f2ff] uppercase tracking-widest mb-6 text-center">BATTLE PROTOCOL (ATTRIBUTES)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { label: 'RITMO (PAC)', key: 'attrPace', color: '#00f2ff' },
                                        { label: 'TIRO (SHO)', key: 'attrShooting', color: '#ff0055' },
                                        { label: 'PASE (PAS)', key: 'attrPassing', color: '#00ff88' },
                                        { label: 'REGATE (DRI)', key: 'attrDribbling', color: '#ffd700' },
                                        { label: 'DEFENSA (DEF)', key: 'attrDefending', color: '#7000ff' },
                                        { label: 'FÍSICO (PHY)', key: 'attrPhysical', color: '#ff8800' }
                                    ].map((attr) => (
                                        <div key={attr.key} className="space-y-4 bg-[#ffffff03] p-6 rounded-2xl border border-[#ffffff05]">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-black text-[#ffffff40] font-mono tracking-widest">{attr.label}</label>
                                                <span className="text-2xl font-black italic font-mono" style={{ color: attr.color }}>{formData[attr.key]}</span>
                                            </div>
                                            <input
                                                type="range"
                                                name={attr.key}
                                                min="0"
                                                max="99"
                                                value={formData[attr.key]}
                                                onChange={handleInputChange}
                                                className="w-full h-2 bg-[#ffffff10] rounded-lg appearance-none cursor-pointer accent-[#00f2ff]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formError && (
                                <div className="mt-6 flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-mono">
                                    <Info size={14} /> {formError.toUpperCase()}
                                </div>
                            )}

                            <div className="mt-8 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-6 rounded-xl border border-[#ffffff10] text-[#ffffff50] hover:text-white hover:bg-[#ffffff05] transition-all font-mono text-sm uppercase">Cancel</button>
                                <button type="submit" className="flex-[2] py-6 px-10 rounded-2xl bg-gradient-to-r from-[#00f2ff] to-[#00f2ff]/60 text-[#050510] font-black uppercase tracking-[0.2em] text-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-[0_0_40px_rgba(0,242,255,0.4)]">
                                    {editingPlayer ? 'SYNC UPDATES' : 'AUTHORIZE DEPLOYMENT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW MODAL (PROFILE) */}
            {isViewModalOpen && selectedPlayer && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000000a0] backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
                    <div className="relative bg-[#0a0a1a] border border-[#ffffff10] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-300">
                        {/* Profile Header */}
                        <div className="h-32 bg-[#00f2ff]/10 relative">
                            <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-2xl bg-[#0a0a1a] border border-[#00f2ff]/30 p-1">
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#00f2ff]/20 to-[#00f2ff]/5 flex items-center justify-center text-2xl font-black text-[#00f2ff] overflow-hidden">
                                    {selectedPlayer.photo ? (
                                        <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        selectedPlayer.name ? selectedPlayer.name.charAt(0) : '?'
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-[#ffffff60] hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="pt-12 px-8 pb-8 space-y-6">
                            <div>
                                <h3 className="text-2xl font-black text-white leading-tight">{selectedPlayer.name}</h3>
                                <p className="text-[#00f2ff] font-mono text-xs uppercase tracking-widest">{selectedPlayer.nickname || 'NO FIELD ALIAS'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#ffffff30] uppercase"><Shield size={12} /> Squad</div>
                                    <div className="text-white text-sm font-bold uppercase">{selectedPlayer.teamName}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#ffffff30] uppercase"><Hash size={12} /> Unit Num</div>
                                    <div className="text-white text-sm font-bold">#{selectedPlayer.number}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#ffffff30] uppercase"><MapPin size={12} /> Nationality</div>
                                    <div className="text-white text-sm font-bold">{selectedPlayer.nationality || 'REDACTED'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#ffffff30] uppercase"><Calendar size={12} /> Deployment</div>
                                    <div className="text-white text-sm font-bold">{selectedPlayer.joinDate}</div>
                                </div>
                            </div>

                            <div className="bg-[#ffffff03] border border-[#ffffff05] rounded-xl p-4 grid grid-cols-3 gap-4">
                                <div className="text-center space-y-1">
                                    <div className="text-[8px] font-mono text-[#ffffff20] uppercase">Height</div>
                                    <div className="text-white font-black">{selectedPlayer.height || '--'} cm</div>
                                </div>
                                <div className="text-center space-y-1 border-x border-[#ffffff05]">
                                    <div className="text-[8px] font-mono text-[#ffffff20] uppercase">Weight</div>
                                    <div className="text-white font-black">{selectedPlayer.weight || '--'} kg</div>
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-[8px] font-mono text-[#ffffff20] uppercase">Drive Foot</div>
                                    <div className="text-[#00f2ff] font-black">{selectedPlayer.preferredFoot}</div>
                                </div>
                            </div>

                            {/* FIFA Style Radar Chart */}
                            <div className="bg-[#00000030] border border-[#ffffff05] rounded-2xl p-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff05] to-transparent opacity-50"></div>
                                <h4 className="text-[10px] font-mono text-[#ffffff40] uppercase tracking-[0.3em] mb-4 text-center">QUANTUM ABILITY MESH</h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#ffffff10" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 'bold' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name={selectedPlayer.name}
                                                dataKey="A"
                                                stroke="#00f2ff"
                                                fill="#00f2ff"
                                                fillOpacity={0.5}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {radarData.map(d => (
                                        <div key={d.subject} className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-[8px] font-mono text-white/30">{d.subject}</span>
                                            <span className="text-sm font-black text-[#00f2ff]">{d.A}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#00f2ff]/05 border border-[#00f2ff]/10 rounded-2xl p-6">
                                <h4 className="text-[10px] font-mono text-[#00f2ff] uppercase tracking-[0.3em] mb-4 text-center">BATTLE PERFORMANCE STATS</h4>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-[#ffffff03] p-3 rounded-xl border border-[#ffffff05] text-center">
                                        <div className="text-2xl font-black text-white">{selectedPlayer.stats?.goals || 0}</div>
                                        <div className="text-[8px] text-[#ffffff30] font-mono uppercase">Goals</div>
                                    </div>
                                    <div className="bg-[#ffffff03] p-3 rounded-xl border border-[#ffffff05] text-center">
                                        <div className="text-2xl font-black text-white">{selectedPlayer.stats?.assists || 0}</div>
                                        <div className="text-[8px] text-[#ffffff30] font-mono uppercase">Assists</div>
                                    </div>
                                    <div className="bg-[#ffffff03] p-3 rounded-xl border border-[#ffffff05] text-center">
                                        <div className="text-2xl font-black text-amber-400">{selectedPlayer.stats?.yellowCards || 0}</div>
                                        <div className="text-[8px] text-[#ffffff30] font-mono uppercase">YC</div>
                                    </div>
                                    <div className="bg-[#ffffff03] p-3 rounded-xl border border-[#ffffff05] text-center">
                                        <div className="text-2xl font-black text-red-500">{selectedPlayer.stats?.redCards || 0}</div>
                                        <div className="text-[8px] text-[#ffffff30] font-mono uppercase">RC</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#00f2ff]/10 text-center">
                                    <div className="text-xs font-bold text-[#00f2ff] uppercase tracking-widest">{selectedPlayer.stats?.minutes || 0} MINUTES IN COMBAT</div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        openEditModal(selectedPlayer);
                                    }}
                                    className="flex-1 py-3 px-6 rounded-xl bg-[#ffffff05] border border-[#ffffff10] text-white hover:bg-[#ffffff08] transition-all font-mono text-sm uppercase flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} /> Edit Data
                                </button>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="flex-1 py-3 px-6 rounded-xl bg-transparent text-[#ffffff30] hover:text-white transition-all font-mono text-sm uppercase"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Players;
