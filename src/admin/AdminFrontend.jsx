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

    useEffect(() => {
        const adminFlag = localStorage.getItem('neo-veterans-admin');
        if (adminFlag === 'true') {
            setIsAuthenticated(true);
        } else {
            // If not authenticated and trying to access other than login, redirect
            if (location.pathname !== '/admin/login') {
                navigate('/admin/login');
            }
        }
    }, [location, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('neo-veterans-admin');
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
        <div className="min-h-screen bg-[#050510] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#ffffff10] bg-[#0a0a1a] flex flex-col">
                <div className="p-6 border-b border-[#ffffff10]">
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

            {/* Main Content */}
            <main className="flex-grow overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                <div className="p-8">
                    <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="teams" element={<Teams />} />
                        <Route path="players" element={<Players />} />
                        <Route path="matches" element={<Matches />} />
                        <Route path="standings" element={<Standings />} />
                        {/* Default to dashboard */}
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
