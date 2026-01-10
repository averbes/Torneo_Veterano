import React from 'react';

const Dashboard = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Teams', value: '2', color: '#00f2ff' },
                    { label: 'Active Players', value: '32', color: '#7000ff' },
                    { label: 'Matches Today', value: '1', color: '#00f2ff' },
                    { label: 'System Status', value: 'ONLINE', color: '#00ff88' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#ffffff05] border border-[#ffffff10] p-6 rounded-xl">
                        <div className="text-[#ffffff50] text-xs font-mono uppercase mb-2">{stat.label}</div>
                        <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
