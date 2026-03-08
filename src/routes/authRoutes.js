const express = require('express');
const router = express.Router();
const { adminLogin, teacherLogin, studentLogin, superAdminLogin, registerSchool } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);

router.post('/adminLogin', adminLogin);
router.post('/teacherLogin', teacherLogin);
router.post('/studentLogin', studentLogin);

router.post('/registerSchool', registerSchool);
router.post('/SuperAdminLogin', superAdminLogin)

module.exports = router;