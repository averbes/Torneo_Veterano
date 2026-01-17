import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, BarChart3 } from 'lucide-react';

const StatsDashboard = ({ matches, teams }) => {
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

    const teamColors = [
        '#00f2ff', '#ff0055', '#7000ff', '#00ff88', '#ffd700', '#ff8800', '#ffffff'
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Points Progression Chart */}
                <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-[#00f2ff]" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Points Progression</h3>
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
                                    contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
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
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Team Distribution / Strength (Simplified for now) */}
                <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="text-[#00f2ff]" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Squad Proficiency</h3>
                    </div>
                    {/* Placeholder for future detailed team analytics */}
                    <div className="space-y-4">
                        {teams.map((team, index) => {
                            const winRate = team.wins + team.draws + team.losses > 0
                                ? Math.round((team.wins / (team.wins + team.draws + team.losses)) * 100)
                                : 0;
                            return (
                                <div key={team.id} className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono uppercase">
                                        <span className="text-white/60">{team.name}</span>
                                        <span className="text-[#00f2ff]">{winRate}% WIN RATE</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${winRate}%`,
                                                backgroundColor: teamColors[index % teamColors.length],
                                                boxShadow: `0 0 10px ${teamColors[index % teamColors.length]}40`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
