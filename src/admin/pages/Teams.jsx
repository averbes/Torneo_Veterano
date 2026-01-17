import React, { useState, useEffect } from 'react';
import { Upload, Edit, Trash2, Plus, X, Info } from 'lucide-react';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        franchiseId: '',
        logo: '',
        status: 'active'
    });
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/teams');
            const data = await res.json();
            // Map snake_case from DB to camelCase for frontend
            const mappedTeams = (data || []).map(t => ({
                ...t,
                franchiseId: t.franchise_id,
                logo: t.logo || '🛡️'
            }));
            setTeams(mappedTeams);
        } catch (_) {
            console.error("Error fetching teams");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingTeam(null);
        setFormData({ name: '', franchiseId: '', logo: '', status: 'active' });
        setLogoPreview(null);
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (team) => {
        setEditingTeam(team);
        setFormData({
            name: team.name,
            franchiseId: team.franchiseId || team.franchise_id || '',
            logo: team.logo || '',
            status: team.status || 'active'
        });
        setLogoPreview(team.logo || null);
        setFormError('');
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
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
                if (data.url) {
                    setLogoPreview(data.url);
                    setFormData(prev => ({ ...prev, logo: data.url }));
                }
            } catch (err) {
                console.error("Upload failed", err);
                setFormError("Logo upload failed");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            setFormError("Name is required");
            return;
        }

        const url = editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams';
        const method = editingTeam ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchTeams();
            } else {
                const data = await res.json();
                setFormError(data.error || "Error saving team");
            }
        } catch (_) {
            setFormError("Server error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will also remove all players in this team.")) return;

        try {
            const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
            if (res.ok) fetchTeams();
        } catch (_) {
            console.error("Delete failed");
        }
    };

    const handleCSVUpload = async (teamId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('roster', file);
            formData.append('teamId', teamId);

            try {
                const res = await fetch('/api/teams/upload', {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    alert("Roster uploaded successfully!");
                } else {
                    alert("Error uploading roster.");
                }
            } catch (_) {
                console.error("Upload failed");
            }
        };
        input.click();
    };

    if (loading && teams.length === 0) {
        return <div className="p-8 text-center text-[#00f2ff] font-mono animate-pulse">SYNCING TEAM TELEMETRY...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">SQUAD <span className="text-[#00f2ff]">CONTROL</span></h2>
                    <p className="text-[#ffffff50] text-[10px] md:text-sm font-mono mt-1 uppercase">Franchise Management & Rosters</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto bg-[#00f2ff] text-[#050510] px-6 py-2.5 rounded-xl font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                >
                    + NEW SQUAD
                </button>
            </div>

            <div className="bg-[#ffffff02] border border-[#ffffff08] rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#ffffff05] border-b border-[#ffffff08]">
                        <tr>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Identity</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Registry ID</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase">Status</th>
                            <th className="p-4 text-[10px] font-mono text-[#ffffff30] uppercase text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ffffff05]">
                        {teams.map(team => (
                            <tr key={team.id} className="group hover:bg-[#ffffff03] transition-colors">
                                <td className="p-4 flex items-center gap-6">
                                    <div className="w-16 h-16 flex items-center justify-center bg-[#ffffff05] rounded-xl border border-[#ffffff10] overflow-hidden">
                                        {team.logo && (team.logo.startsWith('data:') || team.logo.startsWith('http')) ? (
                                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-3xl">{team.logo || '🛡️'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-black text-white group-hover:text-[#00f2ff] transition-colors text-2xl uppercase tracking-tight">{team.name}</div>
                                        <div className="text-[12px] text-[#ffffff20] font-mono uppercase tracking-widest">{team.id}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-[#ffffff60] font-mono text-sm tracking-tighter">{team.franchiseId || 'FREE_AGENT'}</td>
                                <td className="p-4">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${team.status === 'active'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        } uppercase`}>
                                        {team.status || 'active'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleCSVUpload(team.id)}
                                            className="p-2 text-[#ffffff30] hover:text-[#00f2ff] hover:bg-[#00f2ff]/10 rounded-lg transition-all"
                                            title="Upload Roster CSV"
                                        >
                                            <Upload size={18} />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(team)}
                                            className="p-2 text-[#ffffff30] hover:text-[#00f2ff] hover:bg-[#00f2ff]/10 rounded-lg transition-all"
                                            title="Edit Squad"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(team.id)}
                                            className="p-2 text-[#ffffff30] hover:text-[#ff0055] hover:bg-[#ff0055]/10 rounded-lg transition-all"
                                            title="Disband Squad"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* TEAM MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000000a0] backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-[#0a0a1a] border border-[#ffffff15] rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 md:px-10 md:py-8 border-b border-[#ffffff10] flex items-center justify-between font-black uppercase text-white tracking-widest text-xl md:text-3xl bg-[#ffffff03] shrink-0">
                            <span>{editingTeam ? 'COMMAND' : 'INITIALIZE'} SQUAD</span>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#ffffff20] hover:text-[#ff0055] transition-colors p-2 hover:bg-white/5 rounded-full"><X size={24} className="md:hidden" /><X size={36} className="hidden md:block" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 md:p-10 space-y-4 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Squad Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-black" />
                            </div>
                            <div>
                                <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Franchise ID</label>
                                <input name="franchiseId" value={formData.franchiseId} onChange={handleInputChange} placeholder="E.G. ALPHA-RED" className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] focus:bg-[#ffffff08] transition-all font-mono font-bold" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Team Identity Logo</label>
                                    <div className="relative group">
                                        <div className="w-full h-56 bg-[#ffffff05] border-2 border-dashed border-[#ffffff15] rounded-3xl flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#00f2ff]/30">
                                            {logoPreview && (logoPreview.startsWith('http') || logoPreview.startsWith('data:')) ? (
                                                <img src={logoPreview} className="w-full h-full object-contain p-4" alt="Preview" />
                                            ) : logoPreview ? (
                                                <div className="text-8xl flex items-center justify-center">{logoPreview}</div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-[#ffffff20]">
                                                    <Upload size={48} />
                                                    <span className="text-sm font-bold font-mono">UPLOAD LOGO (JPG/PNG/WEBP)</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    {logoPreview && (
                                        <button
                                            type="button"
                                            onClick={() => { setLogoPreview(null); setFormData(prev => ({ ...prev, logo: '' })); }}
                                            className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
                                        >
                                            [ REMOVE SYSTEM ICON ]
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <label className="block text-lg font-black text-[#ffffff60] mb-3 font-mono uppercase tracking-widest">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#ffffff05] border-2 border-[#ffffff10] rounded-2xl px-8 py-6 text-3xl text-white outline-none focus:border-[#00f2ff] transition-all appearance-none cursor-pointer font-black">
                                        <option value="active">ACTIVE</option>
                                        <option value="inactive">INACTIVE</option>
                                    </select>
                                    <div className="p-4 bg-[#00f2ff]/05 border border-[#00f2ff]/10 rounded-2xl">
                                        <p className="text-[10px] text-[#00f2ff] font-mono uppercase leading-relaxed">
                                            Note: Logo is processed locally as Base64. Ensure resolution is optimized for holographic rendering.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {formError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono flex items-center gap-2">
                                    <Info size={14} /> {formError.toUpperCase()}
                                </div>
                            )}

                            <div className="pt-4">
                                <button type="submit" className="w-full py-4 md:py-8 bg-[#00f2ff] text-[#050510] font-black uppercase tracking-[0.3em] rounded-2xl text-xl md:text-4xl hover:scale-[1.03] active:scale-95 transition-all shadow-[0_0_60px_rgba(0,242,255,0.5)]">
                                    {editingTeam ? 'CONFIRM SYNC' : 'INITIALIZE SQUAD'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;
