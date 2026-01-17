import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Zap, AlertTriangle, Info, Bell, X, Shield, Target } from 'lucide-react';

const NotificationOverlay = () => {
    const [notifications, setNotifications] = useState([]);

    useSocket((update) => {
        if (update.type === 'alert') {
            const id = Date.now();
            const newNotif = {
                id,
                ...update.data,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 5));

            // Auto-remove after 8 seconds
            setTimeout(() => {
                removeNotification(id);
            }, 8000);
        }
    });

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-24 right-4 md:right-8 z-[1000] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className="pointer-events-auto relative overflow-hidden bg-[#0a0a1a]/90 backdrop-blur-xl border-l-4 border-r border-t border-b border-[#ffffff10] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-10 duration-500 hover:scale-[1.02] transition-transform"
                    style={{ borderLeftColor: notif.type === 'GOAL' ? '#00f2ff' : notif.type === 'CARD' ? '#fbbf24' : '#7000ff' }}
                >
                    {/* Scanner line animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-scan-notif pointer-events-none" />

                    <div className="p-4 flex gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${notif.type === 'GOAL' ? 'bg-[#00f2ff]/10 text-[#00f2ff]' :
                                notif.type === 'CARD' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-purple-500/10 text-purple-400'
                            }`}>
                            {notif.type === 'GOAL' ? <Zap size={24} className="animate-pulse" /> :
                                notif.type === 'CARD' ? <AlertTriangle size={24} /> :
                                    <Bell size={24} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <span className={`text-[9px] font-black font-mono tracking-[0.2em] uppercase ${notif.type === 'GOAL' ? 'text-[#00f2ff]' : 'text-white/40'
                                    }`}>
                                    System Alert // {notif.type}
                                </span>
                                <span className="text-[9px] font-mono text-white/20">{notif.timestamp}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1 leading-tight">{notif.message}</h4>
                            {notif.minute && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#00f2ff]/30 w-full animate-progress-notif" />
                                    </div>
                                    <span className="text-[8px] font-mono text-[#00f2ff] uppercase">Minute {notif.minute}'</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => removeNotification(notif.id)}
                            className="text-white/10 hover:text-white transition-colors self-start"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Inner glowing edge */}
                    <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none" />
                </div>
            ))}
        </div>
    );
};

export default NotificationOverlay;
