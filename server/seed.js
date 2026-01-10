import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function seed() {
    console.log("Seeding Database...");

    // 1. Create Teams
    const teams = [
        { name: "Neon Strikers", franchiseId: "NST-01", logo: "⚡", color: "#00f2ff" },
        { name: "Cyber Phantoms", franchiseId: "CPH-02", logo: "👻", color: "#7000ff" }
    ];

    for (const t of teams) {
        const res = await fetch(`${API_URL}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t)
        });
        const team = await res.json();
        console.log(`Created Team: ${team.name} (${team.id})`);

        // 2. Add some players for each team (simple mock instead of CSV for now)
        // We'll use the CSV logic eventually, but for a quick test, let's hit a mock player creation or just rely on CSV.
        // Actually, I should just create a small CSV and hit the upload endpoint.
    }

    console.log("Seeding complete. Use the dashboard to manage rosters via CSV.");
}

seed();
