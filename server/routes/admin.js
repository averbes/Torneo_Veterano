import express from 'express';
const router = express.Router();

// Hardcoded Admin Credentials
const ADMIN_CREDS = {
    login: 'admin',
    password: 'Vet2026#'
};

// GET /admin - Verify connectivity
router.get('/', (req, res) => {
    res.json({ login: "admin", status: "active" });
});

// POST /admin/login - Simple password check
router.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_CREDS.password) {
        return res.status(200).json({ success: true, message: "Welcome Administrator" });
    } else {
        return res.status(403).json({ success: false, message: "Invalid Credentials" });
    }
});

export default router;
