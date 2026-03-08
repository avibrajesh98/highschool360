// const sequelize = require('../config/sequelize');
// const { DataTypes } = require('sequelize');
 
// // Import all models
// const Student = require('./Student')(sequelize, DataTypes);
// const Teacher = require('./Teacher')(sequelize, DataTypes);
// const Course = require('./Course')(sequelize, DataTypes);
// const Class = require('./Class')(sequelize, DataTypes);
// const Enrollment = require('./Enrollment')(sequelize, DataTypes);
// const User = require('./User')(sequelize, DataTypes);

// // Define associations
// // Student-Course (Many-to-Many through Enrollment)
// Student.belongsToMany(Course, { 
//   through: Enrollment, 
//   foreignKey: 'studentId',
//   as: 'courses' 
// });
// Course.belongsToMany(Student, { 
//   through: Enrollment, 
//   foreignKey: 'courseId',
//   as: 'students' 
// });

// // Teacher-Course (One-to-Many)
// Teacher.hasMany(Course, { 
//   foreignKey: 'teacherId',
//   as: 'courses' 
// });
// Course.belongsTo(Teacher, { 
//   foreignKey: 'teacherId',
//   as: 'teacher' 
// });

// // Class-Student (One-to-Many)
// Class.hasMany(Student, { 
//   foreignKey: 'classId',
//   as: 'students' 
// });
// Student.belongsTo(Class, { 
//   foreignKey: 'classId',
//   as: 'class' 
// });

// // Enrollment associations for direct access
// Enrollment.belongsTo(Student, { foreignKey: 'studentId' });
// Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// module.exports = {
//   sequelize,
//   Student,
//   Teacher,
//   Course,
//   Class,
//   Enrollment,
//   User
// };



const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');
 
// Import all models
// const number = require("./number")(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const tbl_super_admin = require("./tbl_super_admin")(sequelize, DataTypes);
const tbl_school = require("./tbl_school")(sequelize, DataTypes);
const tbl_academic_year = require("./tbl_academic_year")(sequelize, DataTypes);
const tbl_class_master = require("./tbl_class_master")(sequelize, DataTypes);
const tbl_student_info = require("./tbl_student_info")(sequelize, DataTypes);
const tbl_staff = require("./tbl_staff")(sequelize, DataTypes);
const tbl_class_teacher = require("./tbl_class_teacher")(sequelize, DataTypes);
const tbl_country_city_code = require("./tbl_country_city_code")(sequelize, DataTypes);
const tbl_country_state_code = require("./tbl_country_state_code")(sequelize, DataTypes);

const tbl_subject_master = require("./tbl_subject_master")(sequelize, DataTypes);
const tbl_exam_type = require("./tbl_exam_type")(sequelize, DataTypes);
const tbl_exam_schedule = require("./tbl_exam_schedule")(sequelize, DataTypes);
const tbl_exam_schedule_assign = require("./tbl_exam_schedule_assign")(sequelize, DataTypes);
const tbl_exam_evaluation = require("./tbl_exam_evaluation")(sequelize, DataTypes);
const tbl_exam_grades = require("./tbl_exam_grades")(sequelize, DataTypes);

const tbl_expense_master = require("./tbl_expense_master")(sequelize, DataTypes);
const tbl_expense_records = require("./tbl_expense_records")(sequelize, DataTypes);
const tbl_grade_range = require("./tbl_grade_range")(sequelize, DataTypes);
const tbl_invoice_master = require("./tbl_invoice_master")(sequelize, DataTypes);
const tbl_invoice_records = require("./tbl_invoice_records")(sequelize, DataTypes);
const tbl_library = require("./tbl_library")(sequelize, DataTypes);

const tbl_notice_type = require("./tbl_notice_type")(sequelize, DataTypes);
const tbl_notice = require("./tbl_notice")(sequelize, DataTypes);
const tbl_parent = require("./tbl_parent")(sequelize, DataTypes);
const tbl_principal_info = require("./tbl_principal_info")(sequelize, DataTypes);
const tbl_ref_codes = require("./tbl_ref_codes")(sequelize, DataTypes);

const tbl_staff_attendance = require("./tbl_staff_attendance")(sequelize, DataTypes);
const tbl_student_attendance = require("./tbl_student_attendance")(sequelize, DataTypes);

