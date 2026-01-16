import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('neo-veterans-admin', 'true');
                localStorage.setItem('admin-token', data.token);
                onLogin();
                navigate('/admin/dashboard');
            } else {
                setError(true);
            }
        } catch (_) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 bg-[#0a0a1a] border border-[#ffffff10] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-lg mx-auto mb-4 transform rotate-45" />
                    <h1 className="text-2xl font-bold text-white tracking-tighter">NEO<span className="text-[#00f2ff]">LEAGUE</span></h1>
                    <p className="text-[#ffffff50] text-sm font-mono mt-2">SECURE ADMIN ACCESS</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-[#ffffff50] mb-2 uppercase">Access Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#050510] border border-[#ffffff10] rounded-lg p-3 text-white focus:border-[#00f2ff] focus:outline-none transition-colors text-center tracking-[0.5em] font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-[#ff0055]/10 border border-[#ff0055]/20 rounded-lg text-[#ff0055] text-xs text-center font-bold">
                            ACCESS DENIED // INVALID CREDENTIALS
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#00f2ff] text-black font-bold uppercase tracking-wider rounded-lg hover:bg-[#00c2cc] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Establish Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
