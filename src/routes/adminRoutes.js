const express = require('express');
const router = express.Router();
const {
  getStudentAllRecords,
  saveStudentDetail,
  deleteStudent,
  getParentData,
  saveTeacher,
  getTeacherRecords,
  deleteTeacher,
  getMultipleLectures,
  saveClassMaster,
  deleteClassMaster,
  getClassMaster,
  saveSubject,
  deleteSubject,
  getSubjectRecords,
  getClassWithDiv,
  getAcademicYear,
  saveAcademicYear,
  deleteAcademicYear,
  getManageTeacher,
  saveManageTeacher,
  deleteManageTeacher,
  getClassTeacher,
  saveClassTeacher,
  deleteClassTeacherRecord,
  getAllocateSubject,
  saveAllocatedSubject,
  deleteAllocatedSubject,
  getTeacherBySubject,
  saveTimeTable,
  getTimeTable,
  getActiveYearTeacherBySubject,
  getStudentClassDailyAT,
  insertStudentClassDailyAT,
  getAtYearDdl,
  getStudentClassMonthlyAT,
  getStaffDailyAT,
  insertStaffDailyAT,
  getStaffMonthlyAT,
  getExamList,
  saveExamType,
  deleteExamType,
  getExamScheduleList,
  getExamSchedule,
  saveExamSchedule,
  updateExamSchedule,
  deleteExamRecord,
  deleteExam,
  getExamEvaluation,
  getViewExamEvaluation,
  insertExamEvaluation,
  updateExamEvaluation,
  getStudentClassEvaluation,

  getExamNameByAcademicYear,
  getExamByExamSchedule,
  getExamGrades,
  saveExamGrade,
  deleteExamGrade,

  
  getExamGradeRange,
  saveExamGradeRange,
  deleteExamGradeRange,
  getInvoiceType,
  saveInvoiceType,
  deleteInvoiceType,
  getStudentByClass,
  getInvoice,
  saveInvoice,
  deleteInvoice,
  getExpenseType,
  saveExpenseType,
  deleteExpenseType,
  getExpense,
  saveExpense,
  deleteExpense,
  getLibrary,
  saveLibrary,
  deleteLibrary,
    getNoticeType,
  saveNoticeType,
  deleteNoticeType,
  getNotice,
  saveNotice,
  deleteNotice,
  getTransport,
  saveTransport,
  deleteTransport,
  getActiveAcademicYear
} = require('../controllers/adminController');
 

router.post('/GetStudentAllRecords', getStudentAllRecords);
router.post('/SaveStudentDetail', saveStudentDetail);
router.post('/DeleteStudent', deleteStudent);
router.post('/GetParentData', getParentData);

