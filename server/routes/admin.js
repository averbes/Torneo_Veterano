import express from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'neo-league-secret-key-2026';

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
        let admin = await Admin.findOne({ key: 'admin_user' });
        if (!admin) {
            admin = new Admin({ key: 'admin_user', password: 'Vet2026#' });
            await admin.save();
        }

        // In a real app, use bcrypt.compare(password, admin.password)
        if (password === admin.password) {
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
