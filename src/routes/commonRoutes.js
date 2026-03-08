const express = require('express');
const router = express.Router();
const { getRefCodes, getCityRefCodes, getStateRefCodes, getWeekDays } = require('../controllers/commonController');
const { protect } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);

router.post('/GetRefCodes', getRefCodes);
router.post('/GetStateRefCodes', getStateRefCodes);
router.post('/GetCityRefCodes', getCityRefCodes);
router.post('/GetWeekDays', getWeekDays);


module.exports = router;