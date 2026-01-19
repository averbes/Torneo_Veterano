import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Layout from './components/Layout'
import TeamCard from './components/TeamCard'
import RosterOverlay from './components/RosterOverlay'
import StandingsTable from './components/StandingsTable'
import TopStats from './components/TopStats'
import DisciplineTable from './components/DisciplineTable'
import MatchLineupDisplay from './components/MatchLineupDisplay'
import StatsDashboard from './components/StatsDashboard'
import NotificationOverlay from './components/NotificationOverlay'
import { useSocket } from './hooks/useSocket'
import { Users, User, BarChart3, LayoutGrid } from 'lucide-react'

function App() {
  const [data, setData] = useState({ teams: [] });
  const [viewMode, setViewMode] = useState('standard');
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMatchShow, setSelectedMatchShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  // Socket listener
  useSocket((update) => {
    console.log(">>> [UI]: Real-time update received:", update.type);

    if (update.type === 'matches') setMatches(update.data);
    if (update.type === 'standings') setStandings(update.data);
    if (update.type === 'players') setPlayers(update.data);

    // If it's standings, we need to re-enrich teams in 'data'
    if (update.type === 'standings' || update.type === 'teams') {
      fetchDashboardData(); // Simplest way to keep everything in sync
    }
  });

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
            played: teamStanding?.played || 0 || 0,
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

      <div className="mt-8 md:mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-xs md:text-sm font-mono text-[#00f2ff] uppercase tracking-[0.3em] mb-1 md:mb-2 text-glow">Tactical Terminal</h2>
            <div className="flex items-center gap-4">
              <h3 className="text-2xl md:text-3xl font-black text-white">Tourney Overview</h3>
              <div className="flex bg-[#ffffff05] rounded-lg p-1 border border-[#ffffff10]">
                <button
                  onClick={() => setViewMode('standard')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'standard' ? 'bg-[#00f2ff] text-[#050510]' : 'text-[#ffffff40] hover:text-white'}`}
                  title="Standard View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('advanced')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'advanced' ? 'bg-[#00f2ff] text-[#050510]' : 'text-[#ffffff40] hover:text-white'}`}
                  title="Advanced Analytics"
                >
                  <BarChart3 size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-[9px] md:text-[10px] font-mono text-[#ffffff40] uppercase">System Status</div>
            <div className="text-[11px] md:text-xs font-bold text-green-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
              {loading ? 'Synchronizing Uplink...' : 'All Systems Operational'}
            </div>
          </div>
        </div>

        {viewMode === 'advanced' ? (
          <StatsDashboard matches={matches} teams={data.teams} />
        ) : (
          loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] md:text-xs font-mono text-[#00f2ff] animate-pulse">Establishing Neural Link...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {data.teams.length > 0 ? (
                data.teams.map(team => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onManage={handleManageRoster}
                  />
                ))
              ) : (
                <div className="md:col-span-2 p-8 md:p-12 border border-dashed border-[#ffffff10] rounded-2xl text-center">
                  <p className="text-[#ffffff30] font-mono uppercase text-[10px] md:text-xs">No Active Teams Found In Database</p>
                  <button
                    onClick={() => fetchDashboardData()}
                    className="mt-4 px-6 py-2 bg-[#ffffff05] border border-[#ffffff10] text-xs text-white rounded-lg hover:bg-[#ffffff10]"
                  >
                    Retry Scan
                  </button>
                </div>
              )}
            </div>
          )
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
                    <div key={match.id} className="p-3 md:p-4 bg-[#00000020] border border-[#ffffff05] rounded-xl hover:border-[#ffffff10] transition-colors relative group">
                      <div className="flex justify-between items-center mb-1 md:mb-2 gap-2">
                        <div className="flex items-center gap-2 md:gap-4 flex-1 overflow-hidden">
                          <div className="text-right flex-1 min-w-0">
                            <span className="text-white text-xs md:text-sm font-bold truncate block">{homeTeam?.name || 'Unknown'}</span>
                          </div>
                          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#ffffff05] rounded-full border border-[#ffffff10] shrink-0">
                            {homeTeam?.logo ? (
                              <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-sm md:text-lg">🛡️</span>
                            )}
                          </div>
                        </div>

                        <div className="px-2 md:px-4 flex flex-col items-center min-w-[70px] md:min-w-[100px]">
                          <div className="text-lg md:text-2xl font-black text-white tracking-widest shrink-0">
                            {match.status === 'scheduled' ? 'VS' : `${match.score.teamA} - ${match.score.teamB}`}
                          </div>
                          <div className="text-[8px] md:text-[10px] font-mono uppercase text-[#ffffff40] mt-0.5">
                            {match.status === 'finished' ? 'Final' : match.time}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 flex-1 overflow-hidden">
                          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#ffffff05] rounded-full border border-[#ffffff10] shrink-0">
                            {awayTeam?.logo ? (
                              <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-sm md:text-lg">🛡️</span>
                            )}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <span className="text-white text-xs md:text-sm font-bold truncate block">{awayTeam?.name || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lineup Button - Always show for context, modal handles empty state */}
                      {(match.status === 'finished' || match.status === 'live') && (
                        <div className="flex justify-center mt-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => setSelectedMatchShow(match)}
                            className="text-[10px] font-mono uppercase text-[#00f2ff] hover:text-[#00f2ff]/80 flex items-center gap-1.5 transition-colors"
                          >
                            <Users size={12} /> View Tactical Roster
                          </button>
                        </div>
                      )}
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

      {selectedMatchShow && (
        <MatchLineupDisplay
          match={selectedMatchShow}
          onClose={() => setSelectedMatchShow(null)}
        />
      )}

      <NotificationOverlay />

    </Layout>
  );
}

export default App
