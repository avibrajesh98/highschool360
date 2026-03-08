const express = require('express');
const router = express.Router();
const {
  getSuperAdmin,
  saveSuperAdmin,
  deleteSuperAdmin,
  getSchoolDetails,
  getAcademicYearFromSchool,
  getSchoolDashboard
} = require('../controllers/superadminController');
 

router.post('/GetSuperAdmin', getSuperAdmin);
router.post('/SaveSuperAdmin', saveSuperAdmin)
router.post('/DeleteSuperAdmin', deleteSuperAdmin);
router.post('/GetSchoolDetails', getSchoolDetails);
router.post('/GetAcademicYearFromSchool', getAcademicYearFromSchool);
router.post('/GetSchoolDashboard', getSchoolDashboard);
module.exports = router; 