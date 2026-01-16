import express from 'express';
import multer from 'multer';
import path from 'path';
import { supabase } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure memory storage for Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
    }
});

// POST /api/upload/image
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage
            .from('player-photos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('player-photos')
            .getPublicUrl(filePath);

        res.json({ url: publicUrl });
    } catch (err) {
        console.error(">>> [UPLOAD]: Error uploading to Supabase:", err.message);
        res.status(500).json({ error: "Failed to upload image to Supabase Storage" });
    }
});

export default router;
