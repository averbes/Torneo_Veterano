import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Layout from './components/Layout'
import TeamCard from './components/TeamCard'
import RosterOverlay from './components/RosterOverlay'
import EditPanel from './components/EditPanel'

function App() {
  const [data, setData] = useState({ teams: [] });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teams');
      const teams = await res.json();
      setData({ teams });
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

  const handleEditTeam = (team) => {
    setEditingTeam(team);
  };

  const handleUpdateTeam = async (updatedTeam) => {
    try {
      const res = await fetch(`/api/teams/${updatedTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeam)
      });

      if (res.ok) {
        await fetchTeams(); // Refresh all data
      }
    } catch (err) {
      console.error("Failed to update team:", err);
    }

    // Update local state if needed for overlay
    if (selectedTeam && selectedTeam.id === updatedTeam.id) {
      setSelectedTeam(updatedTeam);
    }
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
                  onEdit={handleEditTeam}
                />
              ))
            ) : (
              <div className="md:col-span-2 p-12 border border-dashed border-[#ffffff10] rounded-2xl text-center">
                <p className="text-[#ffffff30] font-mono uppercase text-xs">No Active Teams Found In Database</p>
                <button
                  onClick={() => {/* Mock add or refresh */ fetchTeams(); }}
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
        <div className="lg:col-span-2 p-8 bg-[#ffffff05] border border-[#ffffff10] rounded-2xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 text-[#00f2ff] flex items-center gap-3">
            <div className="w-1 h-6 bg-[#00f2ff]" />
            Tournament Telemetry
          </h2>
          <div className="h-48 flex items-center justify-center border border-[#ffffff05] rounded-xl bg-[#00000020]">
            <span className="text-xs font-mono text-[#ffffff20] uppercase tracking-widest animate-pulse">Waiting for match data...</span>
          </div>
        </div>
        <div className="p-8 bg-[#ffffff05] border border-[#ffffff10] rounded-2xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 text-[#7000ff] flex items-center gap-3">
            <div className="w-1 h-6 bg-[#7000ff]" />
            Global Feed
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="pb-4 border-b border-[#ffffff05] last:border-0">
                <div className="text-[10px] font-mono text-[#ffffff30] mb-1">REQ_LOG_{i}42</div>
                <div className="text-xs text-[#ffffff70]">System initialization complete. Division A squads verified.</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlays */}
      {selectedTeam && (
        <RosterOverlay
          team={selectedTeam}
          onClose={handleCloseOverlay}
        />
      )}

      {editingTeam && (
        <EditPanel
          team={editingTeam}
          onUpdate={handleUpdateTeam}
          onClose={() => setEditingTeam(null)}
        />
      )}
    </Layout>
  );
}

export default App
