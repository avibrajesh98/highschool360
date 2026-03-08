const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const commonRoutes = require('./commonRoutes');
const staffRoutes = require('./staffRoutes');
const studentRoutes = require('./studentRoutes');
const superadminRoutes = require('./superadminRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/common', commonRoutes);
router.use('/staff', staffRoutes);
router.use('/student', studentRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/admin', adminRoutes);

module.exports = router;