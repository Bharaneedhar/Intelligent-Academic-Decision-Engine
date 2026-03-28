const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { completeProfile, addRole, saveAcademicProfile, updateName, uploadPhoto } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.put('/academic', protect, saveAcademicProfile);   // PUT academic profile fields
router.put('/setup', protect, completeProfile);          // PUT complete profile (role selection)
router.post('/roles/add', protect, addRole);             // POST add additional role
router.put('/update-name', protect, updateName);         // PUT update name
router.post('/upload-photo', protect, upload.single('image'), uploadPhoto); // POST upload photo

module.exports = router;
