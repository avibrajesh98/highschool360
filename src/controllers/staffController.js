const jwt = require('jsonwebtoken');
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../models");
const { v4: uuidv4 } = require("uuid");

const { 
  tbl_ref_codes,
  tbl_class_master,
  tbl_class_teacher,
  tbl_academic_year,
  tbl_student_info,
  tbl_staff ,
  tbl_student_attendance,
  tbl_exam_schedule,
  tbl_exam_schedule_assign,
  tbl_subject_allocation,
  tbl_exam_evaluation,
  
  tbl_exam_grades,
  tbl_grade_range,
  tbl_subject_master,
  tbl_timetable,
  tbl_timetable_assign,
  tbl_teacher_manage,
  tbl_study_material,
  tbl_study_material_evaluation
} = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const getUserAllRecords = async (req, res) => {
  try {
    // {
    //   "schoolid": "48f70015-a254-454c-b5a9-2c34ac439ccf",
    //   "teacherid": "d0a0c89a-e74e-48db-88fb-d278d909f50d"
    // }
    const { schoolid, teacherid } = req.body;

    if (!schoolid || !teacherid) {
      return res.status(400).json({
        success: false,
        message: "schoolid and teacherid required",
      });
    }

    // 1️⃣ Get class + AY for the teacher
    const teacherClass = await tbl_class_teacher.findOne({
      where: { ct_st_id: teacherid },
      attributes: ["ct_c_id", "ct_id", "ct_ay_id"],
    });
    console.log('teacherClass :::> ',teacherClass);

    if (!teacherClass) {
      return res.json({ success: true, data: [] });
    }

    const classId = teacherClass.ct_c_id;
    const ayId = teacherClass.ct_ay_id;

    // 2️⃣ Fetch all students using pure ORM
    const students = await tbl_student_info.findAll({
      where: {
        si_sc_id: schoolid,
        si_c_id: classId,
        si_ay_id: ayId,
      },

      order: [["si_rollno", "ASC"]],

      include: [
        {
          model: tbl_ref_codes,
          as: "genderdata",
          attributes: ["rc_name", "rc_code"],
          where: { rc_type: "Gender" },
          required: false,
        },
        {
          model: tbl_class_master,
          as: "classdata",
          attributes: ["c_id", "c_name", "c_div"],
        },
        {
          model: tbl_academic_year,
          as: "student_aydata",
          attributes: ["ay_id", "ay_start_year", "ay_end_year"],
          where: { ay_status_id: 1 },
        },
        {
          model: tbl_class_teacher,
          as: "teacherdata",
          attributes: ["ct_id"],
          required: false,
        },
      ],
    });
    console.log('students :::> ',students);
    // 3️⃣ Format response (build image URL)
    const finalResult = students.map((s) => ({
      studentid: s.si_id,
      academicyearid: s.si_ay_id,
      academicyear: `${s.student_aydata.ay_start_year} - ${s.student_aydata.ay_end_year}`,
      firstname: s.si_first_name,
      middlename: s.si_middle_name,
      lastname: s.si_last_name,
      mothertongue: s.si_mother_tongue,
      bloodgroup: s.si_blood_group,
      rollno: s.si_rollno,
      studentmobilenumber: s.si_phone_number,
      birthdate: s.si_dob,
      studentemail: s.si_email_id,
      gender: s.genderdata?.rc_name || "",
      gendercode: s.si_gender,
      studentaddress: s.si_address,
      religion: s.si_religion,
      nationality: s.si_nationality,
      pincode: s.si_pin_code,
      states: s.si_state,
      city: s.si_city,
      createddate: s.si_create_dt,
      updateddate: s.si_update_dt,
      classnumber: s.classdata.c_name,
      classdiv: s.classdata.c_div,
      classid: s.classdata.c_id,
      imagename: s.si_image_url
        ? `http://localhost:56791/Image/StudentProfile/${s.si_id}/${s.si_image_url}`
        : "",
    }));

    return res.json({ success: true, data: finalResult });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getTeacherRecords =async (req, res) => {
  try {
    // {
    //   "schoolid": "8681826d-6a33-46e3-b512-9e4707030b1f,
    // }
    const { schoolid } = req.body;

    if (!schoolid) {
      return res.status(400).json({
        success: false,
        message: "schoolid is required",
      });
    }

    // 1️⃣ Fetch teachers via ORM
    const teachers = await tbl_staff.findAll({
      where: {
        st_sc_id: schoolid,
        st_type: "TC",        // only teachers
      },

      include: [
        {
          model: tbl_academic_year,
          as: "staff_aydata",
          attributes: ["ay_id", "ay_status_id"],
          where: { ay_status_id: 1 }, // Active year
        },
        {
          model: tbl_ref_codes,
          as: "genderdata",
          attributes: ["rc_name", "rc_code"],
          where: { rc_type: "Gender" },
          required: false,
        },
        {
          model: tbl_ref_codes,
          as: "stafftypedata",
          attributes: ["rc_name", "rc_code"],
          where: { rc_type: "Staff" },
          required: false,
        },
      ],
    });

    // 2️⃣ Format final result
    const finalResult = teachers.map((t) => ({
      teacherid: t.st_id,
      schoolid: t.st_sc_id,
      name: t.st_name,
      birthdate: t.st_dob,
      emailid: t.st_email_id,
      gender: t.genderdata?.rc_name || "",
      stafftype: t.stafftypedata?.rc_name || "",
      staffcode: t.st_type,
      gendercode: t.st_gender,
      mobilenumber: t.st_phone_number,
      address: t.st_address,
      imagename: t.st_image_url
        ? `http://localhost:56791/Image/TeacherProfile/${t.st_id}/${t.st_image_url}`
        : "",
    }));

    return res.json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    console.error("Teacher Records Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getDailyClassAttendance  = async(req, res) =>{
  try {
    // {
    //   "Id": "720d6336-d3c7-4a10-9391-d07d1a1aedd7",
    //   "AtDate": "2025-06-04 05:30:00+05:30",
    //   "TeacherId": "d0a0c89a-e74e-48db-88fb-d278d909f50d"
    // }
    const { Id, AtDate, TeacherId } = req.body;

    // 1️⃣ Check if teacher is assigned to class
    const isTeacherValid = await tbl_class_teacher.findOne({
      where: {
        ct_c_id: Id,
        ct_st_id: TeacherId
      }
    });

    if (!isTeacherValid) {
      return res.status(403).json({
        ErrorCode: 3,
        ErrorMessage: "Not Eligible To Take Attendance"
      });
    }

    // 2️⃣ Check if attendance already exists
    const dateOnly = AtDate.split(" ")[0];  // "2025-06-04"


    const attendanceExists = await tbl_student_attendance.findOne({
      where: {
        sat_c_id: Id,
        sat_date: {
          [Op.between]: [
            new Date(`${dateOnly}T00:00:00.000Z`),
            new Date(`${dateOnly}T23:59:59.999Z`)
          ]
        }
      }
    });

    // ------------------------
    // CASE 1: Attendance exists
    // ------------------------
    if (attendanceExists) {
      console.log('attendanceExists');
      const data = await tbl_student_attendance.findAll({
        where: {
          sat_c_id: Id,
          sat_date: AtDate
        },
        include: [
          {
            model: tbl_student_info,
            required: false,
            attributes: [
              "si_id",
              "si_sc_id",
              "si_first_name",
              "si_middle_name",
              "si_last_name",
              "si_rollno",
              "si_ay_id"
            ],
            include: [
              {
                model: tbl_academic_year,
                required: true,
                as: "student_aydata",
                where: { ay_status_id: 1 },
                attributes: []
              }
            ]
          }
        ],
        order: [[tbl_student_info, "si_rollno", "ASC"]]
      });
      console.log('Data Length',data.length);

      const response = data.map(x => ({
        Id: x.sat_id,
        StudentId: x.tbl_student_info.si_id,
        SchoolId: x.tbl_student_info.si_sc_id,
        FirstName:
          `${x.tbl_student_info.si_first_name} ${x.tbl_student_info.si_middle_name} ${x.tbl_student_info.si_last_name}`,
        RollNo: x.tbl_student_info.si_rollno,
        AcademicYearId: x.tbl_student_info.si_ay_id,
        Attend: x.sat_attendance_status,
        AtDate: x.sat_date
      }));

      return res.json(response);
    }

    // ------------------------
    // CASE 2: Attendance not taken yet
    // ------------------------
    const students = await tbl_student_info.findAll({
      where: {
        si_c_id: Id
      },
      include: [
        {
          model: tbl_academic_year,
          where: { ay_status_id: 1 },
          attributes: []
        }
      ],
      order: [["si_rollno", "ASC"]],
      attributes: [
        "si_id",
        "si_sc_id",
        "si_first_name",
        "si_middle_name",
        "si_last_name",
        "si_rollno",
        "si_ay_id"
      ]
    });

    const response = students.map(x => ({
      StudentId: x.si_id,
      SchoolId: x.si_sc_id,
      FirstName:
        `${x.si_first_name} ${x.si_middle_name} ${x.si_last_name}`,
      RollNo: x.si_rollno,
      AcademicYearId: x.si_ay_id
    }));

    return res.json(response);

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const getStudentClassMonthlyAT = async (req, res) => {
  try {
    // {
    //   "Id": "720d6336-d3c7-4a10-9391-d07d1a1aedd7",
    //   "TeacherId": "d0a0c89a-e74e-48db-88fb-d278d909f50d",
    //   "YEAR":"2025",
    //   "MONTH":"6"
    // }
    const { Id, TeacherId, YEAR, MONTH } = req.body;

    // ---------------------------------------------
    // 1️⃣ Check if teacher is assigned to the class
    // ---------------------------------------------
    const teacherAssigned = await tbl_class_teacher.findOne({
      where: {
        ct_c_id: Id,
        ct_st_id: TeacherId
      }
    });

    if (!teacherAssigned) {
      return res.json({
        ErrorCode: 3,
        ErrorMessage: "Not Eligible To Take Attendance"
      });
    }

    // ---------------------------------------------
    // 2️⃣ Fetch Students of class with Active AY
    // ---------------------------------------------
    const students = await tbl_student_info.findAll({
      where: { si_c_id: Id },
      include: [
        {
          model: tbl_academic_year,
          as: "student_aydata",
          where: { ay_status_id: 1 },
          attributes: []
        }
      ],
      order: [["si_rollno", "ASC"]],
      attributes: [
        ["si_id", "StudentId"],
        ["si_sc_id", "SchoolId"],
        [
          Sequelize.literal(
            "concat(si_first_name,' ',si_middle_name,' ',si_last_name)"
          ),
          "FirstName"
        ],
        ["si_rollno", "RollNo"],
        ["si_ay_id", "AcademicYearId"]
      ]
    });

    // ---------------------------------------------
    // 3️⃣ For each student → generate monthly attendance list
    // ---------------------------------------------
    const daysInMonth = new Date(YEAR, MONTH, 0).getDate();

    const finalResponse = [];

    for (let student of students) {
      let StudentAttendance = [];

      for (let day = 1; day <= daysInMonth; day++) {
        let dateStr = `${YEAR}-${String(MONTH).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

        // fetch attendance like stored procedure GetStudentAttendance
        const attendance = await tbl_student_attendance.findOne({
          where: {
            sat_si_id: student.get("StudentId"),
            sat_date: Sequelize.where(
              Sequelize.fn("date", Sequelize.col("sat_date")),
              "=",
              dateStr
            )
          },
          attributes: ["sat_attendance_status"]
        });

        StudentAttendance.push({
          DateNumber: day,
          Attend: attendance ? attendance.sat_attendance_status : null
        });
      }

      finalResponse.push({
        StudentId: student.get("StudentId"),
        SchoolId: student.get("SchoolId"),
        FirstName: student.get("FirstName"),
        RollNo: student.get("RollNo"),
        AcademicYearId: student.get("AcademicYearId"),
        StudentAttendance
      });
    }

    return res.json(finalResponse);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getExamEvaluation = async (req, res) => {
  // {
  //   "ExamScheduleId": "424c9ae7-7ac7-4139-8b92-d75348178288",
  //   "ExamId": "b4a4fd02-8e75-42b1-8350-629536790b71",
  //   "AcademicYearId":"8681826d-6a33-46e3-b512-9e4707030b1f",
  //   "TeacherId":"6a63cb81-84ab-4d7f-87ac-661e06a9b097"
  // }
  const { ExamScheduleId, ExamId, AcademicYearId, TeacherId } = req.body;

  try {
    // 1️⃣ Get ClassId from Exam Schedule
    const examSchedule = await tbl_exam_schedule.findOne({
      where: { es_id: ExamScheduleId },
      attributes: ["es_c_id"]
    });

    if (!examSchedule) {
      return res.json({ ErrorCode: "1", ErrorMessage: "Invalid ExamScheduleId" });
    }

    const classId = examSchedule.es_c_id;

    // 2️⃣ Get SubjectId from TBL_EXAM_SCHEDULE_ASSIGN
    const examAssign = await tbl_exam_schedule_assign.findOne({
      where: { esa_id: ExamId },
      attributes: ["esa_s_id"]
    });

    if (!examAssign) {
      return res.json({ ErrorCode: "2", ErrorMessage: "Invalid ExamId" });
    }

    const subjectId = examAssign.esa_s_id;

    // 3️⃣ Check Subject Allocation (Teacher eligibility)
    const teacherEligible = await tbl_subject_allocation.findOne({
      where: {
        sa_c_id: classId,
        sa_st_id: TeacherId,
        sa_s_id: subjectId
      },
      include: [
        {
          model: tbl_academic_year,
          as:"subject_academic_year",
          attributes: [],
          where: { ay_status_id: 1 }   // active AY
        }
      ]
    });

    if (!teacherEligible) {
      return res.json({
        ErrorCode: "4",
        ErrorMessage: "Not Eligible To Add Exam Evaluation"
      });
    }

    // 4️⃣ Check if exam evaluation already exists
    const evaluationExists = await tbl_exam_evaluation.findOne({
      where: { ee_esa_id: ExamId }
    });

    if (evaluationExists) {
      return res.json({
        ErrorCode: "3",
        ErrorMessage: "Go to View Tab For Records"
      });
    }

    // 5️⃣ Fetch Students of that class
    const students = await tbl_student_info.findAll({
      where: { si_c_id: classId },
      include: [
        {
          model: tbl_class_master,
          attributes: []
        }
      ],
      attributes: [
        "si_id",
        "si_sc_id",
        [
          Sequelize.literal(`CONCAT(si_first_name,' ',si_middle_name,' ',si_last_name)`),
          "FirstName"
        ],
        "si_rollno",
        "si_ay_id"
      ],
      order: [["si_rollno", "ASC"]]
    });

    // 6️⃣ Get MaxMarks
    const exam = await tbl_exam_schedule_assign.findOne({
      where: { esa_id: ExamId },
      attributes: ["esa_max_marks"]
    });

    const maxMarks = exam.esa_max_marks;

    // 7️⃣ Prepare response
    const response = students.map(s => ({
      StudentId: s.si_id,
      SchoolId: s.si_sc_id,
      FirstName: s.dataValues.FirstName,
      MaxMarks: maxMarks,
      RollNo: s.si_rollno
    }));

    return res.json(response);

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ErrorCode: "500",
      ErrorMessage: "Internal Server Error"
    });
  }
};

const getViewExamEvaluation = async (req, res) => {
  const { ExamScheduleId, ExamId, AcademicYearId, TeacherId } = req.body;

  try {
    // 1️⃣ Get ClassId from Exam Schedule
    const examSchedule = await tbl_exam_schedule.findOne({
      where: { es_id: ExamScheduleId },
      attributes: ["es_c_id"]
    });

    if (!examSchedule) {
      return res.json({ ErrorCode: "1", ErrorMessage: "Invalid ExamScheduleId" });
    }

    const classId = examSchedule.es_c_id;

    // 2️⃣ Get Max Marks
    const examAssign = await tbl_exam_schedule_assign.findOne({
      where: { esa_id: ExamId },
      attributes: ["esa_max_marks", "esa_s_id"]
    });

    if (!examAssign) {
      return res.json({ ErrorCode: "2", ErrorMessage: "Invalid ExamId" });
    }

    const maxMarks = examAssign.esa_max_marks;
    const subjectId = examAssign.esa_s_id;

    // 3️⃣ Check Teacher Eligibility
    const teacherEligible = await tbl_subject_allocation.findOne({
      where: {
        sa_c_id: classId,
        sa_st_id: TeacherId,
        sa_s_id: subjectId
      },
      include: [
        {
          model: tbl_academic_year,
          as:"subject_academic_year",
          attributes: [],
          where: { ay_status_id: 1 }
        }
      ]
    });

    if (!teacherEligible) {
      return res.json({
        ErrorCode: "4",
        ErrorMessage: "Not Eligible To View Exam Evaluation"
      });
    }

    // 4️⃣ Check if Evaluation Exists
    const evaluationExists = await tbl_exam_evaluation.findOne({
      where: { ee_esa_id: ExamId }
    });

    // ⭐ IF EVALUATION EXISTS → RETURN EVALUATION LIST
    if (evaluationExists) {
      const evaluationList = await tbl_exam_evaluation.findAll({
        where: { ee_esa_id: ExamId },
        include: [
          {
            model: tbl_student_info,
            as: "exam_evaluation_student",
            attributes: [
              "si_id",
              [
                Sequelize.literal(`CONCAT(si_first_name,' ',si_middle_name,' ',si_last_name)`),
                "FirstName"
              ],
              "si_rollno",
              "si_c_id"
            ]
          },
          {
            model: tbl_class_master,
            as: "evaluation_class",
            attributes: ["c_sc_id"]
          }
        ],
        order: [["exam_evaluation_student", "si_rollno", "ASC"]]
      });
      console.log('evaluationList ::::>',evaluationList);

      // 5️⃣ Map Response + Calculate Grade
      const response = await Promise.all(
        evaluationList.map(async x => ({
          Id: x.ee_id,
          Marks: x.ee_marks,
          GraceMarks: x.ee_grace_marks,
          MaxMarks: maxMarks,
          StudentId: x.exam_evaluation_student?.si_id,
          FirstName: x.exam_evaluation_student?.dataValues?.FirstName,
          RollNo: x.exam_evaluation_student?.si_rollno,
          Grade: await calculateGrade(x.evaluation_class?.c_sc_id, x.ee_marks) // CUSTOM FUNCTION
        }))
      );

      return res.json(response);
    }

    // ⭐ IF NO EVALUATION → RETURN STUDENT LIST (LIKE INSERT SCREEN)
    const students = await tbl_student_info.findAll({
      where: { si_c_id: classId },
      include: [{ model: tbl_class_master, attributes: [] }],
      attributes: [
        "si_id",
        "si_sc_id",
        [
          Sequelize.literal(`CONCAT(si_first_name,' ',si_middle_name,' ',si_last_name)`),
          "FirstName"
        ],
        "si_rollno"
      ],
      order: [["si_rollno", "ASC"]]
    });

    const response = students.map(s => ({
      StudentId: s.si_id,
      SchoolId: s.si_sc_id,
      FirstName: s.dataValues.FirstName,
      MaxMarks: maxMarks,
      RollNo: s.si_rollno
    }));

    return res.json(response);

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ErrorCode: "500",
      ErrorMessage: "Internal Server Error"
    });
  }
};

async function calculateGrade(schoolId, marks) {
  console.log('schoolId ::::> ', schoolId);
  console.log('marks ::::> ', marks);
  try {
    // 1️⃣ Check if the school has grade configuration
    const gradeExists = await tbl_exam_grades.count({
      where: { eg_sc_id: schoolId }
    });

    if (gradeExists === 0) {
      return "Add Grade";
    }

    // 2️⃣ Find the grade where marks lie between min & max range
    const gradeRange = await tbl_grade_range.findOne({
      include: [
        {
          model: tbl_exam_grades,
          as: "grade_exam",
          where: { eg_sc_id: schoolId },
          attributes: ["eg_name"]
        }
      ],
      where: {
        gr_min_range: { [Op.lte]: marks },
        gr_max_range: { [Op.gte]: marks }
      }
    });
    console.log(gradeRange);



    // 3️⃣ If no matching range -> mismatch
    if (!gradeRange) {
      return "Grade is mismatch";
    }

    // 4️⃣ Return grade name
    return gradeRange.grade_exam.eg_name;

  } catch (err) {
    console.log("Error in calculateGrade:", err);
    return "Grade Error";
  }
};

const getStudentClassEvaluation = async (req, res) => {
  const { Id, TeacherId, ExamScheduleId } = req.body; 
  // Id = ClassId  (same as @Id in SP)
  // TeacherId = Teacher ID
  // ExamScheduleId = ES_ID

  try {
    // 1️⃣ CHECK IF TEACHER IS ELIGIBLE (same as SP1)
    const teacherExists = await tbl_class_teacher.count({
      where: {
        ct_c_id: Id,
        ct_st_id: TeacherId
      }
    });

    if (teacherExists === 0) {
      return res.json([
        {
          ErrorCode: "3",
          ErrorMessage: "Not Eligible To Take Attendance"
        }
      ]);
    }

    // 2️⃣ GET STUDENT LIST (same as SP1)
    const students = await tbl_student_info.findAll({
      where: { si_c_id: Id },
      include: [
        {
          model: tbl_academic_year,
          as:'student_aydata',
          where: { ay_status_id: 1 },
          attributes: []
        }
      ],
      attributes: [
        ["si_id", "StudentId"],
        ["si_sc_id", "SchoolId"],
        [Sequelize.literal(`CONCAT(si_first_name,' ',si_middle_name,' ',si_last_name)`), "FirstName"],
        ["si_rollno", "RollNo"],
        ["si_ay_id", "AcademicYearId"]
      ],
      order: [["si_rollno", "ASC"]]
    });

    // If no students — return empty
    if (students.length === 0) {
      return res.json([]);
    }

    // 3️⃣ FOR EACH STUDENT → GET EVALUATION STATUS (same as SP2)
    const finalResponse = await Promise.all(
      students.map(async (student) => {
        const StudentId = student.dataValues.StudentId;

        // 3A️⃣ Calculate total marks
        const totalMarksQuery = await tbl_exam_schedule.findOne({
          where: { es_id: ExamScheduleId },
          include: [
            {
              model: tbl_exam_schedule_assign,
              as:'tbl_exam_schedule_assigns',
              include: [
                {
                  model: tbl_exam_evaluation,
                  as:'tbl_exam_evaluations',
                  include: [
                    {
                      model: tbl_student_info,
                      as: 'exam_evaluation_student',
                      where: { si_id: StudentId }
                    }
                  ]
                },
                {
                  model: tbl_subject_master,
                  as:'esa'
                }
              ]
            },
            {
              model: tbl_academic_year,
              as:'es_ay',
              where: { ay_status_id: 1 }
            }
          ]
        });

        // Calculate total marks manually
        let TotalMarks = 0;
        if (totalMarksQuery && totalMarksQuery.tbl_exam_schedule_assigns) {
          totalMarksQuery.tbl_exam_schedule_assigns.forEach(assign => {
            assign.tbl_exam_evaluations.forEach(evalItem => {
              TotalMarks += evalItem.ee_marks;
            });
          });
        }

        // 3B️⃣ Fetch Evaluation Records (same logic as SP2 second SELECT)
        const evaluationList = await tbl_exam_evaluation.findAll({
          include: [
            {
              model: tbl_exam_schedule_assign,
              as:'ee_esa',
              include: [
                {
                  model: tbl_subject_master,
                  as:'esa',
                  attributes: ["s_name"]
                }
              ]
            },
            {
              model: tbl_student_info,
              as:'exam_evaluation_student',
              where: { si_id: StudentId },
              attributes: ["si_first_name"]
            }
          ],
          attributes: [
            ["ee_marks", "Marks"]
          ],
          order: [
            [Sequelize.literal(`"ee_esa->esa"."s_name"`), "ASC"],
            [Sequelize.literal(`"exam_evaluation_student"."si_first_name"`), "ASC"]
          ]
        });

        const formattedResults = evaluationList.map(x => ({
          SubjectName: x.ee_esa.tbl_subject_master.s_name,
          FirstName: x.exam_evaluation_student.si_first_name,
          Marks: x.dataValues.Marks,
          TotalMarks: TotalMarks
        }));

        return {
          ...student.dataValues,
          ClassResult: formattedResults
        };
      })
    );

    return res.json(finalResponse);

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ErrorCode: "500",
      ErrorMessage: "Internal Server Error"
    });
  }
};

const saveTimeTable = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { ClassId, SchoolId, TeacherId, AcademicYearId, Weekdays } = req.body;

    // 1️⃣ Check if teacher belongs to class (TBL_CLASS_TEACHER)
    const isClassTeacher = await tbl_class_teacher.findOne({
      where: {
        ct_c_id: ClassId,
        ct_st_id: TeacherId
      }
    });

    if (!isClassTeacher) {
      return res.json({
        ErrorCode: "3",
        ErrorMessage: "Not Eligible To Change Attendance"
      });
    }

    // 2️⃣ Check if timetable already exists → delete timetable + assignments
    const existing = await tbl_timetable.findOne({
      where: { ti_c_id: ClassId }
    });

    if (existing) {
      await tbl_timetable_assign.destroy({
        where: { ta_ti_id: existing.ti_id },
        transaction: t
      });

      await tbl_timetable.destroy({
        where: { ti_c_id: ClassId },
        transaction: t
      });
    }

    // 3️⃣ Insert new timetable
    const newTimeTableId = uuidv4();

    await tbl_timetable.create(
      {
        ti_id: newTimeTableId,
        ti_sc_id: SchoolId,
        ti_c_id: ClassId,
        ti_ay_id: AcademicYearId,
        ti_create_dt: new Date(),
        ti_create_by: SchoolId,
        ti_update_dt: new Date(),
        ti_update_by: SchoolId
      },
      { transaction: t }
    );

    // 4️⃣ Insert Weekly Assigned Subjects (INSERT_Assign_TimeTable)
    for (const day of Weekdays) {
      for (const time of day.TimeTableTiming) {
        await tbl_timetable_assign.create(
          {
            ta_id: uuidv4(),
            ta_ti_id: newTimeTableId,
            ta_from: time.StartTiming,
            ta_to: time.EndTiming,
            ta_s_id: time.SubjectId,
            ta_st_id: time.TeacherId,
            ta_day_code: day.Code,
            ta_create_dt: new Date(),
            ta_update_dt: new Date()
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    return res.json({
      ErrorCode: "1",
      ErrorMessage: "Added Successfully",
      Id: newTimeTableId
    });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      ErrorCode: "0",
      ErrorMessage: err.message
    });
  }
};

// const getTimeTable = async (req, res) => {
//   const { Id, SchoolId, AcademicYearId } = req.body;

//   try {
//     // -----------------------------------------------
//     // 1️⃣ CALL GET_Distinct_WeeKDays
//     // -----------------------------------------------
//     const weekDaysQuery = `
//       SELECT DISTINCT 
//         trc.rc_name AS "Name",
//         tta.ta_day_code AS "Code",
//         tta.ta_ti_id AS "TimeTableAssignId"
//       FROM tbl_timetable_assign tta
//       INNER JOIN tbl_ref_codes trc 
//         ON tta.ta_day_code = trc.rc_code 
//        AND trc.rc_type = 'Days'
//       INNER JOIN tbl_timetable tt 
//         ON tt.ti_id = tta.ta_ti_id
//       INNER JOIN tbl_academic_year ay 
//         ON tt.ti_ay_id = ay.ay_id
//       WHERE tt.ti_c_id = :Id
//         AND tt.ti_sc_id = :SchoolId
//         AND tt.ti_ay_id = :AcademicYearId
//         AND ay.ay_status_id = 1;
//     `;

//     const weekDays = await sequelize.query(weekDaysQuery, {
//       replacements: { Id, SchoolId, AcademicYearId },
//       type: sequelize.QueryTypes.SELECT
//     });

//     // -----------------------------------------------
//     // 2️⃣ LOOP EACH WEEKDAY → Get_Period_By_Day
//     // -----------------------------------------------
//     for (let wd of weekDays) {
//       const periodQuery = `
//         SELECT 
//           ta.ta_from AS "StartTiming",
//           ta.ta_to AS "EndTiming",
//           ta.ta_s_id AS "SubjectId",
//           ta.ta_st_id AS "TeacherId"
//         FROM tbl_timetable_assign ta
//         WHERE ta.ta_day_code = :Code
//           AND ta.ta_ti_id = :Id
//         ORDER BY ta.ta_from ASC;
//       `;

//       const timings = await sequelize.query(periodQuery, {
//         replacements: { Code: wd.Code, Id:wd.TimeTableAssignId },
//         type: sequelize.QueryTypes.SELECT
//       });

//       wd.TimeTableTiming = timings;
//     }

//     // -----------------------------------------------
//     // FINAL RESPONSE
//     // -----------------------------------------------
//     return res.status(200).json({
//       success: true,
//       data: weekDays
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message
//     });
//   }
// };

const getTeacherTimeTable = async (req, res) => {
  const { TeacherId, SchoolId, AcademicYearId } = req.body;

  try {
    // -----------------------------------------------
    // 1️⃣ GET ALL DISTINCT WEEKDAYS FOR THIS TEACHER
    // -----------------------------------------------
    const weekDaysQuery = `
      SELECT DISTINCT 
        trc.rc_name AS "Name",
        tta.ta_day_code AS "Code",
        CASE tta.ta_day_code
          WHEN 'MON' THEN 1
          WHEN 'TUE' THEN 2
          WHEN 'WED' THEN 3
          WHEN 'THU' THEN 4
          WHEN 'FRI' THEN 5
          WHEN 'SAT' THEN 6
          WHEN 'SUN' THEN 7
        END AS "DayOrder"
      FROM tbl_timetable_assign tta
      INNER JOIN tbl_ref_codes trc 
        ON tta.ta_day_code = trc.rc_code 
       AND trc.rc_type = 'Days'
      INNER JOIN tbl_timetable tt 
        ON tt.ti_id = tta.ta_ti_id
      INNER JOIN tbl_academic_year ay 
        ON tt.ti_ay_id = ay.ay_id
      WHERE tta.ta_st_id = :TeacherId
        AND tt.ti_sc_id = :SchoolId
        AND tt.ti_ay_id = :AcademicYearId
        AND ay.ay_status_id = 1
      ORDER BY "DayOrder";
    `;

    const weekDays = await sequelize.query(weekDaysQuery, {
      replacements: { TeacherId, SchoolId, AcademicYearId },
      type: sequelize.QueryTypes.SELECT
    });

    // -----------------------------------------------
    // 2️⃣ FOR EACH DAY → GET TEACHER'S PERIODS
    // -----------------------------------------------
    for (let day of weekDays) {
      const periodQuery = `
        SELECT 
          tta.ta_from AS "StartTiming",
          tta.ta_to AS "EndTiming",
          tta.ta_s_id AS "SubjectId",
          s.s_name AS "SubjectName",
          c.c_name AS "ClassName",
          tt.ti_c_id AS "ClassId"
        FROM tbl_timetable_assign tta
        INNER JOIN tbl_timetable tt 
          ON tt.ti_id = tta.ta_ti_id
        INNER JOIN tbl_academic_year ay 
          ON tt.ti_ay_id = ay.ay_id
        LEFT JOIN tbl_subject_master s 
          ON s.s_id = tta.ta_s_id
        LEFT JOIN tbl_class_master c 
          ON c.c_id = tt.ti_c_id
        WHERE tta.ta_st_id = :TeacherId
          AND tta.ta_day_code = :DayCode
          AND tt.ti_sc_id = :SchoolId
          AND tt.ti_ay_id = :AcademicYearId
          AND ay.ay_status_id = 1
        ORDER BY tta.ta_from ASC;
      `;

      const periods = await sequelize.query(periodQuery, {
        replacements: { 
          TeacherId, 
          DayCode: day.Code, 
          SchoolId, 
          AcademicYearId 
        },
        type: sequelize.QueryTypes.SELECT
      });

      day.TimeTableTiming = periods;
      delete day.DayOrder; // Remove the helper field from response
    }

    // -----------------------------------------------
    // FINAL RESPONSE
    // -----------------------------------------------
    return res.status(200).json({
      success: true,
      data: {
        teacherId: TeacherId,
        weeklySchedule: weekDays
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

const getTeachersBySubject = async (req, res) => {
  const { SubjectId, SchoolId } = req.body;

  if (!SubjectId || !SchoolId) {
    return res.status(400).json({
      status: false,
      message: "SubjectId and SchoolId are required.",
    });
  }

  try {
    const result = await tbl_teacher_manage.findAll({
      where: { tm_s_id: SubjectId },
      include: [
        {
          model: tbl_staff,
          as: "tm_st",
          attributes: [
            ["st_name", "TeacherName"],
            ["st_id", "TeacherId"]
          ],
          where: { st_sc_id: SchoolId },
          required: true   // INNER JOIN
        }
      ]
    });

    res.json({
      status: true,
      data: result.map(r => r.tm_st),  // return only teacher details
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
}

const getStudyMaterial = async (req, res) => {
  const { SchoolId, TeacherId } = req.body;

  if (!SchoolId || !TeacherId) {
    return res.status(400).json({
      status: false,
      message: "SchoolId and TeacherId are required",
    });
  }

  try {
    // 1️⃣ Get Active Academic Year (AY_STATUS = 1)
    const activeYear = await tbl_academic_year.findOne({
      attributes: ["ay_id"],
      where: { ay_status_id: 1 },
    });

    if (!activeYear) {
      return res.json({
        status: true,
        data: [],
        message: "No active academic year found",
      });
    }

    // 2️⃣ Fetch Study Materials
    const result = await tbl_study_material.findAll({
      attributes: [
        ["sm_id", "Id"],
        ["sm_c_id", "ClassId"],
        ["sm_sc_id", "SchoolId"],
        ["sm_st_id", "TeacherId"],
        ["sm_title", "Title"],
        ["sm_marks", "Marks"],
        ["sm_due_date", "DueDate"],
        ["sm_description", "Description"],
        ["sm_date", "Date"],
        [
          sequelize.literal(`
            CASE 
              WHEN "sm_doc_url" IS NULL THEN ''
              ELSE CONCAT('http://localhost:56791/', 'Document/ClassProfile/', "sm_c_id", '/', "sm_doc_url")
            END
          `),
          "DocName",
        ],
      ],

      where: {
        sm_sc_id: SchoolId,
        sm_type: "Assignment",
      },

      include: [
        {
          model: tbl_class_master,
          as: "sm_c",
          attributes: [
            ["c_div", "Div"],
            ["c_name", "Class"],
          ],
        },
        {
          model: tbl_staff,
          as: "sm_st",
          attributes: [
            ["st_name", "TeacherName"],
          ],
          where: { st_id: TeacherId },
          required: true,
        },
        // {
        //   model: tbl_academic_year,
        //   as: "academic_year",
        //   attributes: [],
        //   where: { ay_status_id: 1 },
        //   required: true,
        // },
      ],
    });

    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const saveStudyMaterial = async (req, res) => {
  try {
    const {
      MaterialId,
      TeacherId,
      SchoolId,
      ClassId,
      Title,
      Description,
      MaterialDate ,
      DocName,
      DueDate,
      Marks
    } = req.body;

    let fileName = DocName || null;

    // --------- UPDATE CASE ---------
    if (MaterialId) {
      // If DocName is null → keep old one
      if (!fileName) {
        const oldRecord = await tbl_study_material.findOne({
          where: { sm_id: MaterialId }
        });

        if (!oldRecord) {
          return res.json({ status: false, message: "Material not found." });
        }

        fileName = oldRecord.sm_doc_url;
      }

      await tbl_study_material.update(
        {
          sm_c_id: ClassId,
          sm_sc_id: SchoolId,
          sm_st_id: TeacherId,
          sm_title: Title,
          sm_description: Description,
          sm_date: MaterialDate ,
          sm_doc_url: fileName,
          sm_update_dt: new Date(),
          sm_update_by: TeacherId,
          sm_due_date: DueDate,
          sm_marks: Marks
        },
        { where: { sm_id: MaterialId } }
      );

      return res.json({
        status: true,
        message: "Updated Successfully",
        MaterialId,
        ClassId
      });
    }

    // --------- INSERT CASE ---------
    const newMaterialId = uuidv4();

    await tbl_study_material.create({
      sm_id: newMaterialId,
      sm_c_id: ClassId,
      sm_sc_id: SchoolId,
      sm_st_id: TeacherId,
      sm_title: Title,
      sm_description: Description,
      sm_date: MaterialDate ,
      sm_doc_url: fileName,
      sm_create_dt: new Date(),
      sm_create_by: TeacherId,
      sm_update_dt: new Date(),
      sm_marks: Marks,
      sm_due_date: DueDate,
      sm_type: "Assignment"
    });

    return res.json({
      status: true,
      message: "Added Successfully",
      MaterialId: newMaterialId,
      ClassId
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

const deleteStudyMaterial = async (req, res) => {
  const { MaterialId } = req.body;

  if (!MaterialId) {
    return res.status(400).json({
      status: false,
      message: "MaterialId is required.",
    });
  }

  try {
    // Check if record exists
    const record = await tbl_study_material.findOne({
      where: { sm_id: MaterialId },
    });

    if (!record) {
      return res.status(404).json({
        status: false,
        message: "Study Material not found.",
      });
    }

    // Delete the record
    await tbl_study_material.destroy({
      where: { sm_id: MaterialId },
    });

    return res.json({
      status: true,
      ErrorCode: "1",
      ErrorMessage: "Deleted Successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getHomework = async (req, res) => {
  const { SchoolId, TeacherId } = req.body;

  try {
    const result = await tbl_study_material.findAll({
      where: {
        sm_sc_id: SchoolId,
        sm_type: "Homework"
      },
      include: [
        {
          model: tbl_class_master,
          as:'sm_c',
          attributes: [["c_div", "Div"], ["c_name", "Class"]],
        },
        {
          model: tbl_staff,
          as: "sm_st",
          attributes: [["st_name", "TeacherName"]],
          include: [
            {
              model: tbl_academic_year,
              as: "staff_aydata",
              where: { ay_status_id: 1 },
              attributes: []
            }
          ]
        }
      ],
      attributes: [
        ["sm_id", "Id"],
        ["sm_c_id", "ClassId"],
        ["sm_sc_id", "SchoolId"],
        ["sm_st_id", "TeacherId"],
        ["sm_title", "Title"],
        ["sm_marks", "Marks"],
        ["sm_due_date", "DueDate"],
        ["sm_description", "Description"],
        ["sm_date", "Date"],
        [
          Sequelize.literal(`
            CASE 
              WHEN "tbl_study_material"."sm_doc_url" IS NULL 
              THEN '' 
              ELSE CONCAT('http://localhost:56791/Document/ClassProfile/', "sm_c_id", '/', "sm_doc_url") 
            END
          `),
          "DocName"
        ]
      ],
      raw: true
    });

    return res.json({
      status: true,
      data: result
    });

  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};

const saveHomework = async (req, res) => {
  try {
    const {
      Id,
      TeacherId,
      SchoolId,
      ClassId,
      Title,
      Description,
      HomeworkDate,
      DocName,
      DueDate,
      Marks
    } = req.body;

    const fileName = DocName ?? null;

    // -------------------------------
    // INSERT CASE
    // -------------------------------
    if (!Id || Id === "") {
      const newId = uuidv4();

      await tbl_study_material.create({
        sm_id: newId,
        sm_c_id: ClassId,
        sm_sc_id: SchoolId,
        sm_st_id: TeacherId,
        sm_title: Title,
        sm_description: Description,
        sm_date: HomeworkDate,
        sm_doc_url: fileName,
        sm_create_dt: new Date(),
        sm_create_by: TeacherId,
        sm_update_dt: new Date(),
        sm_marks: Marks,
        sm_due_date: DueDate,
        sm_type: "Homework"
      });

      return res.json({
        status: true,
        data: {
          ErrorCode: 1,
          ErrorMessage: "Added Successfully",
          MaterialId: newId,
          ClassId: ClassId
        }
      });
    }

    // -------------------------------
    // UPDATE CASE
    // -------------------------------
    const record = await tbl_study_material.findOne({
      where: { sm_id: Id }
    });

    if (!record) {
      return res.status(404).json({
        status: false,
        message: "Record not found"
      });
    }

    await tbl_study_material.update(
      {
        sm_c_id: ClassId,
        sm_sc_id: SchoolId,
        sm_st_id: TeacherId,
        sm_title: Title,
        sm_description: Description,
        sm_date: HomeworkDate,
        sm_doc_url: fileName ?? record.sm_doc_url,
        sm_update_dt: new Date(),
        sm_update_by: TeacherId,
        sm_due_date: DueDate,
        sm_marks: Marks
      },
      { where: { sm_id: Id } }
    );

    return res.json({
      status: true,
      data: {
        ErrorCode: 1,
        ErrorMessage: "Updated Successfully",
        MaterialId: Id,
        ClassId: ClassId
      }
    });

  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};

const evaluateHomework = async (req, res) => {
  const { Id } = req.body;

  try {
    if (!Id) {
      return res.status(400).json({
        status: false,
        message: "Id is required",
      });
    }

    // 1️⃣ Get Assignment Details
    const assignment = await tbl_study_material.findOne({
      where: { sm_id: Id },
      attributes: ["sm_id", "sm_c_id", "sm_sc_id"]
    });

    if (!assignment) {
      return res.json({
        ErrorCode: "2",
        ErrorMessage: "Assignment not found"
      });
    }

    const ClassId = assignment.sm_c_id;
    const SchoolId = assignment.sm_sc_id;

    // 2️⃣ Check if evaluations exist
    const hasEvaluations = await tbl_study_material_evaluation.count({
      where: { sme_sm_id: Id }
    });

    // 3️⃣ Build Common Include
    const commonInclude = [
      {
        model: tbl_class_master,
        as: "classdata",
        attributes: ["c_name", "c_div"]
      },
      // {
      //   model: tbl_study_material,
      //   as: "assignment",
      //   where: { sm_id: Id },
      //   attributes: [
      //     "sm_title",
      //     "sm_description",
      //     "sm_due_date",
      //     "sm_marks",
      //     "sm_date",
      //   ],
      //   include: [
      //     {
      //       model: tbl_staff,
      //       as: "teacher",
      //       attributes: ["st_name"]
      //     }
      //   ]
      // },
      {
        model: tbl_academic_year,
        as: "student_aydata",
        where: { ay_status_id: 1 },
        attributes: []
      }
    ];

    let result = [];

    // 4️⃣ IF NO EVALUATIONS — Return initial student list
    if (hasEvaluations === 0) {

      result = await tbl_student_info.findAll({
        where: { si_c_id: ClassId },
        attributes: [
          ["si_id", "StudentId"],
          ["si_sc_id", "SchoolId"],
          [
            sequelize.literal(
              "CONCAT(si_first_name, ' ', COALESCE(si_middle_name,'') , ' ', COALESCE(si_last_name,''))"
            ),
            "StudentName"
          ],
          ["si_rollno", "RollNo"],
          ["si_ay_id", "AcademicYearId"]
        ],
        include: commonInclude,
        order: [["si_rollno", "ASC"]],
        raw: true
      });

      // Add status message
      result = result.map(r => ({
        ...r,
        StatusMessage: "Initial Setup - No Evaluations"
      }));

    } else {

      // 5️⃣ EVALUATIONS EXIST — Return detailed info with evaluation status
      result = await tbl_student_info.findAll({
        where: { si_c_id: ClassId },
        attributes: [
          ["si_id", "StudentId"],
          ["si_sc_id", "SchoolId"],
          [
            sequelize.literal(
              "CONCAT(si_first_name, ' ', COALESCE(si_middle_name,'') , ' ', COALESCE(si_last_name,''))"
            ),
            "StudentName"
          ],
          ["si_rollno", "RollNo"],
          ["si_ay_id", "AcademicYearId"],
        ],
        include: [
          ...commonInclude,
          {
            model: tbl_study_material_evaluation,
            as: "evaluation",
            required: false,
            where: { sme_sm_id: Id },
            attributes: [
              ["sme_evaluation_status", "EvaluationStatus"],
              ["sat_date", "EvaluationDate"]
            ]
          }
        ],
        order: [["si_rollno", "ASC"]],
        raw: true
      });

      // 6️⃣ Add status description
      result = result.map(r => {
        let desc = "Unknown Status";

        if (!r.evaluation_EvaluationStatus) desc = "Not Evaluated (Incomplete)";
        if (r.evaluation_EvaluationStatus === "C") desc = "Complete";
        if (r.evaluation_EvaluationStatus === "I") desc = "Incomplete";

        return {
          ...r,
          StatusDescription: desc,
          StatusMessage: "Evaluations Available"
        };
      });
    }

    return res.json({
      status: true,
      data: result
    });

  } catch (error) {
    console.error("EvaluateHomework Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error
    });
  }
};

//Pending to test
const insertHomeworkStatus = async (req, res) => {
  const { Id, StudentStudyEvaluation } = req.body;

  if (!Id || !StudentStudyEvaluation) {
    return res.status(400).json({
      status: false,
      message: "Id and StudentStudyEvaluation are required."
    });
  }

  try {
    const assignment = await tbl_study_material.findOne({
      where: { sm_id: Id },
      attributes: ["sm_id", "sm_sc_id"]
    });

    if (!assignment) {
      return res.status(404).json({
        status: false,
        message: "Assignment not found."
      });
    }

    let finalResponse = null;

    for (const item of StudentStudyEvaluation) {
      const { StudentId, EvaluationStatus, TeacherId } = item;

      if (!["C", "I"].includes(EvaluationStatus)) {
        return res.status(400).json({
          status: false,
          message: "Invalid status. Use C or I."
        });
      }

      // If TeacherId missing, use assignment school id (similar to SP logic)
      const updatedBy = TeacherId ?? assignment.sm_sc_id;

      // Check if already exists
      const existingRecord = await tbl_study_material_evaluation.findOne({
        where: {
          sme_sm_id: Id,
          sme_si_id: StudentId
        }
      });

      if (existingRecord) {
        // UPDATE
        await existingRecord.update({
          sme_evaluation_status: EvaluationStatus,
          sme_update_by: updatedBy,
          sme_update_dt: new Date(),
          sat_date: new Date()
        });

        finalResponse = {
          ErrorCode: "1",
          ErrorMessage: "Status Updated Successfully"
        };

      } else {
        // INSERT
        await tbl_study_material_evaluation.create({
          sme_id: require("uuid").v4(),
          sme_sm_id: Id,
          sme_si_id: StudentId,
          sme_evaluation_status: EvaluationStatus,
          sme_create_by: updatedBy,
          sme_created_dt: new Date(),
          sme_update_by: updatedBy,
          sme_update_dt: new Date(),
          sat_date: new Date()
        });

        finalResponse = {
          ErrorCode: "1",
          ErrorMessage: "Status Added Successfully"
        };
      }
    }

    res.json({
      status: true,
      data: finalResponse
    });

  } catch (error) {
    console.error("InsertHomeworkStatus Error:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error
    });
  }
};


module.exports = {
  getUserAllRecords,
  getTeacherRecords,
  getDailyClassAttendance,
  getStudentClassMonthlyAT,
  getExamEvaluation,
  getViewExamEvaluation,
  getStudentClassEvaluation,

  saveTimeTable,
  getStudyMaterial,
  saveStudyMaterial,
  deleteStudyMaterial,
  getHomework,
  saveHomework,
  evaluateHomework,
  insertHomeworkStatus,
  getTeacherTimeTable
};
