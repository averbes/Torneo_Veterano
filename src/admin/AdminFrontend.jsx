import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Calendar, Trophy, LogOut } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Standings from './pages/Standings';

const AdminFrontend = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('admin-token');
            const adminFlag = localStorage.getItem('neo-veterans-admin');

            if (!token || adminFlag !== 'true') {
                if (location.pathname !== '/admin/login') {
                    navigate('/admin/login');
                }
                return;
            }

            try {
                const res = await fetch('/api/admin/verify', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    handleLogout();
                }
            } catch (_) {
                handleLogout();
            }
        };

        verifyToken();
    }, [location.pathname]); // Only re-run when path changes

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('neo-veterans-admin');
        localStorage.removeItem('admin-token');
        setIsAuthenticated(false);
        navigate('/admin/login');
    };

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
                <Route path="*" element={<Navigate to="/admin/login" />} />
            </Routes>
        );
    }

    return (
        <div className="min-h-screen bg-[#050510] text-white flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-[#0a0a1a] border-b border-[#ffffff10] sticky top-0 z-50">
                <h1 className="text-lg font-bold tracking-tighter text-[#00f2ff]">NEO<span className="text-white">ADMIN</span></h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white/60">
                    <LayoutDashboard size={24} />
                </button>
            </header>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 border-r border-[#ffffff10] bg-[#0a0a1a] flex flex-col transform transition-transform duration-300 md:translate-x-0 md:relative
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="hidden md:block p-6 border-b border-[#ffffff10]">
                    <h1 className="text-xl font-bold tracking-tighter text-[#00f2ff]">NEO<span className="text-white">ADMIN</span></h1>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={location.pathname === '/admin/dashboard'} />
                    <NavItem to="/admin/teams" icon={<Shield size={20} />} label="Teams" active={location.pathname === '/admin/teams'} />
                    <NavItem to="/admin/players" icon={<Users size={20} />} label="Players" active={location.pathname === '/admin/players'} />
                    <NavItem to="/admin/matches" icon={<Calendar size={20} />} label="Matches" active={location.pathname === '/admin/matches'} />
                    <NavItem to="/admin/standings" icon={<Trophy size={20} />} label="Standings" active={location.pathname === '/admin/standings'} />
                </nav>

                <div className="p-4 border-t border-[#ffffff10]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ff0055] hover:bg-[#ff0055]/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Disconnect
                    </button>
                    <Link to="/" className="block mt-2 text-center text-xs text-[#ffffff50] hover:text-white">Return to Frontend</Link>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-grow min-w-0 bg-gradient-to-br from-[#0a0a1a] to-[#050510]">
                <div className="p-4 md:p-8">
                    <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="teams" element={<Teams />} />
                        <Route path="players" element={<Players />} />
                        <Route path="matches" element={<Matches />} />
                        <Route path="standings" element={<Standings />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
            ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20'
            : 'text-[#ffffff60] hover:text-white hover:bg-[#ffffff05]'
            }`}
    >
        {icon}
        {label}
    </Link>
);

export default AdminFrontend;
