const { 
    tbl_student_info,
    tbl_parent,
    tbl_ref_codes,
    tbl_class_master,
    tbl_academic_year,
    tbl_subject_allocation,
    tbl_subject_master,
    tbl_staff,
    tbl_study_material,
    tbl_library,
    tbl_class_teacher,
    tbl_student_attendance,
    tbl_exam_schedule,
    tbl_exam_type,
    tbl_exam_schedule_assign,
    tbl_exam_evaluation,
    tbl_exam_grades,
    tbl_timetable,
    tbl_timetable_assign,
    tbl_school,
    tbl_grade_range,
    tbl_invoice_records,
    tbl_invoice_master
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../models");


const getIndividualStudentData = async (req, res) => {
    try {
        const { ClassId, StudentId } = req.body;

        if (!ClassId || !StudentId) {
            return res.status(400).json({
                status: false,
                message: "ClassId and StudentId are required"
            });
        }

        // ---------------------
        // 1️⃣ Get Basic Student Information
        // ---------------------
        const student = await tbl_student_info.findOne({
            where: {
                si_id: StudentId,
                si_c_id: ClassId
            },
            include: [
                {
                    model: tbl_ref_codes,
                    as: "genderdata",
                    attributes: ["rc_name", "rc_code"],
                    where: { rc_type: "Gender" }
                },
                {
                    model: tbl_class_master,
                    as: "classdata",
                    attributes: ["c_name", "c_div", "c_id"]
                },
                {
                    model: tbl_academic_year,
                    as: "student_aydata",
                    attributes: ["ay_id", "ay_start_year", "ay_end_year"],
                    where: { ay_status_id: 1 }
                }
            ]
        });

        if (!student) {
            return res.status(404).json({
                status: false,
                message: "Student not found"
            });
        }

        // ---------------------
        // 2️⃣ Parents (Father, Mother, Local Guardian)
        // ---------------------
        const parents = await tbl_parent.findAll({
            where: { p_si_id: StudentId },
            attributes: [
                "p_id",
                "p_parent_type",
                "p_name",
                "p_profession",
                "p_mobile_number",
                "p_address",
                "p_email_id"
            ]
        });

        const father = parents.find(x => x.p_parent_type === "FA") || {};
        const mother = parents.find(x => x.p_parent_type === "MO") || {};
        const guardian = parents.find(x => x.p_parent_type === "L") || {};

        // ---------------------
        // 3️⃣ Prepare Final Response Object
        // ---------------------
        const result = {
            StudentId: student.si_id,
            AcademicYearId: student.si_ay_id,
            AcademicYear: `${student.student_aydata.ay_start_year} - ${student.student_aydata.ay_end_year}`,
            FirstName: student.si_first_name,
            MiddleName: student.si_middle_name,
            LastName: student.si_last_name,
            MotherTongue: student.si_mother_tongue,
            BloodGroup: student.si_blood_group,
            RollNo: student.si_rollno,
            StudentMobileNumber: student.si_phone_number,
            BirthDate: student.si_dob,
            StudentEmail: student.si_email_id,
            Gender: student.genderdata.rc_name,
            GenderCode: student.genderdata.rc_code,
            StudentAddress: student.si_address,
            Religion: student.si_religion,
            Nationality: student.si_nationality,
            PinCode: student.si_pin_code,
            States: student.si_state,
            City: student.si_city,
            CreatedDate: student.si_create_dt,
            UpdatedDate: student.si_update_dt,
            ClassNumber: student.classdata.c_name,
            ClassDiv: student.classdata.c_div,
            ClassId: student.classdata.c_id,

            ImageName: student.si_image_url
                ? `http://localhost:56791/Image/StudentProfile/${student.si_id}/${student.si_image_url}`
                : "",

            Father: {
                Name: father.p_name || "",
                Occupation: father.p_profession || "",
                Mobile: father.p_mobile_number || "",
                OfficeAddress: father.p_address || "",
                Email: father.p_email_id || ""
            },
            Mother: {
                Name: mother.p_name || "",
                Occupation: mother.p_profession || "",
                Mobile: mother.p_mobile_number || "",
                OfficeAddress: mother.p_address || "",
                Email: mother.p_email_id || ""
            },
            LocalGuardian: {
                Name: guardian.p_name || "",
                Occupation: guardian.p_profession || "",
                Mobile: guardian.p_mobile_number || "",
                OfficeAddress: guardian.p_address || "",
                Email: guardian.p_email_id || ""
            }
        };

        return res.json({
            status: true,
            data: result
        });

    } catch (error) {
        console.error("GetStudentData Error:", error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error
        });
    }
};

