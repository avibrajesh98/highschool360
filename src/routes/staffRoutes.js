const express = require('express');
const router = express.Router();
const { 
        getUserAllRecords, 
        getTeacherRecords, 
        getDailyClassAttendance, 
        getStudentClassMonthlyAT,
        getExamEvaluation,
        getViewExamEvaluation,
        getStudentClassEvaluation,
        saveTimeTable,
        getTimeTable,
        getTeachersBySubject,
        getStudyMaterial,
        saveStudyMaterial,
        deleteStudyMaterial,
        getHomework,
        saveHomework,
        evaluateHomework,
        insertHomeworkStatus,
        getTeacherTimeTable
    } = require('../controllers/staffController');
const { protect } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);

router.post('/GetUserAllRecords', getUserAllRecords);
router.post('/GetTeacherRecords', getTeacherRecords);
router.post('/GetDailyClassAttendance', getDailyClassAttendance);
router.post('/GetStudentClassMonthlyAT', getStudentClassMonthlyAT);
router.post('/GetExamEvaluation', getExamEvaluation);
router.post('/GetViewExamEvaluation', getViewExamEvaluation);
router.post('/GetStudentClassEvaluation', getStudentClassEvaluation);
router.post('/SaveTimeTable', saveTimeTable);
router.post('/GetTeacherTimeTable', getTeacherTimeTable);
// router.post('/GetTeachersBySubject', getTeachersBySubject);

router.post('/GetStudyMaterial', getStudyMaterial);
router.post('/SaveStudyMaterial', saveStudyMaterial);
router.post('/DeleteStudyMaterial', deleteStudyMaterial);

router.post('/GetHomework', getHomework);
router.post('/SaveHomework', saveHomework);
router.post('/EvaluateHomework', evaluateHomework);
router.post('/InsertHomeworkStatus', insertHomeworkStatus);



module.exports = router;