import React, { useState, useEffect, useMemo } from 'react'
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
import { normalizePlayers } from './utils/playerHelpers'
import { Users, User, BarChart3, LayoutGrid } from 'lucide-react'

function App() {
  const [teams, setTeams] = useState([]);
  const [viewMode, setViewMode] = useState('standard');
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMatchShow, setSelectedMatchShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  // Derive enriched teams with stats for cards
  const enrichedTeams = useMemo(() => {
    return teams.map(team => {
      const teamStanding = standings.find(s => s.teamId === team.id);
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
  }, [teams, standings]);

  // Socket listener
  useSocket((update) => {
    console.log(">>> [UI]: Real-time update received:", update.type);
    if (update.type === 'matches') setMatches(update.data);
    // if (update.type === 'standings') setStandings(update.data); // IGNORED: Calculated client-side
    if (update.type === 'players') {
      const normalized = normalizePlayers(update.data);
      setPlayers(normalized);
    }
    if (update.type === 'teams') setTeams(update.data);
  });

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Client-side standings calculation to ensure sync
  const calculateHeadquartersIntel = (currentMatches, currentTeams) => {
    if (!currentTeams.length) return [];

    // Initialize stats matrix
    const stats = {};
    currentTeams.forEach(t => {
      stats[String(t.id)] = { teamId: t.id, points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0 };
    });

    // Process Mission Reports (Matches)
    currentMatches.forEach(m => {
      if (m.status !== 'finished') return;

      const tA = stats[String(m.teamA)];
      const tB = stats[String(m.teamB)];

      if (!tA || !tB) return;

      const sA = parseInt(m.score?.teamA || 0);
      const sB = parseInt(m.score?.teamB || 0);

      tA.played++; tB.played++;
      tA.gf += sA; tA.ga += sB;
      tB.gf += sB; tB.ga += sA;
      tA.gd = tA.gf - tA.ga;
      tB.gd = tB.gf - tB.ga;

      if (sA > sB) {
        tA.won++; tA.points += 3;
        tB.lost++;
      } else if (sB > sA) {
        tB.won++; tB.points += 3;
        tA.lost++;
      } else {
        tA.drawn++; tA.points += 1;
        tB.drawn++; tB.points += 1;
      }
    });

    return Object.values(stats).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  };

  // Re-calculate standings whenever matches or teams change to guarantee sync
  useEffect(() => {
    if (teams.length > 0 && matches.length > 0) {
      const calculated = calculateHeadquartersIntel(matches, teams);
      setStandings(calculated);
    }
  }, [matches, teams]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch teams, matches, and players (ignore backend standings)
      const [teamsRes, matchesRes, playersRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/matches'),
        fetch('/api/players')
      ]);

      const teamsData = await teamsRes.json();
      const matchesData = await matchesRes.json();
      const playersData = await playersRes.json();

      setMatches(matchesData);
      const normalizedPlayers = normalizePlayers(playersData);
      setPlayers(normalizedPlayers);
      setTeams(teamsData);
      // Standings will be auto-calculated by the useEffect above

    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageRoster = (team) => {
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
            <h2 className="text-[10px] md:text-xs font-mono text-[#FF6B35] uppercase tracking-[0.5em] mb-1 md:mb-2 text-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>TACTICAL_TERMINAL // ALPHA</h2>
            <div className="flex items-center gap-6">
              <h3 className="text-3xl md:text-4xl font-black text-white italic" style={{ fontFamily: 'Orbitron, sans-serif' }}>TOURNEY <span className="text-[#FF6B35]">OVERVIEW</span></h3>
              <div className="flex bg-black/60 rounded-xl p-1 border border-white/10 shadow-xl">
                <button
                  onClick={() => setViewMode('standard')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'standard' ? 'bg-[#FF6B35] text-black shadow-[0_0_15px_rgba(255,107,53,0.4)]' : 'text-white/30 hover:text-white'}`}
                  title="Tactical Grid"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('advanced')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'advanced' ? 'bg-[#FF6B35] text-black shadow-[0_0_15px_rgba(255,107,53,0.4)]' : 'text-white/30 hover:text-white'}`}
                  title="Strategic Analytics"
                >
                  <BarChart3 size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="text-[9px] md:text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1">DATA_UPLINK_STATUS</div>
            <div className={`text-[11px] md:text-xs font-black flex items-center gap-3 italic ${loading ? 'text-[#FF6B35]' : 'text-[#00f2ff]'}`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${loading ? 'bg-[#FF6B35]' : 'bg-[#00f2ff]'}`} />
              {loading ? 'SYNCHRONIZING...' : 'SYSTEMS_OPERATIONAL'}
            </div>
          </div>
        </div>

        {viewMode === 'advanced' ? (
          <StatsDashboard matches={matches} teams={enrichedTeams} />
        ) : (
          loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] md:text-xs font-mono text-[#00f2ff] animate-pulse">Establishing Neural Link...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {enrichedTeams.length > 0 ? (
                enrichedTeams.map(team => (
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
                  const homeTeam = teams.find(t => t.id === match.teamA);
                  const awayTeam = teams.find(t => t.id === match.teamB);

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

          <StandingsTable standings={standings} teams={teams} />
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
