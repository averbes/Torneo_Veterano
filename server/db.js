import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(">>> [DB]: MISSING SUPABASE CREDENTIALS IN .ENV");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initDB() {
    console.log(`>>> [DB]: Initializing Supabase Connection...`);
    try {
        // Test connection by fetching a single row from teams
        const { error } = await supabase.from('teams').select('id').limit(1);
        if (error) throw error;

        console.log(">>> [DB]: Connected to Supabase successfully.");
    } catch (err) {
        console.error(">>> [DB]: Supabase connection error:", err.message);
        // We don't throw here to allow the server to start even if DB is currently unreachable, 
        // though in production this might be critical.
    }
}

// Export a dummy object for compatibility with old imports if needed
export const Team = { find: () => ({}) };
export const Player = { find: () => ({}) };
export const Match = { find: () => ({}) };
export const Standing = { find: () => ({}) };
export const Admin = { find: () => ({}) };
