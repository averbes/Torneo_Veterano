import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';
import adminRoutes from './routes/admin.js';
import teamRoutes from './routes/teams.js';
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import standingsRoutes from './routes/standings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database
console.log("Initializing Database...");
await initDB();

// Routes
app.use('/admin', adminRoutes);
app.use('/teams', teamRoutes);
app.use('/players', playerRoutes);
app.use('/matches', matchRoutes);
app.use('/standings', standingsRoutes);

// Mock storage for static uploads if needed later
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
    console.log(`Admin Login: POST /admin/login`);
});