const tbl_student_manage = require("./tbl_student_manage")(sequelize, DataTypes);
const tbl_study_material = require("./tbl_study_material")(sequelize, DataTypes);
const tbl_study_material_evaluation = require("./tbl_study_material_evaluation")(sequelize, DataTypes);
const tbl_subject_allocation = require("./tbl_subject_allocation")(sequelize, DataTypes);
const tbl_teacher_manage = require("./tbl_teacher_manage")(sequelize, DataTypes);
const tbl_timetable = require("./tbl_timetable")(sequelize, DataTypes);
const tbl_timetable_assign = require("./tbl_timetable_assign")(sequelize, DataTypes);
const tbl_transport = require("./tbl_transport")(sequelize, DataTypes);

// Define associations
  tbl_class_teacher.belongsTo(tbl_academic_year, { as: "ct_ay", foreignKey: "ct_ay_id"});
  tbl_academic_year.hasMany(tbl_class_teacher, { as: "tbl_class_teachers", foreignKey: "ct_ay_id"});
  tbl_exam_schedule.belongsTo(tbl_academic_year, { as: "es_ay", foreignKey: "es_ay_id"});
  tbl_academic_year.hasMany(tbl_exam_schedule, { as: "tbl_exam_schedules", foreignKey: "es_ay_id"});
  tbl_expense_records.belongsTo(tbl_academic_year, { as: "er_ay", foreignKey: "er_ay_id"});
  tbl_academic_year.hasMany(tbl_expense_records, { as: "tbl_expense_records", foreignKey: "er_ay_id"});
  tbl_academic_year.hasMany(tbl_staff, { as: "tbl_staffs", foreignKey: "st_ay_id"});
  
  tbl_academic_year.hasMany(tbl_student_info, { as: "tbl_student_infos", foreignKey: "si_ay_id"});
  tbl_student_manage.belongsTo(tbl_academic_year, { as: "sm_ay", foreignKey: "sm_ay_id"});
  tbl_academic_year.hasMany(tbl_student_manage, { as: "tbl_student_manages", foreignKey: "sm_ay_id"});
  tbl_subject_allocation.belongsTo(tbl_academic_year, { as: "subject_academic_year", foreignKey: "sa_ay_id"});
  tbl_academic_year.hasMany(tbl_subject_allocation, { as: "tbl_subject_allocations", foreignKey: "sa_ay_id"});
  tbl_teacher_manage.belongsTo(tbl_academic_year, { as: "tm_ay", foreignKey: "tm_ay_id"});
  tbl_academic_year.hasMany(tbl_teacher_manage, { as: "tbl_teacher_manages", foreignKey: "tm_ay_id"});

  tbl_class_master.hasMany(tbl_class_teacher, { as: "tbl_class_teachers", foreignKey: "ct_c_id"});
  tbl_exam_schedule.belongsTo(tbl_class_master, { as: "es_c", foreignKey: "es_c_id"});
  tbl_class_master.hasMany(tbl_exam_schedule, { as: "tbl_exam_schedules", foreignKey: "es_c_id"});
  tbl_invoice_records.belongsTo(tbl_class_master, { as: "ir_c", foreignKey: "ir_c_id"});
  tbl_class_master.hasMany(tbl_invoice_records, { as: "tbl_invoice_records", foreignKey: "ir_c_id"});
  tbl_study_material.belongsTo(tbl_class_master, { as: "sm_c", foreignKey: "sm_c_id"});
  tbl_class_master.hasMany(tbl_study_material, { as: "tbl_study_materials", foreignKey: "sm_c_id"});
  tbl_subject_allocation.belongsTo(tbl_class_master, { as: "sa_c", foreignKey: "sa_c_id"});
  tbl_class_master.hasMany(tbl_subject_allocation, { as: "tbl_subject_allocations", foreignKey: "sa_c_id"});
  tbl_grade_range.belongsTo(tbl_exam_grades, { as: "grade_exam", foreignKey: "gr_eg_id"});
  tbl_exam_grades.hasMany(tbl_grade_range, { as: "tbl_grade_ranges", foreignKey: "gr_eg_id"});
  tbl_exam_schedule_assign.belongsTo(tbl_exam_schedule, { as: "esa_e", foreignKey: "esa_es_id"});
  tbl_exam_schedule.hasMany(tbl_exam_schedule_assign, { as: "tbl_exam_schedule_assigns", foreignKey: "esa_es_id"});
  tbl_exam_evaluation.belongsTo(tbl_exam_schedule_assign, { as: "ee_esa", foreignKey: "ee_esa_id"});
  tbl_exam_schedule_assign.hasMany(tbl_exam_evaluation, { as: "tbl_exam_evaluations", foreignKey: "ee_esa_id"});
  tbl_exam_schedule.belongsTo(tbl_exam_type, { as: "es_et", foreignKey: "es_et_id"});
  tbl_exam_type.hasMany(tbl_exam_schedule, { as: "tbl_exam_schedules", foreignKey: "es_et_id"});
  tbl_expense_records.belongsTo(tbl_expense_master, { as: "er_e", foreignKey: "er_e_id"});
  tbl_expense_master.hasMany(tbl_expense_records, { as: "tbl_expense_records", foreignKey: "er_e_id"});
  tbl_invoice_records.belongsTo(tbl_invoice_master, { as: "ir_i", foreignKey: "ir_i_id"});
  tbl_invoice_master.hasMany(tbl_invoice_records, { as: "tbl_invoice_records", foreignKey: "ir_i_id"});
  tbl_notice.belongsTo(tbl_notice_type, { as: "n_nt", foreignKey: "n_nt_id"});
  tbl_notice_type.hasMany(tbl_notice, { as: "tbl_notices", foreignKey: "n_nt_id"});
  tbl_academic_year.belongsTo(tbl_school, { as: "ay_sc", foreignKey: "ay_sc_id"});
  tbl_school.hasMany(tbl_academic_year, { as: "tbl_academic_years", foreignKey: "ay_sc_id"});
  tbl_exam_grades.belongsTo(tbl_school, { as: "eg_sc", foreignKey: "eg_sc_id"});
  tbl_school.hasMany(tbl_exam_grades, { as: "tbl_exam_grades", foreignKey: "eg_sc_id"});
  tbl_exam_type.belongsTo(tbl_school, { as: "et_sc", foreignKey: "et_sc_id"});
  tbl_school.hasMany(tbl_exam_type, { as: "tbl_exam_types", foreignKey: "et_sc_id"});
  tbl_expense_master.belongsTo(tbl_school, { as: "e_sc", foreignKey: "e_sc_id"});
  tbl_school.hasMany(tbl_expense_master, { as: "tbl_expense_masters", foreignKey: "e_sc_id"});
  tbl_expense_records.belongsTo(tbl_school, { as: "er_sc", foreignKey: "er_sc_id"});
  tbl_school.hasMany(tbl_expense_records, { as: "tbl_expense_records", foreignKey: "er_sc_id"});
  tbl_invoice_master.belongsTo(tbl_school, { as: "i_sc", foreignKey: "i_sc_id"});
  tbl_school.hasMany(tbl_invoice_master, { as: "tbl_invoice_masters", foreignKey: "i_sc_id"});
  tbl_library.belongsTo(tbl_school, { as: "l_sc", foreignKey: "l_sc_id"});
  tbl_school.hasMany(tbl_library, { as: "tbl_libraries", foreignKey: "l_sc_id"});
  tbl_notice.belongsTo(tbl_school, { as: "n_sc", foreignKey: "n_sc_id"});
  tbl_school.hasMany(tbl_notice, { as: "tbl_notices", foreignKey: "n_sc_id"});
  tbl_notice_type.belongsTo(tbl_school, { as: "nt_sc", foreignKey: "nt_sc_id"});
  tbl_school.hasMany(tbl_notice_type, { as: "tbl_notice_types", foreignKey: "nt_sc_id"});
  tbl_parent.belongsTo(tbl_school, { as: "p_sc", foreignKey: "p_sc_id"});
  tbl_school.hasMany(tbl_parent, { as: "tbl_parents", foreignKey: "p_sc_id"});
  tbl_staff.belongsTo(tbl_school, { as: "st_sc", foreignKey: "st_sc_id"});
  tbl_school.hasMany(tbl_staff, { as: "tbl_staffs", foreignKey: "st_sc_id"});
  tbl_staff_attendance.belongsTo(tbl_school, { as: "satt_sc", foreignKey: "satt_sc_id"});
  tbl_school.hasMany(tbl_staff_attendance, { as: "tbl_staff_attendances", foreignKey: "satt_sc_id"});
  tbl_student_info.belongsTo(tbl_school, { as: "si_sc", foreignKey: "si_sc_id"});
  tbl_school.hasMany(tbl_student_info, { as: "tbl_student_infos", foreignKey: "si_sc_id"});
  tbl_study_material.belongsTo(tbl_school, { as: "sm_sc", foreignKey: "sm_sc_id"});
  tbl_school.hasMany(tbl_study_material, { as: "tbl_study_materials", foreignKey: "sm_sc_id"});
  tbl_subject_master.belongsTo(tbl_school, { as: "s_sc", foreignKey: "s_sc_id"});
  tbl_school.hasMany(tbl_subject_master, { as: "tbl_subject_masters", foreignKey: "s_sc_id"});
  tbl_timetable.belongsTo(tbl_school, { as: "ti_sc", foreignKey: "ti_sc_id"});
  tbl_school.hasMany(tbl_timetable, { as: "tbl_timetables", foreignKey: "ti_sc_id"});
  tbl_transport.belongsTo(tbl_school, { as: "tr_sc", foreignKey: "tr_sc_id"});
  tbl_school.hasMany(tbl_transport, { as: "tbl_transports", foreignKey: "tr_sc_id"});
  tbl_class_teacher.belongsTo(tbl_staff, { as: "ct_st", foreignKey: "ct_st_id"});
  tbl_staff.hasMany(tbl_class_teacher, { as: "tbl_class_teachers", foreignKey: "ct_st_id"});
  tbl_staff_attendance.belongsTo(tbl_staff, { as: "satt_st", foreignKey: "satt_st_id"});
  tbl_staff.hasMany(tbl_staff_attendance, { as: "tbl_staff_attendances", foreignKey: "satt_st_id"});
  tbl_study_material.belongsTo(tbl_staff, { as: "sm_st", foreignKey: "sm_st_id"});
  tbl_staff.hasMany(tbl_study_material, { as: "tbl_study_materials", foreignKey: "sm_st_id"});
  tbl_subject_allocation.belongsTo(tbl_staff, { as: "sa_st", foreignKey: "sa_st_id"});
  tbl_staff.hasMany(tbl_subject_allocation, { as: "tbl_subject_allocations", foreignKey: "sa_st_id"});
  tbl_teacher_manage.belongsTo(tbl_staff, { as: "tm_st", foreignKey: "tm_st_id"});
  tbl_staff.hasMany(tbl_teacher_manage, { as: "tbl_teacher_manages", foreignKey: "tm_st_id"});
  tbl_timetable_assign.belongsTo(tbl_staff, { as: "ta_st", foreignKey: "ta_st_id"});
  tbl_staff.hasMany(tbl_timetable_assign, { as: "tbl_timetable_assigns", foreignKey: "ta_st_id"});
  
  tbl_invoice_records.belongsTo(tbl_student_info, { as: "ir_si", foreignKey: "ir_si_id"});
  tbl_student_info.hasMany(tbl_invoice_records, { as: "tbl_invoice_records", foreignKey: "ir_si_id"});
  tbl_student_manage.belongsTo(tbl_student_info, { as: "sm_si", foreignKey: "sm_si_id"});
  tbl_student_info.hasMany(tbl_student_manage, { as: "tbl_student_manages", foreignKey: "sm_si_id"});
  tbl_exam_schedule_assign.belongsTo(tbl_subject_master, { as: "esa", foreignKey: "esa_s_id"});
  tbl_subject_master.hasMany(tbl_exam_schedule_assign, { as: "tbl_exam_schedule_assigns", foreignKey: "esa_s_id"});
  tbl_subject_allocation.belongsTo(tbl_subject_master, { as: "sa_subject", foreignKey: "sa_s_id"});
  tbl_subject_master.hasMany(tbl_subject_allocation, { as: "tbl_subject_allocations", foreignKey: "sa_s_id"});
  tbl_teacher_manage.belongsTo(tbl_subject_master, { as: "tm_", foreignKey: "tm_s_id"});
  tbl_subject_master.hasMany(tbl_teacher_manage, { as: "tbl_teacher_manages", foreignKey: "tm_s_id"});
  tbl_school.belongsTo(tbl_super_admin, { as: "sc_su", foreignKey: "sc_su_id"});
  tbl_super_admin.hasMany(tbl_school, { as: "tbl_schools", foreignKey: "sc_su_id"});
  tbl_timetable_assign.belongsTo(tbl_timetable, { as: "ta_ti", foreignKey: "ta_ti_id"});
  tbl_timetable.hasMany(tbl_timetable_assign, { as: "tbl_timetable_assigns", foreignKey: "ta_ti_id"});

  tbl_student_info.belongsTo(tbl_ref_codes, {
    foreignKey: "si_gender",
    targetKey: "rc_code",
    as: "genderdata"
  });

  // Student → Class
  tbl_student_info.belongsTo(tbl_class_master, {
    foreignKey: "si_c_id",
    as: "classdata"
  });

  // Student → Academic Year
  tbl_student_info.belongsTo(tbl_academic_year, {
    foreignKey: "si_ay_id",
    as: "student_aydata"
  });

  // Class Teacher → Class
  tbl_class_teacher.belongsTo(tbl_class_master, {
    foreignKey: "ct_c_id",
    as: "ct_c"
  });

  // Student → Class Teacher (same class + same AY)
  tbl_student_info.belongsTo(tbl_class_teacher, {
    foreignKey: "si_c_id",
    targetKey: "ct_c_id",
    as: "teacherdata"
  });

  tbl_staff.belongsTo(tbl_ref_codes, {
    foreignKey: "st_gender",
    targetKey: "rc_code",
    as: "genderdata"
  });

  // Staff → StaffType (ref_codes)
  tbl_staff.belongsTo(tbl_ref_codes, {
    foreignKey: "st_type",
    targetKey: "rc_code",
    as: "stafftypedata"
  });

  // Staff → Academic Year
  tbl_staff.belongsTo(tbl_academic_year, {
    foreignKey: "st_ay_id",
    as: "staff_aydata"
  });

  // STUDENT → ATTENDANCE

  tbl_student_attendance.belongsTo(tbl_student_info, {
    foreignKey: "sat_si_id",
    as:"student"
  });

  tbl_academic_year.hasMany(tbl_student_info, {
    foreignKey: "si_ay_id",
    as: "students"
  });

  // CLASS TEACHER → STAFF
  tbl_class_teacher.belongsTo(tbl_staff, {
    foreignKey: "ct_st_id"
  });
  tbl_staff.hasMany(tbl_class_teacher, {
    foreignKey: "ct_st_id"
  });

  // STAFF → REF CODES (Gender)
  tbl_staff.belongsTo(tbl_ref_codes, {
    foreignKey: "st_gender",
    targetKey: "rc_code",
    as: "gender"
  });

  // STAFF → REF CODES (Staff Type)
  tbl_staff.belongsTo(tbl_ref_codes, {
    foreignKey: "st_type",
    targetKey: "rc_code",
    as: "staffType"
  });

  tbl_exam_evaluation.belongsTo(tbl_class_master, {
    foreignKey: "ee_c_id",
    as: "evaluation_class"
  });
  tbl_class_master.hasMany(tbl_exam_evaluation, {
    foreignKey: "ee_c_id",
    as: "tbl_exam_evaluations"
  });

  tbl_exam_evaluation.belongsTo(tbl_student_info, {
    foreignKey: "ee_si_id",
    as: "exam_evaluation_student"
  });

  tbl_student_info.hasMany(tbl_exam_evaluation, {
    foreignKey: "ee_si_id",
    as: "tbl_exam_evaluations"
  });

  tbl_study_material.belongsTo(tbl_subject_allocation, {
    foreignKey: "sm_c_id",
    as: "study_material_class"
  });

  tbl_class_master.belongsTo(tbl_ref_codes, {
    foreignKey: "c_name",
    targetKey: "rc_code",
    as: "refcode"
  });

  tbl_invoice_records.belongsTo(tbl_ref_codes, {
    foreignKey: "ir_status",
    targetKey: "rc_code",
    as: "payment_mode"
  });

  tbl_invoice_records.belongsTo(tbl_ref_codes, {
    foreignKey: "ir_status",
    targetKey: "rc_code",
    as: "payment_status"
  });


  

module.exports = {
  sequelize,
  tbl_academic_year,
  tbl_class_master,
  tbl_class_teacher,
  tbl_country_city_code,
  tbl_country_state_code,
  tbl_exam_evaluation,
  tbl_exam_grades,
  tbl_exam_schedule,
  tbl_exam_schedule_assign,
  tbl_exam_type,
  tbl_expense_master,
  tbl_expense_records,
  tbl_grade_range,
  tbl_invoice_master,
  tbl_invoice_records,
  tbl_library,
  tbl_notice,
  tbl_notice_type,
  tbl_parent,
  tbl_principal_info,
  tbl_ref_codes,
  tbl_school,
  tbl_staff,
  tbl_staff_attendance,
  tbl_student_attendance,
  tbl_student_info,
  tbl_student_manage,
  tbl_study_material,
  tbl_study_material_evaluation,
  tbl_subject_allocation,
  tbl_subject_master,
  tbl_super_admin,
  tbl_teacher_manage,
  tbl_timetable,
  tbl_timetable_assign,
  tbl_transport,
  User
};