router.post('/SaveTeacher', saveTeacher);
router.post('/GetTeacherRecords', getTeacherRecords);
router.post('/DeleteTeacher', deleteTeacher);
router.post('/GetMultipleLectures', getMultipleLectures);
router.post('/SaveClassMaster',saveClassMaster);
router.post('/DeleteClassMaster',deleteClassMaster);
router.post('/GetClassMaster',getClassMaster);
router.post('/SaveSubject',saveSubject);
router.post('/DeleteSubject',deleteSubject);
router.post('/GetSubjectRecords',getSubjectRecords);
router.post('/GetClassWithDiv',getClassWithDiv);
router.post('/GetAcademicYear',getAcademicYear);
router.post('/GetActiveAcademicYear',getActiveAcademicYear);
router.post('/SaveAcademicYear',saveAcademicYear);
router.post('/DeleteAcademicYear',deleteAcademicYear);
router.post('/GetManageTeacher',getManageTeacher);
router.post('/SaveManageTeacher',saveManageTeacher);
router.post('/DeleteManageTeacher',deleteManageTeacher);
router.post('/GetClassTeacher',getClassTeacher);
router.post('/SaveClassTeacher',saveClassTeacher);
router.post("/DeleteClassTeacherRecord", deleteClassTeacherRecord);
router.post('/GetAllocateSubject',getAllocateSubject);
router.post('/SaveAllocatedSubject',saveAllocatedSubject);
router.post('/DeleteAllocatedSubject',deleteAllocatedSubject);
router.post('/GetTeacherBySubject',getTeacherBySubject);
router.post('/SaveTimeTable',saveTimeTable);
router.post('/GetTimeTable',getTimeTable);
router.post('/GetActiveYearTeacherBySubject',getActiveYearTeacherBySubject);
router.post('/GetStudentClassDailyAT',getStudentClassDailyAT);
router.post('/InsertStudentClassDailyAT',insertStudentClassDailyAT);
router.post('/GetAtYearDdl',getAtYearDdl);
router.post('/GetStudentClassMonthlyAT',getStudentClassMonthlyAT);
router.post('/GetStaffDailyAT',getStaffDailyAT);
router.post('/InsertStaffDailyAT',insertStaffDailyAT);
router.post('/GetStaffMonthlyAT',getStaffMonthlyAT);
router.post('/GetExamList',getExamList);
router.post('/SaveExamType', saveExamType);
router.post('/DeleteExamType', deleteExamType);
router.post('/GetExamScheduleList', getExamScheduleList);
router.post('/GetExamSchedule', getExamSchedule);
router.post('/SaveExamSchedule', saveExamSchedule);
router.post('/UpdateExamSchedule', updateExamSchedule);
router.post('/DeleteExamRecord', deleteExamRecord);
router.post('/DeleteExam', deleteExam);
router.post('/GetExamEvaluation',getExamEvaluation);
router.post('/GetViewExamEvaluation',getViewExamEvaluation);
router.post('/InsertExamEvaluation',insertExamEvaluation);
router.post('/UpdateExamEvaluation',updateExamEvaluation);
router.post('/GetStudentClassEvaluation',getStudentClassEvaluation);
router.post('/GetExamNameByAcademicYear', getExamNameByAcademicYear);
router.post('/GetExamByExamSchedule', getExamByExamSchedule);
router.post('/GetExamGrades', getExamGrades);
router.post('/SaveExamGrade', saveExamGrade);
router.post('/DeleteExamGrade', deleteExamGrade);
router.post('/GetExamGradeRange',getExamGradeRange );
router.post('/SaveExamGradeRange',saveExamGradeRange );
router.post('/DeleteExamGradeRange',deleteExamGradeRange );
router.post('/GetInvoiceType',getInvoiceType );
router.post('/SaveInvoiceType',saveInvoiceType );
router.post('/DeleteInvoiceType',deleteInvoiceType );
router.post('/GetStudentByClass',getStudentByClass );
router.post('/GetInvoice',getInvoice );
router.post('/SaveInvoice',saveInvoice );
router.post('/DeleteInvoice',deleteInvoice );
router.post('/GetExpenseType',getExpenseType );
router.post('/SaveExpenseType',saveExpenseType );
router.post('/DeleteExpenseType',deleteExpenseType );
router.post('/GetExpense',getExpense );
router.post('/SaveExpense',saveExpense );
router.post('/DeleteExpense',deleteExpense );
router.post('/GetLibrary',getLibrary );
router.post('/SaveLibrary',saveLibrary );
router.post('/DeleteLibrary',deleteLibrary );
router.post('/GetNoticeType',getNoticeType);
router.post('/SaveNoticeType',saveNoticeType);
router.post('/DeleteNoticeType',deleteNoticeType);
router.post('/GetNotice',getNotice);
router.post('/SaveNotice',saveNotice);
router.post('/DeleteNotice',deleteNotice);
router.post('/GetTransport',getTransport);
router.post('/SaveTransport',saveTransport);
router.post('/DeleteTransport',deleteTransport);
// router.post('/', );
// router.post('/', );
// router.post('/', );
// router.post('/', );
// router.post('/', );
// router.post('/', );
// router.post('/', );
// router.post('/', );
// router.post('/', );


module.exports = router; 