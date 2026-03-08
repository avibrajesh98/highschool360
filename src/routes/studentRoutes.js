const express = require('express');
const router = express.Router();
const {
  getIndividualStudentData,
  getMyTeachers,
  getTimeTable,
  getStudyMaterial,
  getLibraryRecords,
  getDailyClassAttendance,
  getStudentClassMonthlyAT,
  getStudentExamSchedule,
  getExamSchedule,
  getExamEvaluation,
  getViewExamEvaluation,
  getStudentClassEvaluation,
  saveTimeTable,
  saveStudyMaterial,
  deleteStudyMaterial,
  getAllocationSubject,
  getStudentDashboard,
  getStudentExamResult,
  getHomework,
  getStudentFees,
  getIndividualRanking,
  getAllocateSubject
} = require('../controllers/studentController');
// const { protect, authorize } = require('../middleware/auth');

// router.route('/')
//   .get(protect, getAllStudents)
//   .post(protect, authorize('admin'), createStudent);

// router.route('/:id')
//   .get(protect, getStudent)
//   .put(protect, authorize('admin'), updateStudent)
//   .delete(protect, authorize('admin'), deleteStudent);

// router.post('/enroll', protect, authorize('admin'), enrollInCourse);

router.post('/GetIndividualStudentData', getIndividualStudentData);
router.post('/GetMyTeachers', getMyTeachers);
router.post('/GetTimeTable', getTimeTable);
router.post('/GetStudyMaterial', getStudyMaterial);
router.post('/GetLibraryRecords', getLibraryRecords);
router.post('/GetDailyClassAttendance',  getDailyClassAttendance);
router.post('/GetStudentClassMonthlyAT', getStudentClassMonthlyAT);
router.post('/GetStudentExamSchedule', getStudentExamSchedule);
router.post('/GetExamSchedule', getExamSchedule);

router.post('/GetExamEvaluation', getExamEvaluation);
router.post('/GetViewExamEvaluation', getViewExamEvaluation);
router.post('/GetStudentClassEvaluation', getStudentClassEvaluation);
router.post('/SaveTimeTable', saveTimeTable);
router.post('/SaveStudyMaterial', saveStudyMaterial);
router.post('/DeleteStudyMaterial', deleteStudyMaterial);

router.post('/GetAllocationSubject', getAllocationSubject);
router.post('/GetStudentDashboard', getStudentDashboard);
router.post('/GetStudentExamResult', getStudentExamResult);
router.post('/GetHomework', getHomework);
router.post('/GetStudentFees', getStudentFees);
router.post('/GetIndividualRanking', getIndividualRanking);
router.post('/GetAllocateSubject', getAllocateSubject);
module.exports = router;