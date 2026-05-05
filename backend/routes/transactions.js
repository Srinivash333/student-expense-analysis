const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const transactionController = require('../controllers/transactionController');
const mlController = require('../controllers/mlController');

// Multer config for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/data/upload', upload.single('file'), transactionController.uploadData);
router.get('/transactions', transactionController.getTransactions);
router.post('/transactions', transactionController.createTransaction);
router.get('/analytics', transactionController.getAnalytics);
router.get('/students', transactionController.getStudents);
router.get('/predictions', mlController.getPredictions);
router.get('/recommendations', mlController.getRecommendations);

module.exports = router;