const getMyTeachers = async (req, res) => {
  const { ClassId } = req.body;

  try {
    if (!ClassId) {
      return res.status(400).json({
        status: false,
        message: "ClassId is required",
      });
    }

    // Fetch teacher records
    const records = await tbl_subject_allocation.findAll({
      where: {
        sa_c_id: ClassId,
      },

      include: [
        {
          model: tbl_academic_year,
          as: "subject_academic_year",
          attributes: ["ay_start_year", "ay_end_year"],
          where: { ay_status_id: 1 },  // active year
          required: true,
        },
        {
          model: tbl_class_master,
          as: "sa_c",
          attributes: ["c_name", "c_div"],
        },
        {
          model: tbl_staff,
          as: "sa_st",
          attributes: ["st_name", "st_email_id", "st_phone_number"],
        },
        {
          model: tbl_subject_master,
          as: "sa_subject",
          attributes: ["s_name"],
        },
      ],
    });

    // Format Response
    const formatted = records.map(r => ({
      Class: r.sa_c?.c_name || "",
      Div: r.sa_c?.c_div || "",
      Name: r.sa_st?.st_name || "",
      SubjectName: r.sa_subject?.s_name || "",
      StartYear: r.subject_academic_year?.ay_start_year || "",
      EndYear: r.subject_academic_year?.ay_end_year || "",
      EmailId: r.sa_st?.st_email_id || "",
      MobileNumber: r.sa_st?.st_phone_number || ""
    }));

    return res.json({
      status: true,
      data: formatted,
    });

  } catch (error) {
    console.error("GetMyTeacher Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const getTimeTable = async (req, res) => {

    // {
    //     "Id": "720d6336-d3c7-4a10-9391-d07d1a1aedd7",
    //     "AcademicYearId": "8681826d-6a33-46e3-b512-9e4707030b1f",
    //     "SchoolId": "48f70015-a254-454c-b5a9-2c34ac439ccf"
    // }
  const { Id, SchoolId, AcademicYearId } = req.body;

  try {
    // -----------------------------------------------
    // 1️⃣ CALL GET_Distinct_WeeKDays
    // -----------------------------------------------
    const weekDaysQuery = `
      SELECT DISTINCT 
        trc.rc_name AS "Name",
        tta.ta_day_code AS "Code",
        tta.ta_ti_id AS "TimeTableAssignId"
      FROM tbl_timetable_assign tta
      INNER JOIN tbl_ref_codes trc 
        ON tta.ta_day_code = trc.rc_code 
       AND trc.rc_type = 'Days'
      INNER JOIN tbl_timetable tt 
        ON tt.ti_id = tta.ta_ti_id
      INNER JOIN tbl_academic_year ay 
        ON tt.ti_ay_id = ay.ay_id
      WHERE tt.ti_c_id = :Id
        AND tt.ti_sc_id = :SchoolId
        AND tt.ti_ay_id = :AcademicYearId
        AND ay.ay_status_id = 1;
    `;

    const weekDays = await sequelize.query(weekDaysQuery, {
      replacements: { Id, SchoolId, AcademicYearId },
      type: sequelize.QueryTypes.SELECT
    });

    // -----------------------------------------------
    // 2️⃣ LOOP EACH WEEKDAY → Get_Period_By_Day
    // -----------------------------------------------
    for (let wd of weekDays) {
      const periodQuery = `
        SELECT 
          ta.ta_from AS "StartTiming",
          ta.ta_to AS "EndTiming",
          ta.ta_s_id AS "SubjectId",
          ta.ta_st_id AS "TeacherId",
          sm.s_name AS "SubjectName",
          st.st_name AS "TeacherName"
        FROM tbl_timetable_assign ta
        INNER JOIN tbl_subject_master sm ON ta_s_id = sm.s_id
        INNER JOIN tbl_staff st ON ta_st_id = st.st_id 
        WHERE ta.ta_day_code = :Code
          AND ta.ta_ti_id = :Id
        ORDER BY ta.ta_from ASC;
      `;

      const timings = await sequelize.query(periodQuery, {
        replacements: { Code: wd.Code, Id:wd.TimeTableAssignId },
        type: sequelize.QueryTypes.SELECT
      });

      wd.TimeTableTiming = timings;
    }

    // -----------------------------------------------
    // FINAL RESPONSE
    // -----------------------------------------------
    return res.status(200).json({
      success: true,
      data: weekDays
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

// const getTeachersBySubject = async (req, res) => {
//   const { SubjectId, SchoolId } = req.body;

//   if (!SubjectId || !SchoolId) {
//     return res.status(400).json({
//       status: false,
//       message: "SubjectId and SchoolId are required.",
//     });
//   }

//   try {
//     const result = await tbl_teacher_manage.findAll({
//       where: { tm_s_id: SubjectId },
//       include: [
//         {
//           model: tbl_staff,
//           as: "tm_st",
//           attributes: [
//             ["st_name", "TeacherName"],
//             ["st_id", "TeacherId"]
//           ],
//           where: { st_sc_id: SchoolId },
//           required: true   // INNER JOIN
//         }
//       ]
//     });

//     res.json({
//       status: true,
//       data: result.map(r => r.tm_st),  // return only teacher details
//     });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       status: false,
//       message: "Internal server error.",
//     });
//   }
// }


// const getStudyMaterial = async (req, res) => {
//   const { SchoolId, TeacherId } = req.body;

//   if (!SchoolId || !TeacherId) {
//     return res.status(400).json({
//       status: false,
//       message: "SchoolId and TeacherId are required",
//     });
//   }

//   try {
//     // 1️⃣ Get Active Academic Year (AY_STATUS = 1)
//     const activeYear = await tbl_academic_year.findOne({
//       attributes: ["ay_id"],
//       where: { ay_status_id: 1 },
//     });

//     if (!activeYear) {
//       return res.json({
//         status: true,
//         data: [],
//         message: "No active academic year found",
//       });
//     }

//     // 2️⃣ Fetch Study Materials
//     const result = await tbl_study_material.findAll({
//       attributes: [
//         ["sm_id", "Id"],
//         ["sm_c_id", "ClassId"],
//         ["sm_sc_id", "SchoolId"],
//         ["sm_st_id", "TeacherId"],
//         ["sm_title", "Title"],
//         ["sm_marks", "Marks"],
//         ["sm_due_date", "DueDate"],
//         ["sm_description", "Description"],
//         ["sm_date", "Date"],
//         [
//           sequelize.literal(`
//             CASE 
//               WHEN "sm_doc_url" IS NULL THEN ''
//               ELSE CONCAT('http://localhost:56791/', 'Document/ClassProfile/', "sm_c_id", '/', "sm_doc_url")
//             END
//           `),
//           "DocName",
//         ],
//       ],

//       where: {
//         sm_sc_id: SchoolId,
//         sm_type: "Assignment",
//       },

//       include: [
//         {
//           model: tbl_class_master,
//           as: "sm_c",
//           attributes: [
//             ["c_div", "Div"],
//             ["c_name", "Class"],
//           ],
//         },
//         {
//           model: tbl_staff,
//           as: "sm_st",
//           attributes: [
//             ["st_name", "TeacherName"],
//           ],
//           where: { st_id: TeacherId },
//           required: true,
//         },
//         // {
//         //   model: tbl_academic_year,
//         //   as: "academic_year",
//         //   attributes: [],
//         //   where: { ay_status_id: 1 },
//         //   required: true,
//         // },
//       ],
//     });

//     res.json({
//       status: true,
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//     });
//   }
// };

const getStudyMaterial = async (req, res) => {
  const { SchoolId, ClassId } = req.body;

  if (!SchoolId || !ClassId) {
    return res.status(400).json({
      status: false,
      message: "SchoolId and ClassId are required.",
    });
  }

  try {
    const result = await tbl_study_material.findAll({
      where: {
        sm_sc_id: SchoolId,
        sm_c_id: ClassId,
      },
      include: [
        {
          model: tbl_class_master,
          as: "sm_c",
          attributes: [
            ["c_id", "ClassId"],
            ["c_name", "Class"],
            ["c_div", "Div"]
          ]
        },
        {
          model: tbl_staff,
          as: "sm_st",
          attributes: [
            ["st_id", "TeacherId"],
            ["st_name", "TeacherName"]
          ],
          include: [
            {
              model: tbl_academic_year,
              as:"staff_aydata",
              where: { ay_status_id: 1 },
              attributes: []
            }
          ]
        },
        // {
        //   model: tbl_subject_allocation,
        //   attributes: [],
        //   required: true,
        //   include: [
        //     {
        //       model: tbl_subject_master,
        //       attributes: [["S_NAME", "SubjectName"]]
        //     }
        //   ],
        //   where: {
        //     SA_C_ID: ClassId
        //   }
        // }
      ],
      attributes: [
        ["sm_id", "Id"],
        ["sm_c_id", "ClassId"],
        ["sm_sc_id", "SchoolId"],
        ["sm_st_id", "TeacherId"],
        ["sm_title", "Title"],
        ["sm_description", "Description"],
        ["sm_date", "Date"],
        ["sm_due_date", "DueDate"],
        ["sm_marks", "Marks"],
        ["sm_type", "Type"],
        [
          sequelize.literal(`
            CASE 
              WHEN sm_doc_url IS NULL THEN ''
              ELSE CONCAT('http://localhost:56791/', 'Document/ClassProfile/', sm_c_id, '/', sm_doc_url)
            END
          `),
          "DocName"
        ]
      ],
      order: [["sm_date", "DESC"]]
    });

    return res.json({
      status: true,
      data: result,
    });

  } catch (error) {
    console.error("Error getStudyMaterial:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const getLibraryRecords = async (req, res) => {
  const { SchoolId, ClassId } = req.body;

  if (!SchoolId || !ClassId) {
    return res.status(400).json({
      status: false,
      message: "SchoolId and ClassId are required",
    });
  }

  try {
    // 1️⃣ Fetch class name from class master
    const classData = await tbl_class_master.findOne({
      where: { c_id: ClassId },
      attributes: ["c_name"],
    });

    if (!classData) {
      return res.status(404).json({
        status: false,
        message: "Class not found",
      });
    }

    const className = classData.c_name;

    // 2️⃣ Fetch library records for the school + class
    const libraryData = await tbl_library.findAll({
      where: {
        l_sc_id: SchoolId,
        l_class: className,
      },
      attributes: [
        ["l_id", "id"],
        ["l_class", "class"],
        ["l_book", "bookname"],
        ["l_author", "author"],
        ["l_description", "description"],
        ["l_price", "price"],
        ["l_status", "status"],
      ],
    });

    return res.json({
      status: true,
      data: libraryData,
    });

  } catch (error) {
    console.error("GetLibraryRecords Error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
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
    const { Id, StudentId, TeacherId, YEAR, MONTH } = req.body;

    // // ---------------------------------------------
    // // 1️⃣ Check if teacher is assigned to the class
    // // ---------------------------------------------
    // const teacherAssigned = await tbl_class_teacher.findOne({
    //   where: {
    //     ct_c_id: Id,
    //     //ct_st_id: TeacherId
    //   }
    // });

    // if (!teacherAssigned) {
    //   return res.json({
    //     ErrorCode: 3,
    //     ErrorMessage: "Not Eligible To Take Attendance"
    //   });
    // }

    // ---------------------------------------------
    // 2️⃣ Fetch Students of class with Active AY
    // ---------------------------------------------
    const students = await tbl_student_info.findAll({
      where: { si_c_id: Id, si_id: StudentId },
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

const getStudentExamSchedule = async (req, res) => {
    const { SchoolId, ClassId } = req.body;

    if (!SchoolId || !ClassId) {
        return res.status(400).json({
            status: false,
            message: "SchoolId and ClassId are required"
        });
    }

    try {
        // 1) Check if exam exists
        const check = await tbl_exam_schedule.findOne({
            include: [
                {
                    model: tbl_exam_type,
                    as:'es_et',
                    required: true,
                    where: { et_sc_id: SchoolId }
                },
                {
                    model: tbl_academic_year,
                    as:'es_ay',
                    required: true,
                    where: { ay_status_id: 1 }
                }
            ]
        });

        if (!check) {
            return res.json([
                {
                    errorcode: "2",
                    errormessage: "No Records exists"
                }
            ]);
        }

        // 2) Fetch exam schedule list
        const schedules = await tbl_exam_schedule.findAll({
            where: { es_c_id: ClassId },

            include: [
                {
                    model: tbl_exam_type,
                    as:'es_et',
                    attributes: ["et_type", "et_id"],
                    where: { et_sc_id: SchoolId },
                    required: true
                },
                {
                    model: tbl_class_master,
                    as:'es_c',
                    attributes: ["c_name", "c_div", "c_id"],
                    required: true
                },
                {
                    model: tbl_academic_year,
                    as:'es_ay',
                    attributes: ["ay_id", "ay_start_year", "ay_end_year"],
                    where: { ay_status_id: 1 },
                    required: true
                }
            ],

            order: [["es_id", "ASC"]]
        });

        // 3) Build final output manually (to match SQL output)
        const finalResult = [];

        for (const row of schedules) {

            const esid = row.es_id;

            const startDate = await tbl_exam_schedule_assign.findOne({
                where: { esa_es_id: esid },
                order: [["esa_date", "ASC"]],
                attributes: ["esa_date"]
            });

            const endDate = await tbl_exam_schedule_assign.findOne({
                where: { esa_es_id: esid },
                order: [["esa_date", "DESC"]],
                attributes: ["esa_date"]
            });

            const subjectCount = await tbl_exam_schedule_assign.count({
                where: { esa_es_id: esid },
                distinct: true,
                col: "esa_s_id"
            });

            finalResult.push({
                examtype: row.es_et.et_type,
                examtypeid: row.es_et.et_id,

                id: row.es_c_id,
                examscheduleid: row.es_id,
                academicyearid: row.es_ay_id,

                classnumber: row.es_c.c_name,
                classdiv: row.es_c.c_div,

                academicyear:
                    `${row.es_ay.ay_start_year} - ${row.es_ay.ay_end_year}`,

                startdate: startDate ? startDate.esa_date : "",
                enddate: endDate ? endDate.esa_date : "",
                subjectcount: subjectCount
            });
        }

        return res.json(finalResult);

    } catch (error) {
        console.error("GetExamSchedule error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error
        });
    }
};

const getExamSchedule = async (req, res) => {
    const { SchoolId, ExamTypeId, ClassId } = req.body;

  try {
    // -------------------------
    // 1️⃣ GET DISTINCT EXAM SCHEDULE IDs
    // -------------------------
    const examRows = await sequelize.query(
      `
        SELECT 
            es_id AS "id"
        FROM tbl_exam_schedule
        INNER JOIN tbl_exam_type ON es_et_id = et_id
        INNER JOIN tbl_academic_year ON es_ay_id = ay_id
        WHERE es_et_id = :ExamTypeId
          AND et_sc_id = :SchoolId
          AND es_c_id = :ClassId
          AND ay_status_id = 1;
      `,
      {
        replacements: { SchoolId, ExamTypeId, ClassId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (examRows.length === 0) {
      return res.json([]);
    }

    // -------------------------
    // 2️⃣ LOOP AND GET ASSIGNED EXAM SCHEDULE DETAILS
    // -------------------------
    let finalResult = [];

    for (const row of examRows) {
      const examId = row.id;

      const assignRows = await sequelize.query(
        `
          SELECT 
            esa_s_id AS "subjectid",
            esa_id AS "examscheduleid",
            esa_id AS "examid",
            s_name AS "subjectname",
            esa_date AS "date",
            TO_CHAR(esa_start_time, 'HH24:MI') AS "starttime",
            TO_CHAR(esa_end_time, 'HH24:MI') AS "endtime",
            esa_max_marks AS "maxmarks",
            esa_min_marks AS "minmarks",
            CASE 
              WHEN EXTRACT(EPOCH FROM (esa_end_time - esa_start_time))/60 >= 60 THEN
                ROUND((EXTRACT(EPOCH FROM (esa_end_time - esa_start_time))/3600)::numeric, 1)::text || ' hour(s)'
              ELSE 
                (EXTRACT(EPOCH FROM (esa_end_time - esa_start_time))/60)::text || ' minute(s)'
            END AS "duration"
          FROM tbl_exam_schedule_assign
          INNER JOIN tbl_subject_master ON esa_s_id = s_id
          WHERE esa_es_id = :id;
        `,
        {
          replacements: { id: examId },
          type: sequelize.QueryTypes.SELECT
        }
      );

      finalResult.push(...assignRows);
    }

    return res.json(finalResult);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
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
    // {
    //   "Id": "e8402d76-6df3-4644-9f9c-4991aa399031",
    //   "ExamScheduleId": "424c9ae7-7ac7-4139-8b92-d75348178288",
    //     "TeacherId":"6a63cb81-84ab-4d7f-87ac-661e06a9b097"
    // }
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

const getAllocationSubject = async (req, res) => {
    try {
    const { SchoolId, ClassId } = req.body;

    if (!SchoolId || !ClassId) {
      return res.status(400).json({ message: "SchoolId and ClassId required" });
    }

    const data = await tbl_subject_allocation.findAll({
      where: {
        sa_c_id: ClassId
      },
      attributes: [],
      include: [
        {
          model: tbl_class_master,
          as: "sa_c",
          required: true,
          where: {},
          attributes: [
            ["c_name", "classnumber"],
            ["c_div", "classdiv"],
            ["c_id", "ClassId"]
          ]
        },
        {
          model: tbl_staff,
          as: "sa_st",
          required: true,
          where: { st_sc_id: SchoolId },
          attributes: [
            ["st_name", "teachername"],
            ["st_id", "teacherid"]
          ]
        },
        {
          model: tbl_academic_year,
          as: "subject_academic_year",
          required: true,
          where: { ay_status_id: 1 },
          attributes: [
            [
              sequelize.literal(
                "CONCAT(' ( ', subject_academic_year.ay_start_year, ' - ', subject_academic_year.ay_end_year, ' )')"
              ),
              "academicyear"
            ],
            ["ay_id", "academicyearid"]
          ]
        },
        {
          model: tbl_subject_master,
          as: "sa_subject",
          required: true,
          attributes: [
            ["s_name", "subjectname"],
            ["s_id", "subjectid"]
          ]
        }
      ]
    });

    // Add root level alias: Id
    const formatted = data.map((x) => ({
      id: x.sa_id,
      ...x.sa_c.dataValues,
      ...x.sa_st.dataValues,
      ...x.sa_subject.dataValues,
      ...x.subject_academic_year.dataValues
    }));

    return res.json(formatted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

const getStudentDashboard = async (req, res) => {
  const { studentId } = req.body;

  if (!studentId)
    return res.status(400).json({ message: "studentId is required" });

  try {
    // 1️⃣ Fetch Student Basic Info
    const student = await tbl_student_info.findOne({
      where: { si_id: studentId },
      attributes: ["si_id", "si_first_name","si_middle_name","si_last_name", "si_rollno", "si_c_id", "si_sc_id"]
    });

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const classId = student.si_c_id;
    const schoolId = student.si_sc_id;

    // 2️⃣ Class Info
    const classInfo = await tbl_class_master.findOne({
      where: { c_id: classId },
      attributes: ["c_id", "c_name", "c_div"]
    });

    // 3️⃣ Academic Year (active)
    const academicYear = await tbl_academic_year.findOne({
      where: { ay_sc_id: schoolId, ay_status_id: 1 },
      attributes: [
        "ay_id",
        "ay_start_year",
        "ay_end_year",
        "ay_status_id"
      ]
    });

    // 4️⃣ Subject Allocation (student’s class teachers & subjects)
    const subjects = await tbl_subject_allocation.findAll({
      where: { sa_c_id: classId, sa_ay_id: academicYear.ay_id },
      attributes: ["sa_id", "sa_st_id", "sa_s_id"],
      include: [
        {
          model: tbl_staff,
          as:'sa_st',
          attributes: ["st_id", "st_name"]
        },
        {
          model: tbl_subject_master,
          as:'sa_subject',
          attributes: ["s_id", "s_name"]
        }
      ]
    });

    // 5️⃣ Upcoming Exams
    const upcomingExams = await tbl_exam_schedule.findAll({
      where: {
        es_c_id: classId,
        es_ay_id: academicYear.ay_id
      },
      attributes: ["es_id", "es_et_id"],
      include: [
        {
          model: tbl_exam_type,
          as:'es_et',
          attributes: ["et_id", "et_type"]
        },
        {
          model: tbl_exam_schedule_assign,
          as:'tbl_exam_schedule_assigns',
          attributes: [
            "esa_id",
            "esa_s_id",
            "esa_date",
            "esa_start_time",
            "esa_end_time",
            "esa_max_marks"
          ],
          include: [
            {
              model: tbl_subject_master,
              as:'esa',
              attributes: ["s_id", "s_name"]
            }
          ]
        }
      ],
      order: [["es_id", "DESC"]]
    });

    // 6️⃣ Pending Homework
    // const homeworkList = await tbl_homework.findAll({
    //   where: {
    //     hw_c_id: classId,
    //     hw_sc_id: schoolId
    //   },
    //   attributes: [
    //     "hw_id",
    //     "hw_title",
    //     "hw_description",
    //     "hw_date",
    //     "hw_submission_date"
    //   ]
    // });

    // 7️⃣ Attendance Summary
    const attendanceData = await tbl_student_attendance.findAll({
      where: { sat_si_id: studentId },
      attributes: ["sat_id", "sat_date", "sat_attendance_status"]
    });

    // Summary
    const presentDays = attendanceData.filter(a => a.sat_attendance_status === "P").length;
    const totalDays = attendanceData.length;

    // Final dashboard response
    return res.json({
      student,
      classInfo,
      academicYear,
      subjects,
      upcomingExams,
    //   homeworkList,
      attendanceSummary: {
        present: presentDays,
        total: totalDays,
        percentage: totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error("GetStudentDashboard error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getStudentExamResult = async (req, res) => {
    const { studentid, examscheduleid } = req.body;

    if (!studentid)
        return res.status(400).json({ message: "studentid is required" });

    try {
        // ------------------------------
        // STEP 1: Fetch student info
        // ------------------------------
        const student = await tbl_student_info.findOne({
            where: { si_id: studentid },
            raw: true
        });

        if (!student)
            return res.status(404).json({ message: "Student not found" });

        const schoolId = student.si_sc_id;
        const ayId = student.si_ay_id;
        const classId = student.si_c_id;

        // ------------------------------
        // STEP 2: If examScheduleId missing → get latest exam
        // ------------------------------
        let actualExamScheduleId = examscheduleid;

        if (!actualExamScheduleId) {
            const latestExam = await tbl_exam_schedule.findOne({
                include: [
                    {
                        model: tbl_academic_year,
                        as: "ay",
                        where: { ay_status_id: 1 }
                    }
                ],
                where: {
                    es_c_id: classId,
                    es_ay_id: ayId
                },
                order: [["es_create_dt", "DESC"]],
                raw: true
            });

            if (!latestExam)
                return res.status(404).json({ message: "No exam found" });

            actualExamScheduleId = latestExam.es_id;
        }

        // ------------------------------
        // STEP 3: Build STUDENT INFO Object
        // ------------------------------
        const school = await tbl_school.findOne({
            where: { sc_id: schoolId },
            raw: true
        });

        const ay = await tbl_academic_year.findOne({
            where: { ay_id: ayId },
            raw: true
        });

        const classData = await tbl_class_master.findOne({
            where: { c_id: classId },
            raw: true
        });

        const father = await tbl_parent.findOne({
            where: { p_si_id: studentid, p_parent_type: "FA" },
            raw: true
        });

        const mother = await tbl_parent.findOne({
            where: { p_si_id: studentid, p_parent_type: "MO" },
            raw: true
        });

        const studentName =
            `${student.si_first_name || ""} ` +
            `${student.si_middle_name || ""} `.trim() +
            `${student.si_last_name || ""}`.trim();

        const session = `Academic Session - ${ay.ay_start_year}-${String(ay.ay_end_year).slice(-2)}`;

        // ------------------------------
        // STEP 4: TOTAL MARKS / PERCENTAGE
        // ------------------------------
        const marksData = await tbl_exam_schedule_assign.findAll({
            where: { esa_es_id: actualExamScheduleId },
            raw: true
        });

        let totalMarks = 0;
        let maxMarksTotal = 0;

        for (let exam of marksData) {
            const evalData = await tbl_exam_evaluation.findOne({
                where: {
                    ee_esa_id: exam.esa_id,
                    ee_si_id: studentid
                },
                raw: true
            });

            const marks = (+evalData?.ee_marks || 0) + (+evalData?.ee_grace_marks || 0);
            totalMarks += marks;
            maxMarksTotal += exam.esa_max_marks;
        }

        const percentage = maxMarksTotal
            ? Number(((totalMarks * 100) / maxMarksTotal).toFixed(1))
            : 0;

        // ------------------------------
        // STEP 5: RANK CALCULATION
        // ------------------------------
        const studentsInClass = await tbl_student_info.findAll({
            where: { si_c_id: classId },
            raw: true
        });

        const rankArray = [];

        for (let std of studentsInClass) {
            let sum = 0;

            for (let exam of marksData) {
                const mark = await tbl_exam_evaluation.findOne({
                    where: {
                        ee_esa_id: exam.esa_id,
                        ee_si_id: std.si_id
                    },
                    raw: true
                });
                sum += (mark?.ee_marks || 0) + (mark?.ee_grace_marks || 0);
            }

            rankArray.push({ si_id: std.si_id, total: sum });
        }

        rankArray.sort((a, b) => b.total - a.total);
        const rank =
            rankArray.findIndex((r) => r.si_id === studentid) + 1;

        // ------------------------------
        // STEP 6: SUBJECT-WISE RESULT
        // ------------------------------
        const subjects = await tbl_exam_schedule_assign.findAll({
            where: { esa_es_id: actualExamScheduleId },
            include: [
                {
                    model: tbl_subject_master,
                    as: "esa"
                }
            ],
            raw: true,
            nest: true
        });

        const subjectResults = [];

        for (let s of subjects) {
            const ev = await tbl_exam_evaluation.findOne({
                where: {
                    ee_esa_id: s.esa_id,
                    ee_si_id: studentid
                },
                raw: true
            });

            const half = ev?.ee_marks || 0;
            const oral = ev?.ee_grace_marks || 0;
            //const total = half + oral;
            const total = (+half || 0) + (+oral || 0);

            const percent = Number(((total * 100) / s.esa_max_marks).toFixed(2));

            subjectResults.push({
                subjectName: s.esa.s_name,
                halfYearly: half,
                oral: oral,
                total: total,
                outofMarks: s.esa_max_marks,
                percentage: percent,
                grade: "" // use function if you have grade logic
            });
        }

        // ------------------------------
        // STEP 7: GRADING SCALE
        // ------------------------------
        const grading = await tbl_exam_grades.findAll({
            where: { eg_sc_id: schoolId },
            include: [
                {
                    model: tbl_grade_range,
                    as: "tbl_grade_ranges"
                }
            ],
            raw: true,
            nest: true
        });

        const gradingScale = grading.map((g) => ({
            range: `${g.tbl_grade_ranges.gr_min_range}-${g.tbl_grade_ranges.gr_max_range}`,
            grade: g.eg_name
        }));

        // ------------------------------
        // FINAL RESPONSE
        // ------------------------------
        return res.json({
            studentInfo: {
                schoolName: school.sc_name,
                session,
                studentName,
                studentClass: classData.c_name,
                studentDiv: classData.c_div || "A",
                studentRollNo: student.si_rollno,
                scholarNo: student.si_first_name.substring(0, 2).toUpperCase() + student.si_rollno,
                motherName: mother?.p_name || "N/A",
                fatherName: father?.p_name || "N/A",
                dateOfBirth: student.si_dob,
                totalMarks,
                percentage,
                overallGrade: "", // integrate grade function if required
                rank,
                promotionText: percentage >= 35 ? "Promoted" : "Need improvement"
            },

            subjectResults,
            gradingScale
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const getHomework = async (req,res) =>{
    const { schoolid, studentid } = req.body;

  if (!schoolid || !studentid) {
    return res.status(400).json({
      status: false,
      message: "schoolid & studentid are required"
    });
  }

  try {

    // 1️⃣ Get student's class & academic year
    let student = await tbl_student_info.findOne({
      where: {
        si_id: studentid,
        si_sc_id: schoolid
      },
      attributes: ["si_c_id", "si_ay_id"]
    });

    console.log('studemt :::>', student);

    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found"
      });
    }

    let studentClassId = student.si_c_id;
    let studentAyId = student.si_ay_id;

    // 2️⃣ Fetch homework details (converted from SP)
    let homeworkList = await tbl_study_material.findAll({
      where: {
        sm_sc_id: schoolid,
        sm_c_id: studentClassId,
        sm_type: "Homework",
        [Op.or]: [
          { sm_due_date: null },
          { sm_due_date: { [Op.gte]: sequelize.literal("CURRENT_DATE") } }

        ]
      },
      include: [
        {
          model: tbl_class_master,
          as:"sm_c",
          attributes: ["c_id", "c_name", "c_div"]
        },
        {
          model: tbl_staff,
          as:"sm_st",
          attributes: ["st_id", "st_name"],
          include: [
            {
              model: tbl_academic_year,
              as:"staff_aydata",
              attributes: ["ay_id", "ay_status_id"],
              where: { ay_status_id: 1 }
            }
          ]
        },
        {
          model: tbl_subject_allocation,
          as:"study_material_class",
          required: false,
          where: {
            sa_c_id: studentClassId,
            sa_ay_id: studentAyId
          },
          include: [
            {
              model: tbl_subject_master,
              as:"sa_subject",
              required: false,
              attributes: ["s_name"]
            }
          ]
        }
      ]
    });

    console.log('studemt homeworkList :::>', homeworkList);

    // 3️⃣ Convert response into SP output format
    const formatted = homeworkList.map((x) => ({
      id: x.sm_id,
      classid: x.sm_c_id,
      schoolid: x.sm_sc_id,
      teacherid: x.sm_st_id,
      teachername: x.sm_st?.st_name || "",
      div: x.sm_c?.c_div || "",
      class: x.sm_c?.c_name || "",
      subject: x.tbl_subject_allocation?.sa_subject?.s_name || "",
      title: x.sm_title,
      marks: x.sm_marks,
      duedate: x.sm_due_date,
      description: x.sm_description,
      date: x.sm_date,
      docname: x.sm_doc_url
        ? `http://localhost:56791/Document/ClassProfile/${x.sm_c_id}/${x.sm_doc_url}`
        : ""
    }));

    return res.json({
      status: true,
      data: formatted
    });
  } catch (err) {
    console.error("GetHomework Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message
    });
  }
}

const getStudentFees = async (req, res) => {
  const { schoolId, studentId } = req.body;

  try {
    const data = await tbl_invoice_records.findAll({
      where: {
        ir_si_id: studentId
      },
      include: [
        {
          model: tbl_invoice_master,
          as: "ir_i",
          attributes: ["i_title"],
          required: true
        },
        {
          model: tbl_class_master,
          as: "ir_c",
          attributes: ["c_name", "c_div"],
          required: true
        },
        {
          model: tbl_student_info,
          as: "ir_si",
          attributes: ["si_first_name", "si_middle_name", "si_last_name"],
          required: true,
          where: {
            si_sc_id: schoolId
          },
          include: [
            {
              model: tbl_academic_year,
              as: "student_aydata",
              attributes: [],
              required: true,
              where: { ay_status_id: 1 }
            }
          ]
        },
        {
          // Payment Status (IR_STATUS)
          model: tbl_ref_codes,
          as: "payment_status",
          attributes: [["rc_name", "paymentstatus"]],
          required: true
        },
        {
          // Payment Method (IR_METHOD)
          model: tbl_ref_codes,
          as: "payment_mode",
          attributes: [["rc_name", "paymentmode"]],
          required: true
        }
      ],
      attributes: [
        ["ir_id", "invoicelistid"],
        ["ir_i_id", "invoiceid"],
        ["ir_c_id", "classid"],
        ["ir_si_id", "studentid"],
        ["ir_date", "date"],
        ["ir_total", "totalamount"],
        ["ir_payment", "paymentamount"]
      ],
      order: [["ir_date", "DESC"]]
    });

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

const getIndividualRanking = async (req, res) => {
  const { studentid, academicyearid, schoolid } = req.body;
  try {
    const examWeightage = 0.7;
    const attendanceWeightage = 0.3;

    /* --------------------------------------------- 
       STEP 1: Get student & class 
       --------------------------------------------- */
    const student = await tbl_student_info.findOne({
      where: {
        si_id: studentid,
        si_ay_id: academicyearid,
        ...(schoolid && { si_sc_id: schoolid })
      }
    });

    if (!student) {
      return res.json({
        studentid: null,
        studentname: "Student not found"
      });
    }

    const classid = student.si_c_id;

    /* --------------------------------------------- 
   STEP 2: Exam percentages for class 
   --------------------------------------------- */
const examRows = await tbl_exam_evaluation.findAll({
  include: [{
    model: tbl_exam_schedule_assign,
    as: "ee_esa",
    required: true,
    attributes: [], // ✓ DON'T SELECT ANY COLUMNS from this table
    include: [{
      model: tbl_exam_schedule,
      as: "esa_e",
      required: true,
      attributes: [], // ✓ DON'T SELECT ANY COLUMNS from this table
      where: { es_ay_id: academicyearid }
    }]
  }],
  attributes: [
    "ee_si_id",
    [
      sequelize.fn(
        "sum",
        sequelize.literal("ee_marks + coalesce(ee_grace_marks,0)")
      ),
      "obtained"
    ],
    [
      sequelize.fn("sum", sequelize.col("ee_esa.esa_max_marks")),
      "maxmarks"
    ]
  ],
  group: ["ee_si_id"],
  raw: true // ✓ ADD THIS to get plain objects
});

const examMap = {};
examRows.forEach(r => {
  const max = parseFloat(r.maxmarks) || 0; // ✓ Use r.maxmarks instead of r.get()
  examMap[r.ee_si_id] = max > 0 
    ? (parseFloat(r.obtained) / max) * 100 
    : 0;
});

    /* --------------------------------------------- 
       STEP 3: Attendance percentages 
       --------------------------------------------- */
    const attendanceRows = await tbl_student_attendance.findAll({
      attributes: [
        "sat_si_id",
        [sequelize.fn("count", sequelize.col("sat_id")), "total"],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              "case when sat_attendance_status in ('P','L') then 1 else 0 end"
            )
          ),
          "present"
        ]
      ],
      include: [{
        model: tbl_student_info,
        as: "student",
        attributes: [],        // ✅ VERY IMPORTANT
        required: true,
        where: {
          si_c_id: classid,
          si_ay_id: academicyearid
        }
      }],
      group: ["sat_si_id"],
      raw: true               // ✅ VERY IMPORTANT
    });

    const attendanceMap = {};
    attendanceRows.forEach(r => {
      const total = Number(r.total) || 0;
      attendanceMap[r.sat_si_id] =
        total > 0 ? (Number(r.present) * 100) / total : 0;
    });


    /* --------------------------------------------- 
       STEP 4: Build ranking list 
       --------------------------------------------- */
    const students = await tbl_student_info.findAll({
      where: {
        si_c_id: classid,
        si_ay_id: academicyearid,
        ...(schoolid && { si_sc_id: schoolid })
      }
    });

    const ranked = students.map(s => {
      const exam = examMap[s.si_id] || 0;
      const att = attendanceMap[s.si_id] || 0;
      const overall = (exam * examWeightage) + (att * attendanceWeightage);

      return {
        studentid: s.si_id,
        studentname: `${s.si_first_name} ${s.si_middle_name || ""} ${s.si_last_name || ""}`.trim(),
        rollnumber: s.si_rollno,
        exampercentage: exam,
        attendancepercentage: att,
        overallpercentage: overall
      };
    });

    ranked.sort((a, b) => b.overallpercentage - a.overallpercentage);
    ranked.forEach((r, i) => r.classrank = i + 1);

    const totalStudents = ranked.length;
    const classAverage = ranked.reduce((a, b) => a + b.overallpercentage, 0) / totalStudents;
    const studentRank = ranked.find(r => r.studentid === studentid);

    /* --------------------------------------------- 
   STEP 5: Top 3 subjects for student 
   --------------------------------------------- */
const subjectRows = await tbl_exam_evaluation.findAll({
  where: { ee_si_id: studentid },
  include: [
    {
      model: tbl_exam_schedule_assign,
      as: "ee_esa",
      required: true,
      include: [
        {
          model: tbl_subject_master,
          as: "esa",
          required: true,
          attributes: ['s_id', 's_name'] // Only select what you need
        },
        {
          model: tbl_exam_schedule,
          as: "esa_e",
          required: true,
          where: { es_ay_id: academicyearid },
          attributes: [] // Don't select any attributes from exam_schedule
        }
      ],
      attributes: ['esa_id', 'esa_max_marks'] // Only select what you need
    }
  ],
  attributes: [
    [sequelize.col("ee_esa.esa.s_id"), "subject_id"], // Add subject_id to GROUP BY
    [sequelize.col("ee_esa.esa.s_name"), "subject"],
    [
      sequelize.fn(
        "avg",
        sequelize.literal("(ee_marks + coalesce(ee_grace_marks,0)) / ee_esa.esa_max_marks * 100")
      ),
      "percentage"
    ]
  ],
  group: [
    "ee_esa.esa.s_id",      // Group by subject ID
    "ee_esa.esa.s_name",    // Group by subject name
    "ee_esa.esa_id",        // Group by the primary key of exam_schedule_assign
    "ee_esa.esa_max_marks"  // Group by max_marks if used in the literal
  ],
  order: [[sequelize.literal("percentage"), "DESC"]],
  limit: 3,
  raw: true // Use raw to avoid Sequelize adding extra columns
});

const topSubjects = subjectRows
  .map(s => `${s.subject} (${Number(s.percentage).toFixed(2)}%)`)
  .join(", ");

    /* --------------------------------------------- 
       STEP 6: Final response 
       --------------------------------------------- */
    const classInfo = await tbl_class_master.findOne({
      where: { c_id: classid }
    });

    return res.json({
      studentid,
      studentname: studentRank.studentname,
      rollnumber: studentRank.rollnumber,
      classid,
      classname: classInfo?.c_name,
      division: classInfo?.c_div,
      exampercentage: studentRank.exampercentage,
      attendancepercentage: studentRank.attendancepercentage,
      overallpercentage: studentRank.overallpercentage,
      classrank: studentRank.classrank,
      totalstudents: totalStudents,
      performancecategory: 
        studentRank.overallpercentage >= 90 ? "Excellent" :
        studentRank.overallpercentage >= 80 ? "Very Good" :
        studentRank.overallpercentage >= 70 ? "Good" :
        studentRank.overallpercentage >= 60 ? "Average" : "Poor",
      performancedifference: studentRank.overallpercentage - classAverage,
      percentile: ((totalStudents - studentRank.classrank + 1) / totalStudents * 100).toFixed(2),
      topsubjects: topSubjects
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errorcode: "0",
      errormessage: "Internal Server Error"
    });
  }
};

const getAllocateSubject = async (req, res) => {
  try {
    const { SchoolId, ClassId } = req.body;   // Data.Id → SchoolId

    const result = await tbl_subject_allocation.findAll({
      where: {},
      include: [
        {
          model: tbl_class_master,
          as: "sa_c",
          where: { c_id: ClassId },
          attributes: ["c_name", "c_div", "c_id"]
        },
        {
          model: tbl_staff,
          as: "sa_st",
          where: { st_sc_id: SchoolId },
          attributes: ["st_name", "st_id"]
        },
        {
          model: tbl_academic_year,
          as: "subject_academic_year",
          where: { ay_status_id: 1 },
          attributes: [
            "ay_id",
            "ay_start_year",
            "ay_end_year"
          ]
        },
        {
          model: tbl_subject_master,
          as: "sa_subject",
          attributes: ["s_name", "s_id"]
        }
      ],
      attributes: ["sa_id"]  // Main ID
    });

    // Format like stored procedure output
    const response = result.map(row => ({
      id: row.sa_id,
      classnumber: row.sa_c?.c_name,
      classdiv: row.sa_c?.c_div,
      classid: row.sa_c?.c_id,
      teachername: row.sa_st?.st_name,
      teacherid: row.sa_st?.st_id,
      subjectname: row.sa_subject?.s_name,
      subjectid: row.sa_subject?.s_id,
      academicyear: `(${row.subject_academic_year?.ay_start_year} - ${row.subject_academic_year?.ay_end_year})`,
      academicyearid: row.subject_academic_year?.ay_id
    }));

    res.status(200).json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subject allocation" });
  }
};


module.exports = {
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
};