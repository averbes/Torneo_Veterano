import 'dotenv/config';
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
import uploadRoutes from './routes/upload.js';
import { createServer } from 'http';
import { initSocket } from './socket.js';



import fs from 'fs';

console.log(">>> [LOG]: SERVER BOOT SEQUENCE INITIATED");

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

async function bootstrap() {
    try {
        console.log(">>> [LOG]: Initializing Middlewares...");
        app.use(cors());
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ limit: '50mb', extended: true }));

        // Health check
        app.get('/health', (req, res) => res.status(200).send('OK'));

        console.log(">>> [LOG]: Initializing Database...");
        await initDB();
        console.log(">>> [LOG]: Database Loaded Successfully.");

        console.log(">>> [LOG]: Initializing Socket.io...");
        initSocket(httpServer);

        // API Routes
        console.log(">>> [LOG]: Mounting API Routes...");
        app.use('/api/admin', adminRoutes);
        app.use('/api/teams', teamRoutes);
        app.use('/api/players', playerRoutes);
        app.use('/api/matches', matchRoutes);
        app.use('/api/standings', standingsRoutes);
        app.use('/api/upload', uploadRoutes);


        // Files
        app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

        // Static Files (Production)
        const distPath = join(process.cwd(), 'dist');
        console.log(`>>> [LOG]: Checking for dist folder at: ${distPath}`);

        if (fs.existsSync(distPath)) {
            console.log(">>> [LOG]: Found 'dist' directory. Serving static assets.");
            app.use(express.static(distPath));

            // Catch-all for SPA routing
            app.use((req, res, next) => {
                if (req.path.startsWith('/api/')) {
                    return res.status(404).json({ error: 'API not found' });
                }
                const indexPath = join(distPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    res.sendFile(indexPath);
                } else {
                    res.status(404).send('index.html not found in dist.');
                }
            });
        } else {
            console.warn(">>> [WARNING]: 'dist' folder NOT detected. Frontend will not be available.");
            app.use((req, res) => {
                if (req.path.startsWith('/api/')) {
                    return res.status(404).json({ error: 'API not found' });
                }
                res.status(404).send('Application is in Backend-Only mode (dist missing).');
            });
        }

        console.log(`>>> [LOG]: Attempting to bind to PORT: ${PORT}`);
        httpServer.listen(PORT, () => {
            console.log(`>>> [SUCCESS]: Server live on port ${PORT}`);
            console.log(`>>> [LOG]: Current Working Directory: ${process.cwd()}`);
        });

    } catch (error) {
        console.error(">>> [FATAL]: CRITICAL SERVER CRASH ON STARTUP:");
        console.error(error);
        process.exit(1);
    }
}

// Global process error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('>>> [CRITICAL]: Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('>>> [CRITICAL]: Uncaught Exception:', err);
    process.exit(1);
});

bootstrap();
