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

import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database
console.log("Initializing Database...");
await initDB().catch(err => console.error("Database initialization failed:", err));

// Health check
app.get('/health', (req, res) => res.send('OK'));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/standings', standingsRoutes);

// Mock storage for static uploads if needed later
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Production: Serve built frontend static files
const distPath = join(process.cwd(), 'dist');
console.log(`Checking for static files at: ${distPath}`);
if (fs.existsSync(distPath)) {
    console.log("dist folder found!");
    app.use(express.static(distPath));
} else {
    console.warn("WARNING: dist folder NOT found. Frontend might not load.");
}

// Catch-all route for SPA (React Router)
app.get('*', (req, res) => {
    // Only serve index.html if the request is not for an API route
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }

    const indexPath = join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built. Please check build logs.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Working directory: ${process.cwd()}`);
});
