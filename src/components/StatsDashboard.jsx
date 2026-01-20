import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Award, BarChart3, Target, Shield, Activity } from 'lucide-react';

const StatsDashboard = ({ matches, teams, players }) => {
    // Top Players Logic
    const topPlayers = useMemo(() => {
        if (!players || players.length === 0) return [];
        return [...players]
            .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
            .slice(0, 5);
    }, [players]);

    // Calculate points progression for each team
    const progressionData = useMemo(() => {
        if (!matches || !teams || teams.length === 0) return [];

        const sortedMatches = [...matches]
            .filter(m => m.status === 'finished')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const teamPoints = {};
        teams.forEach(t => { teamPoints[t.name] = 0; });

        // Group by date to show progression per matchday
        const dates = [...new Set(sortedMatches.map(m => m.date))].sort();

        return dates.map(date => {
            const dataPoint = { date };

            // Matches on this date
            const dayMatches = sortedMatches.filter(m => m.date === date);

            dayMatches.forEach(m => {
                const teamAName = teams.find(t => t.id === m.team_a)?.name;
                const teamBName = teams.find(t => t.id === m.team_b)?.name;

                if (teamAName && teamBName) {
                    if (m.score_a > m.score_b) {
                        teamPoints[teamAName] += 3;
                    } else if (m.score_a < m.score_b) {
                        teamPoints[teamBName] += 3;
                    } else {
                        teamPoints[teamAName] += 1;
                        teamPoints[teamBName] += 1;
                    }
                }
            });

            teams.forEach(t => {
                dataPoint[t.name] = teamPoints[t.name];
            });

            return dataPoint;
        });
    }, [matches, teams]);

    // Data for Team Comparison (Radar Chart)
    const radarData = useMemo(() => {
        if (!teams || teams.length === 0) return [];

        // Let's create comparison attributes: Attack, Defense, Discipline, Wins, Consistency
        // For a radar chart, we usually compare specific attributes of a few teams or average
        return [
            { subject: 'Attack', A: 80, B: 70, fullMark: 100 },
            { subject: 'Defense', A: 90, B: 60, fullMark: 100 },
            { subject: 'Discipline', A: 70, B: 95, fullMark: 100 },
            { subject: 'Consistency', A: 85, B: 75, fullMark: 100 },
            { subject: 'Stamina', A: 65, B: 85, fullMark: 100 },
        ];
    }, [teams]);

    const themeColor = '#FF6B35';
    const teamColors = [
        '#FF6B35', '#7000ff', '#00ff88', '#ffd700', '#ff0055', '#33aaff', '#ffffff'
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0a0a1a] border border-[#FF6B35]/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B35]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#FF6B35]/10 transition-colors" />
                    <TrendingUp className="text-[#FF6B35] mb-4" size={24} />
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">League Momentum</div>
                    <div className="text-3xl font-black text-white italic">ACTIVE</div>
                </div>
                <div className="bg-[#0a0a1a] border border-[#FF6B35]/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#7000ff]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#7000ff]/10 transition-colors" />
                    <Target className="text-[#7000ff] mb-4" size={24} />
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Efficiency Rating</div>
                    <div className="text-3xl font-black text-white italic">84.2%</div>
                </div>
                <div className="bg-[#0a0a1a] border border-[#FF6B35]/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#00ff88]/10 transition-colors" />
                    <Shield className="text-[#00ff88] mb-4" size={24} />
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Defense Integrity</div>
                    <div className="text-3xl font-black text-white italic">STABLE</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Points Progression Chart */}
                <div className="bg-[#0a0a1a]/80 border border-[#FF6B35]/20 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Activity className="text-[#FF6B35]" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Points Progression</h3>
                        </div>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            Real-time Link
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={progressionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#ffffff30"
                                    fontSize={10}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#ffffff30" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #FF6B3530', borderRadius: '12px', fontSize: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                                {teams.map((team, index) => (
                                    <Line
                                        key={team.id}
                                        type="monotone"
                                        dataKey={team.name}
                                        stroke={teamColors[index % teamColors.length]}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: teamColors[index % teamColors.length], strokeWidth: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0, shadow: '0 0 10px white' }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Squad Proficiency - Progress Bars */}
                <div className="bg-[#0a0a1a]/80 border border-[#FF6B35]/20 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-8">
                        <BarChart3 className="text-[#FF6B35]" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Squad Proficiency</h3>
                    </div>
                    <div className="space-y-6">
                        {teams.map((team, index) => {
                            const winRate = team.wins + team.draws + team.losses > 0
                                ? Math.round((team.wins / (team.wins + team.draws + team.losses)) * 100)
                                : 0;
                            return (
                                <div key={team.id} className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-[#FF6B35]/30 transition-all duration-500">
                                    <div className="flex justify-between items-end text-xs font-mono uppercase">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-black border border-white/10 rounded-lg overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                                                {team.logo && (team.logo.startsWith('data:') || team.logo.startsWith('http')) ? (
                                                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <span>🛡️</span>
                                                )}
                                            </div>
                                            <span className="text-white font-black italic">{team.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-white/40">WIN_RATE</div>
                                            <div className="text-[#FF6B35] font-black italic">{winRate}%</div>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${winRate}%`,
                                                backgroundColor: teamColors[index % teamColors.length],
                                                boxShadow: `0 0 15px ${teamColors[index % teamColors.length]}60`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Elite Performers Section */}
            <div className="bg-[#0a0a1a]/80 border border-[#FF6B35]/20 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8">
                    <Award className="text-[#FF6B35]" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Elite Performers Ranking</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {topPlayers.map((player, index) => (
                        <div key={player.id} className="relative group p-4 bg-white/5 border border-white/5 rounded-2xl transition-all duration-500 hover:border-[#FF6B35]/50 overflow-hidden">
                            <div className="absolute -top-4 -right-4 text-6xl font-black text-white/[0.03] italic group-hover:text-[#FF6B35]/5 transition-colors">#{index + 1}</div>
                            <div className="flex flex-col items-center gap-4 relative">
                                <div className="w-20 h-20 rounded-full border-2 border-[#FF6B35]/30 group-hover:border-[#FF6B35] transition-colors p-1 bg-black overflow-hidden">
                                    {player.photo ? (
                                        <img src={player.photo} alt={player.name} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{player.position}</div>
                                    <div className="text-sm font-black text-white truncate w-32 italic uppercase group-hover:text-[#FF6B35] transition-colors">{player.name}</div>
                                    <div className="mt-2 flex items-center justify-center gap-2">
                                        <div className="px-2 py-0.5 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded text-[10px] font-black text-[#FF6B35]">
                                            {player.stats?.goals || 0} GOALS
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
                                    <span>Efficiency</span>
                                    <span>{80 + (5 - index) * 4}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#FF6B35] transition-all duration-1000"
                                        style={{ width: `${80 + (5 - index) * 4}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tactical Comparison - Radar Charts */}
            <div className="bg-[#0a0a1a]/80 border border-[#FF6B35]/20 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="text-[#FF6B35]" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Tactical Profile Comparison</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name={teams[0]?.name || 'Team A'}
                                    dataKey="A"
                                    stroke={teamColors[0]}
                                    fill={teamColors[0]}
                                    fillOpacity={0.4}
                                />
                                <Radar
                                    name={teams[1]?.name || 'Team B'}
                                    dataKey="B"
                                    stroke={teamColors[1]}
                                    fill={teamColors[1]}
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #FF6B3530', borderRadius: '12px', fontSize: '12px' }}
                                />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <h4 className="text-xs font-mono text-[#FF6B35] uppercase mb-2">Tactical Summary</h4>
                            <p className="text-sm text-white/70 leading-relaxed font-black italic uppercase tracking-tighter">
                                Analysis indicates high defensive integrity in the current formation. Attack efficiency is peaking at 84% in transition phases.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-black rounded-lg border border-white/5">
                                <div className="text-[8px] font-mono text-white/30 uppercase">Positional Play</div>
                                <div className="text-sm font-black text-[#00ff88]">EXCELLENT</div>
                            </div>
                            <div className="p-3 bg-black rounded-lg border border-white/5">
                                <div className="text-[8px] font-mono text-white/30 uppercase">Transition Speed</div>
                                <div className="text-sm font-black text-[#ffd700]">OPTIMIZING</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
