const express = require('express');
const router = express.Router();
const controller = require('../controllers/images.js');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, req.userData.username);
  }
});
const upload = multer({ storage: storage });
const checkAuth = require('../filters/check-auth');

router.get('/:imageName', controller.getImage);

router.post('/upload', checkAuth, upload.single('image'), controller.uploadImage);

module.exports = router;
