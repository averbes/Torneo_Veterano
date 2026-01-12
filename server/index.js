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
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database
console.log("Initializing Database...");
await initDB();

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/standings', standingsRoutes);

// Mock storage for static uploads if needed later
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Production: Serve built frontend static files
const distPath = join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route for SPA (React Router)
app.get('*', (req, res) => {
    // Only serve index.html if the request is not for an API route
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving static files from ${distPath}`);
});
