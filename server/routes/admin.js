import express from 'express';
import { Admin } from '../db.js';

const router = express.Router();

// GET /admin - Verify connectivity
router.get('/', async (req, res) => {
    try {
        const admin = await Admin.findOne({ key: 'admin_user' });
        res.json({ login: admin?.key || "admin", status: "active" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /admin/login - Simple password check
router.post('/login', async (req, res) => {
    const { password } = req.body;

    try {
        // Fallback for first time if no admin in DB
        let admin = await Admin.findOne({ key: 'admin_user' });
        if (!admin) {
            // Create default admin if not exists
            admin = new Admin({ key: 'admin_user', password: 'Vet2026#' });
            await admin.save();
        }

        if (password === admin.password) {
            return res.status(200).json({ success: true, message: "Welcome Administrator" });
        } else {
            return res.status(403).json({ success: false, message: "Invalid Credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
