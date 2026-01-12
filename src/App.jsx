import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Layout from './components/Layout'
import TeamCard from './components/TeamCard'
import RosterOverlay from './components/RosterOverlay'
import StandingsTable from './components/StandingsTable'
import TopStats from './components/TopStats'
import DisciplineTable from './components/DisciplineTable'

function App() {
  const [data, setData] = useState({ teams: [] });
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch teams, standings, matches, and players
      const [teamsRes, standingsRes, matchesRes, playersRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/standings'),
        fetch('/api/matches'),
        fetch('/api/players')
      ]);

      const teams = await teamsRes.json();
      const standingsData = await standingsRes.json();
      const matchesData = await matchesRes.json();
      const playersData = await playersRes.json();

      setMatches(matchesData);
      setStandings(standingsData);
      setPlayers(playersData);

      // Merge standings data into teams
      const enrichedTeams = teams.map(team => {
        const teamStanding = standingsData.find(s => s.teamId === team.id);

        return {
          ...team,
          stats: {
            wins: teamStanding?.won || 0,
            draws: teamStanding?.drawn || 0,
            losses: teamStanding?.lost || 0,
            played: teamStanding?.played || 0,
            goalsFor: teamStanding?.gf || 0,
            goalsAgainst: teamStanding?.ga || 0
          }
        };
      });

      setData({ teams: enrichedTeams });
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageRoster = (team) => {
    // Open roster overlay for the selected team
    setSelectedTeam(team);
  };

  const handleCloseOverlay = () => {
    setSelectedTeam(null);
  };

  return (
    <Layout>
      <Header />

      <div className="mt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-sm font-mono text-[#00f2ff] uppercase tracking-[0.3em] mb-2">Active Divisions</h2>
            <h3 className="text-3xl font-black text-white">Tourney Groups</h3>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-[10px] font-mono text-[#ffffff40] uppercase">System Status</div>
            <div className="text-xs font-bold text-green-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {loading ? 'Synchronizing Uplink...' : 'All Systems Operational'}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#00f2ff] animate-pulse">Establishing Neural Link...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.teams.length > 0 ? (
              data.teams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onManage={handleManageRoster}
                />
              ))
            ) : (
              <div className="md:col-span-2 p-12 border border-dashed border-[#ffffff10] rounded-2xl text-center">
                <p className="text-[#ffffff30] font-mono uppercase text-xs">No Active Teams Found In Database</p>
                <button
                  onClick={() => fetchDashboardData()}
                  className="mt-4 px-6 py-2 bg-[#ffffff05] border border-[#ffffff10] text-xs text-white rounded-lg hover:bg-[#ffffff10]"
                >
                  Retry Scan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="p-8 bg-[#ffffff05] border border-[#ffffff10] rounded-2xl backdrop-blur-sm mb-8">
            <h2 className="text-xl font-bold mb-6 text-[#00f2ff] flex items-center gap-3">
              <div className="w-1 h-6 bg-[#00f2ff]" />
              Match Telemetry
            </h2>

            {matches && matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map(match => {
                  const homeTeam = data.teams.find(t => t.id === match.teamA);
                  const awayTeam = data.teams.find(t => t.id === match.teamB);

                  return (
                    <div key={match.id} className="p-4 bg-[#00000020] border border-[#ffffff05] rounded-xl hover:border-[#ffffff10] transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-right flex-1">
                            <span className="text-white font-bold">{homeTeam?.name || 'Unknown'}</span>
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center bg-[#ffffff05] rounded-full border border-[#ffffff10]">
                            {homeTeam?.logo && homeTeam.logo.startsWith('data:') ? (
                              <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-lg">{homeTeam?.logo || '🛡️'}</span>
                            )}
                          </div>
                        </div>

                        <div className="px-6 flex flex-col items-center">
                          <div className="text-2xl font-black text-white tracking-widest">
                            {match.status === 'finished' ? `${match.score.teamA} - ${match.score.teamB}` : 'VS'}
                          </div>
                          <div className="text-[10px] font-mono uppercase text-[#ffffff40] mt-1">
                            {match.status === 'finished' ? 'Final Score' : match.time}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-8 h-8 flex items-center justify-center bg-[#ffffff05] rounded-full border border-[#ffffff10]">
                            {awayTeam?.logo && awayTeam.logo.startsWith('data:') ? (
                              <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-lg">{awayTeam?.logo || '🛡️'}</span>
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <span className="text-white font-bold">{awayTeam?.name || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border border-[#ffffff05] rounded-xl bg-[#00000020]">
                <span className="text-xs font-mono text-[#ffffff20] uppercase tracking-widest animate-pulse">No matches recorded...</span>
              </div>
            )}
          </div>

          <StandingsTable standings={standings} teams={data.teams} />
        </div>

        <div className="space-y-8">
          <TopStats players={players} />
        </div>
      </div>

      <div className="mt-8">
        <DisciplineTable players={players} />
      </div>

      {/* Overlays */}
      {selectedTeam && (
        <RosterOverlay
          team={selectedTeam}
          onClose={handleCloseOverlay}
        />
      )}

    </Layout>
  );
}

export default App
