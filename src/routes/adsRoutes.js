const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createAd, uploadImages, getNearestCity, getUserAds, searchAds, getAdById } = require('../controllers/adsController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this path exists relative to where server is started (back/src/index.js -> cwd usually back/)
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ad-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
});

// Routes
router.get('/search', searchAds);
router.post('/', authMiddleware, createAd);
router.get('/my-ads', authMiddleware, getUserAds);
router.get('/:id', getAdById);

// Max 10 images
router.post('/upload', authMiddleware, upload.array('images', 10), uploadImages);

// Public route provided for nearest city (could be protected if needed, but useful for UX)
router.get('/nearest-city', getNearestCity);

module.exports = router;
