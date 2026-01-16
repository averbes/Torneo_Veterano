import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'neo-league-secret-key-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Vet2026#';

// GET /admin - Verify token
router.get('/verify', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false });

    try {
        jwt.verify(token, JWT_SECRET);
        res.json({ valid: true });
    } catch (err) {
        res.status(401).json({ valid: false });
    }
});

// POST /admin/login - JWT authentication
router.post('/login', async (req, res) => {
    const { password } = req.body;

    try {
        // Simple credential check for now. 
        // Future improvement: Use Supabase Auth or a dedicated 'admins' table.
        if (password === ADMIN_PASSWORD) {
            const token = jwt.sign(
                { key: 'admin_user', role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.status(200).json({
                success: true,
                token,
                message: "Welcome Administrator"
            });
        } else {
            return res.status(403).json({ success: false, message: "Invalid Credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
