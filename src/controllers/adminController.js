const { 
    tbl_academic_year,
    tbl_student_info,
    tbl_ref_codes,
    tbl_class_master,

    tbl_student_manage,
    tbl_student_attendance,
    tbl_parent,
    tbl_subject_master,

    tbl_class_teacher,
    tbl_timetable,
    tbl_subject_allocation,
    tbl_teacher_manage,
    tbl_timetable_assign,
    tbl_staff,
    tbl_exam_type,
    tbl_exam_schedule,
    tbl_exam_schedule_assign,
    tbl_exam_evaluation,
    tbl_staff_attendance,
    tbl_exam_grades,
    tbl_transport,
    tbl_grade_range,
    tbl_invoice_master,
    tbl_invoice_records,
    tbl_expense_master,
    tbl_expense_records,
    tbl_library,
    tbl_notice,
    tbl_notice_type
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../models");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcryptjs');

const getStudentAllRecords = async (req, res) => {
  const { schoolid, classid } = req.body;

  if (!schoolid) {
    return res.status(400).json({
      status: false,
      message: "schoolid is required"
    });
  }

  try {
    const whereCondition = {
      si_sc_id: schoolid,
    };

    // If classId is provided, add filter
    if (classid) {
      whereCondition["$classdata.c_id$"] = classid;
    }

    const students = await tbl_student_info.findAll({
      attributes: [
        ["si_id", "studentid"],
        ["si_ay_id", "academicyearid"],
        [
          sequelize.literal(
            "CONCAT(student_aydata.ay_start_year,' - ', student_aydata.ay_end_year)"
          ),
          "academicyear"
        ],
        ["si_first_name", "firstname"],
        ["si_middle_name", "middlename"],
        ["si_last_name", "lastname"],
        ["si_mother_tongue", "mothertongue"],
        ["si_blood_group", "bloodgroup"],
        ["si_rollno", "rollno"],
        ["si_phone_number", "studentmobilenumber"],
        ["si_dob", "birthdate"],
        ["si_email_id", "studentemail"],
        [sequelize.col("genderdata.rc_name"), "gender"],
        ["si_gender", "gendercode"],
        ["si_address", "studentaddress"],
        ["si_religion", "religion"],
        ["si_nationality", "nationality"],
        ["si_pin_code", "pincode"],
        ["si_state", "states"],
        ["si_city", "city"],
        ["si_create_dt", "createddate"],
        ["si_update_dt", "updateddate"],
        [sequelize.col("classdata.c_name"), "classnumber"],
        [sequelize.col("classdata.c_div"), "classdiv"],
        [sequelize.col("classdata.c_id"), "classid"],
        [
          sequelize.literal(`
            CASE 
              WHEN si_image_url IS NULL THEN '' 
              ELSE CONCAT('http://localhost:56791/Image/StudentProfile/', si_id,'/', si_image_url)
            END
          `),
          "imagename"
        ]
      ],

      include: [
        {
          model: tbl_ref_codes,
          as: "genderdata",
          attributes: [],
          required: true,
          where: { rc_type: "Gender" },
        },
        {
          model: tbl_academic_year,
          as: "student_aydata",
          attributes: [],
          required: true,
          where: { ay_status_id: 1 }
        },
        {
          model: tbl_class_master,
          as: "classdata",
          attributes: [],
          required: true
        }
      ],

      where: whereCondition,
      order: [["si_rollno", "ASC"]]
    });

    return res.status(200).json({
      status: true,
      data: students
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: err.message
    });
  }
};

const saveStudentDetail = async (req, res) => {
  const data = req.body;

  try {
    let studentId = data.studentid || null;
    let flag = true;

    // If Insert → Generate new GUID
    if (!studentId) {
      studentId = uuidv4();
      flag = false;
    }

    // -----------------------------------------
    // 1️⃣ INSERT / UPDATE - STUDENT INFO
    // -----------------------------------------

    const studentPayload = {
      si_id: studentId,
      si_sc_id: data.schoolid,
      si_user_name: data.username,
      si_password_hash: data.password,
      si_first_name: data.firstname,
      si_middle_name: data.middlename || null,
      si_last_name: data.lastname || null,
      si_c_id: data.classid,
      si_mother_tongue: data.mothertongue || null,
      si_blood_group: data.bloodgroup || null,
      si_rollno: data.rollno || null,
      si_phone_number: data.studentmobilenumber || null,
      si_dob: data.birthdate,
      si_email_id: data.studentemail || null,
      si_gender: data.gender || null,
      si_address: data.studentaddress || null,
      si_religion: data.religion || null,
      si_nationality: data.nationality || null,
      si_pin_code: data.pincode || null,
      si_state: data.states || null,
      si_city: data.city || null,
      si_image_url: data.imagename || null,
      si_ay_id: data.academicyearid,
      si_update_dt: new Date(),
      si_update_by: data.schoolid
    };

    await tbl_student_info.upsert(studentPayload);

    // -----------------------------------------
    // 2️⃣ INSERT / UPDATE – STUDENT MANAGE
    // -----------------------------------------
    if(flag == false){
      await tbl_student_manage.upsert({
        sm_id: uuidv4(),
        sm_ay_id: data.academicyearid,
        sm_si_id: studentId
      });
    }
    

    // -----------------------------------------
    // 3️⃣ INSERT / UPDATE PARENTS
    // -----------------------------------------

    const parentTypes = [
      { type: "FA", name: data.fathername, occ: data.fatheroccupation, mob: data.fathermobilenumber, email: data.fatheremail, addr: data.fatherofficeaddress },
      { type: "MO", name: data.mothername, occ: data.motheroccupation, mob: data.mothermobilenumber, email: data.motheremail, addr: data.motherofficeaddress },
      { type: "L",  name: data.localguardian, occ: data.localguardianoccupation, mob: data.localguardianmobilenumber, email: data.localguardianemail, addr: data.localguardianofficeaddress }
    ];

    for (const p of parentTypes) {
      const existing = await tbl_parent.findOne({
        where: { p_si_id: studentId, p_parent_type: p.type }
      });

      if (existing) {
        await existing.update({
          p_name: p.name || null,
          p_profession: p.occ || null,
          p_mobile_number: p.mob || null,
          p_email_id: p.email || null,
          p_address: p.addr || null,
          p_update_dt: new Date(),
          p_update_by: data.schoolid
        });
      } else {
        await tbl_parent.create({
          p_id: uuidv4(),
          p_sc_id: data.schoolid,
          p_name: p.name || null,
          p_profession: p.occ || null,
          p_mobile_number: p.mob || null,
          p_email_id: p.email || null,
          p_address: p.addr || null,
          p_parent_type: p.type,
          p_create_by: data.schoolid,
          p_create_dt: new Date(),
          p_update_dt: new Date(),
          p_si_id: studentId
        });
      }
    }

    return res.json({
      status: true,
      errorcode: "1",
      message: studentId ? "Updated Successfully" : "Added Successfully",
      studentid: studentId,
      classid: data.classid
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Error while saving student details"
    });
  }
};

const deleteStudent = async (req, res) => {
  const { studentid } = req.body;

  if (!studentid) {
    return res.status(400).json({
      status: false,
      message: "studentid is required"
    });
  }

  const t = await sequelize.transaction();

  try {
    // 1️⃣ Delete student manage records
    await tbl_student_manage.destroy({
      where: { sm_si_id: studentid },
      transaction: t
    });

    // 2️⃣ Delete student attendance
    await tbl_student_attendance.destroy({
      where: { sat_si_id: studentid },
      transaction: t
    });

    // 3️⃣ Delete parent details
    await tbl_parent.destroy({
      where: { p_si_id: studentid },
      transaction: t
    });

    // 4️⃣ Delete student info
    await tbl_student_info.destroy({
      where: { si_id: studentid },
      transaction: t
    });

    await t.commit();

    return res.status(200).json({
      errorcode: "1",
      errormessage: "Deleted Successfully"
    });

  } catch (error) {
    await t.rollback();
    console.error("Delete Student Error:", error);

    return res.status(500).json({
      errorcode: "0",
      errormessage: "Something went wrong",
      error: error.message
    });
  }
};

const getParentData = async (req, res) => {
  const { studentid } = req.body;

  if (!studentid) {
    return res.status(400).json({
      status: false,
      message: "studentid is required"
    });
  }

  try {
    const query = `
      select 
          tp.p_id            as p_id,
          tp.p_si_id         as p_si_id,
          tp.p_name          as fathername,
          tp.p_profession    as fatheroccupation,
          tp.p_mobile_number as fathermobilenumber,
          tp.p_address       as fatherofficeaddress,
          tp.p_email_id      as fatheremail,

          tp2.p_name          as mothername,
          tp2.p_profession    as motheroccupation,
          tp2.p_mobile_number as mothermobilenumber,
          tp2.p_address       as motherofficeaddress,
          tp2.p_email_id      as motheremail,

          tp3.p_name          as localguardian,
          tp3.p_profession    as localguardianoccupation,
          tp3.p_mobile_number as localguardianmobilenumber,
          tp3.p_address       as localguardianofficeaddress,
          tp3.p_email_id      as localguardianemail

      from tbl_student_info tsi
      inner join tbl_parent tp  
          on tp.p_si_id = tsi.si_id and tp.p_parent_type = 'FA'
      inner join tbl_parent tp2 
          on tp2.p_si_id = tsi.si_id and tp2.p_parent_type = 'MO'
      inner join tbl_parent tp3 
          on tp3.p_si_id = tp.p_si_id and tp3.p_parent_type = 'L'
      where tsi.si_id = :studentid;
    `;

    const data = await sequelize.query(query, {
      replacements: { studentid },
      type: sequelize.QueryTypes.SELECT
    });

    return res.status(200).json({
      status: true,
      data: data.length ? data[0] : null
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

const saveTeacher = async (req, res) => {
  const {
    teacherid,
    schoolid,
    academicyearid,
    imagename,
    name,
    birthdate,
    gender,
    stafftype,
    address,
    mobilenumber,
    emailid,
    password
  } = req.body;

  console.log('req.body ::::>', req.body);
  const hashedPassword = await bcrypt.hash(password, 10);


  try {
    // Check record exists for duplicate prevention
    const existing = await tbl_staff.findOne({
      where: {
        st_user_name: name,
        st_sc_id: schoolid
      }
    });

    // CREATE MODE
    if (!teacherid) {
      if (existing) {
        return res.json({
          errorcode: "2",
          errormessage: "Record Already Exists"
        });
      }

      const newTeacher = await tbl_staff.create({
        st_id: uuidv4(),
        st_sc_id: schoolid,
        st_ay_id: academicyearid,
        st_user_name: name,
        st_password_hash: hashedPassword,
        st_name: name,
        st_dob: birthdate,
        st_email_id: emailid,
        st_password: password,
        st_gender: gender,
        st_type: stafftype,
        st_phone_number: mobilenumber,
        st_address: address,
        st_create_dt: new Date(),
        st_create_by: schoolid,
        st_update_dt: new Date(),
        st_image_url: imagename
      });

      return res.json({
        errorcode: "1",
        errormessage: "Added Successfully",
        teacherid: newTeacher.st_id
      });
    }

    // UPDATE MODE
    else {
      // Check duplicate excluding same teacher
      const duplicate = await tbl_staff.findOne({
        where: {
          st_user_name: name,
          st_sc_id: schoolid,
          st_id: { [Op.ne]: teacherid }
        }
      });

      if (duplicate) {
        return res.json({
          errorcode: "2",
          errormessage: "Record Already Exists"
        });
      }

      await tbl_staff.update(
        {
          st_name: name,
          st_ay_id: academicyearid,
          st_dob: birthdate,
          st_email_id: emailid,
          st_password: password,
          st_password_hash: hashedPassword,
          st_gender: gender,
          st_phone_number: mobilenumber,
          st_address: address,
          st_update_dt: new Date(),
          st_update_by: schoolid,
          st_image_url: imagename
        },
        { where: { st_id: teacherid } }
      );

      return res.json({
        errorcode: "1",
        errormessage: "Updated Successfully",
        teacherid: teacherid
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errorcode: "500",
      errormessage: "Internal Server Error"
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
      password: t.st_password,
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

const deleteTeacher = async (req, res) => {
    const { teacherid } = req.body;

    if (!teacherid) {
        return res.status(400).json({ errorcode: 0, errormessage: "TeacherId is required" });
    }

    try {
        // Delete child relationships first
        await tbl_class_teacher.destroy({ where: { ct_st_id: teacherid } });
        await tbl_subject_allocation.destroy({ where: { sa_st_id: teacherid } });
        await tbl_teacher_manage.destroy({ where: { tm_st_id: teacherid } });
        await tbl_timetable_assign.destroy({ where: { ta_st_id: teacherid } });
        
        // Finally delete teacher
        const staffDeleted = await tbl_staff.destroy({ where: { st_id: teacherid } });

        if (staffDeleted === 0) {
            return res.status(404).json({
                errorcode: 0,
                errormessage: "Teacher not found"
            });
        }

        return res.status(200).json({
            errorcode: 1,
            errormessage: "Deleted Successfully"
        });

    } catch (error) {
        console.error("DeleteTeacher Error:", error);
        return res.status(500).json({
            errorcode: 0,
            errormessage: "Server Error"
        });
    }
};

const getMultipleLectures = async (req, res) => {
    try {
        const { teacherid } = req.body;

        if (!teacherid) {
            return res.status(400).json({
                errorcode: "0",
                errormessage: "TeacherId is required"
            });
        }

        // Check if teacher has any subject allocations
        const allocationExists = await tbl_subject_allocation.findOne({
            where: { sa_st_id: teacherid }
        });

        if (!allocationExists) {
            return res.json({
                errorcode: "3",
                errormessage: "No Lectures Assigned For This Teacher"
            });
        }

        // Fetch all lectures with includes
        const lectures = await tbl_staff.findAll({
            where: { st_id: teacherid },
            attributes: ["st_id", "st_name"],
            include: [
                {
                    model: subject_allocation,
                    as: "subject_allocations",
                    attributes: ["sa_st_id"],
                    include: [
                        {
                            model: tbl_academic_year,
                            as: "academic_year",
                            where: { ay_status_id: "1" },
                            attributes: []
                        },
                        {
                            model: tbl_class_master,
                            as: "class_master",
                            attributes: ["c_name", "c_div"]
                        },
                        {
                            model: tbl_subject_master,
                            as: "subject_master",
                            attributes: ["s_name", "s_create_dt"]
                        }
                    ]
                }
            ]
        });

        // Format API response like stored procedure output
        const finalData = lectures.map(e => {
            const alloc = e.subject_allocations;
            return {
                teacherid: e.st_id,
                name: e.st_name,
                class: alloc.class_master.c_name,
                div: alloc.class_master.c_div,
                subjectname: alloc.subject_master.s_name,
                s_create_dt: alloc.subject_master.s_create_dt
            };
        });

        return res.json(finalData);

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            errorcode: "500",
            errormessage: "Internal Server Error"
        });
    }
};

const saveClassMaster = async (req, res) => {
    try {
      
        const { classname, schoolid, classdiv } = req.body;
        console.log(req.body);
        // 1) Check if record already exists
        const exists = await tbl_class_master.findOne({
            where: {
                c_name: classname,
                c_div: classdiv,
                c_sc_id: schoolid
            }
        });

        if (exists) {
            return res.json({
                errorcode: "2",
                errormessage: "Record Already Exists"
            });
        }

        // 2) Insert new class
        await tbl_class_master.create({
            c_id: uuidv4(),
            c_sc_id: schoolid,
            c_name: classname,
            c_div: classdiv,
            c_create_dt: new Date(),
            c_update_dt: new Date()
        });

        return res.json({
            errorcode: "1",
            errormessage: "Added Successfully"
        });

    } catch (err) {
        return res.json({
            errorcode: "500",
            errormessage: err.message
        });
    }
};

const deleteClassMaster = async (req, res) => {
    const { id } = req.body;

    try {
        // 1️⃣ Check if class exists in TBL_CLASS_TEACHER
        const exists = await tbl_class_teacher.findOne({
            where: { ct_c_id: id }
        });

        if (exists) {
            return res.json({
                errorcode: "2",
                errormessage: "Class exists in student and teacher record"
            });
        }

        // 2️⃣ Use transaction for delete sequence
        const t = await sequelize.transaction();

        try {
            // Delete from TBL_STUDENT_INFO
            await tbl_student_info.destroy({
                where: { si_c_id: id },
                transaction: t
            });

            // Delete from TBL_SUBJECT_ALLOCATION
            await tbl_subject_allocation.destroy({
                where: { sa_c_id: id },
                transaction: t
            });

            // Delete from TBL_TIMETABLE
            await tbl_timetable.destroy({
                where: { ti_c_id: id },
                transaction: t
            });

            // Delete from TBL_CLASS_MASTER
            await tbl_class_teacher.destroy({
                where: { ct_c_id: id },
                transaction: t
            });

            await tbl_class_master.destroy({
                where: { c_id: id },
                transaction: t
            });


            // Commit transaction
            await t.commit();

            return res.json({
                errorcode: "1",
                errormessage: "Deleted Successfully"
            });

        } catch (err) {
          console.log(err);
            await t.rollback();
            throw err;
        }

    } catch (error) {
        return res.status(500).json({
            errorcode: "500",
            errormessage: "Server Error",
            error: error.message
        });
    }
};

const getClassMaster = async (req, res) => {
    try {
        const { schoolid } = req.body;   // id = SchoolId

        if (!schoolid) {
            return res.status(400).json({
                errorcode: "0",
                errormessage: "SchoolId is required"
            });
        }

        // Query using Sequelize Associations
        const classList = await tbl_class_master.findAll({
            where: { c_sc_id: schoolid },
            attributes: [
                "c_id",
                "c_name",
                "c_div"
            ],
            include: [
                {
                    model: tbl_ref_codes,
                    as: "refcode",
                    attributes: ["rc_name"],
                    where: {
                        rc_type: "ClassNumber"
                    },
                    required: true
                }
            ]
        });

        // Format response to match SP output
        const response = classList.map(x => ({
            id: x.c_id,
            code: x.c_name,
            name: x.refcode.rc_name,
            division: x.c_div
        }));

        return res.json(response);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorcode: "0",
            errormessage: "Internal Server Error"
        });
    }
}

const saveSubject = async (req, res) => {
    try {
        const { id, schoolid, subjectname } = req.body;

        // INSERT (id = null or empty)
        if (!id) {
            const newSubject = await tbl_subject_master.create({
                s_id: uuidv4(),
                s_sc_id: schoolid,
                s_name: subjectname,
                s_create_by: schoolid,
                s_create_dt: new Date(),
                s_update_dt: new Date()
            });

            return res.json({
                errorcode: "1",
                errormessage: "Added Successfully",
                data: newSubject
            });
        }

        // UPDATE
        const subjectExists = await tbl_subject_master.findOne({
            where: { s_id: id }
        });

        if (!subjectExists) {
            return res.json({
                errorcode: "0",
                errormessage: "Invalid Subject Id"
            });
        }

        await tbl_subject_master.update(
            {
                s_name: subjectname,
                s_update_by: schoolid,
                s_update_dt: new Date()
            },
            { where: { s_id: id } }
        );

        return res.json({
            errorcode: "1",
            errormessage: "Updated Successfully"
        });
    } catch (err) {
        return res.status(500).json({
            errorcode: "500",
            errormessage: err.message
        });
    }
};

const deleteSubject = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.json({
            errorcode: "0",
            errormessage: "Id is required"
        });
    }

    try {
        // 1) Delete from TBL_SUBJECT_ALLOCATION
        await tbl_subject_allocation.destroy({
            where: { sa_s_id: id }
        });

        // 2) Delete from TBL_TEACHER_MANAGE
        await tbl_teacher_manage.destroy({
            where: { tm_s_id: id }
        });

        // 3) Delete from TBL_SUBJECT_MASTER
        const deleted = await tbl_subject_master.destroy({
            where: { s_id: id }
        });

        if (deleted === 0) {
            return res.json({
                errorcode: "0",
                errormessage: "Subject not found"
            });
        }

        return res.json({
            errorcode: "1",
            errormessage: "Deleted Successfully"
        });

    } catch (error) {
        return res.json({
            errorcode: "500",
            errormessage: error.message
        });
    }
};

const getSubjectRecords = async (req, res) => {
    try {
        const { schoolid } = req.body;

        if (!schoolid) {
            return res.status(400).json({
                errorcode: "0",
                errormessage: "SchoolId is required"
            });
        }

        const subjects = await tbl_subject_master.findAll({
            where: { s_sc_id: schoolid },
            attributes: [
                ["s_id", "id"],
                ["s_name", "subjectname"]
            ]
        });

        return res.status(200).json(subjects);

    } catch (err) {
        return res.status(500).json({
            errorcode: "0",
            errormessage: err.message
        });
    }
};

const getClassWithDiv = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const classes = await tbl_class_master.findAll({
      distinct: true, // 👈 THIS is the correct way
      attributes: [
        ["c_name", "classnumber"],
        "c_sc_id"
      ],
      include: [
        {
          model: tbl_ref_codes,
          as: "refcode",
          where: {
            rc_type: "ClassNumber"
          },
          attributes: ["rc_name"],
          required: true
        }
      ],
      raw:true,
      where: { c_sc_id: schoolid }
    });
    console.log('classes:::>',classes);
    const finalResponse = [];

    for (let cls of classes) {
      let divs = await tbl_class_master.findAll({
        where: {
          c_name: cls.classnumber,
          c_sc_id: schoolid
        },
        attributes: [
          ["c_id", "classid"],
          ["c_div", "divname"]
        ]
      });

      finalResponse.push({
        name: cls["refcode.rc_name"],
        schoolid: cls.c_sc_id,
        classnumber: cls.classnumber,
        divList: divs
      });
    }

    return res.json(finalResponse);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errorcode: 0,
      errormessage: "Internal Server Error"
    });
  }
};


const getAcademicYear = async (req, res) => {
  const { schoolid } = req.body;   // SchoolId comes in Data.Id

  if (!schoolid) {
    return res.status(400).json({
      status: false,
      message: "SchoolId (id) is required"
    });
  }

  try {
    const years = await tbl_academic_year.findAll({
      where: { ay_sc_id: schoolid },
      attributes: [
        ["ay_id", "id"],
        ["ay_start_year", "startyear"],
        ["ay_start_month", "startmonth"],
        ["ay_end_year", "endyear"],
        ["ay_end_month", "endmonth"],
        ["ay_status_id", "statusid"]
      ],
      raw: true
    });

    // Add computed fields manually (statusname, monthnames)
    const monthNames = [
      "", "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const response = years.map(y => ({
      ...y,
      statusname: y.statusid === 1 ? "Active" : "Deactive",
      startmonthname: monthNames[y.startmonth],
      endmonthname: monthNames[y.endmonth]
    }));

    return res.status(200).json({
      status: true,
      data: response
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message
    });
  }
};

const saveAcademicYear = async (req, res) => {
    const {
        id,
        schoolid,
        startyear,
        startmonth,
        endyear,
        endmonth,
        statusid
    } = req.body;

    const t = await sequelize.transaction();

    try {
        // If statusid = 1, set all other academic years of this school to inactive
        if (statusid === 1) {
            await tbl_academic_year.update(
                { ay_status_id: 0 },
                { where: { ay_sc_id: schoolid }, transaction: t }
            );
        }

        // INSERT CASE
        if (!id || id === "") {
            const newYear = await tbl_academic_year.create({
                ay_id: uuidv4(),
                ay_sc_id: schoolid,
                ay_start_year: startyear,
                ay_start_month: startmonth,
                ay_end_year: endyear,
                ay_end_month: endmonth,
                ay_status_id: statusid,
                ay_create_dt: new Date(),
                ay_create_by: schoolid,
                ay_update_dt: new Date(),
                ay_update_by: schoolid
            }, { transaction: t });

            await t.commit();

            return res.json({
                errorcode: "1",
                errormessage: "Added Successfully"
            });
        }

        // UPDATE CASE
        await tbl_academic_year.update({
            ay_start_year: startyear,
            ay_start_month: startmonth,
            ay_end_year: endyear,
            ay_end_month: endmonth,
            ay_status_id: statusid,
            ay_update_dt: new Date(),
            ay_update_by: schoolid
        },
        {
            where: { ay_id: id, ay_sc_id: schoolid },
            transaction: t
        });

        await t.commit();

        return res.json({
            errorcode: "1",
            errormessage: "Updated Successfully"
        });

    } catch (err) {
        await t.rollback();
        return res.status(500).json({
            errorcode: "0",
            errormessage: err.message
        });
    }
};

const deleteAcademicYear = async (req, res) => {
    const { id } = req.body;

    try {
        // 1) Check if academic year exists in student record
        const existsInStudent = await tbl_student_info.findOne({
            where: { si_ay_id: id }
        });

        if (existsInStudent) {
            return res.json({
                errorcode: "2",
                errormessage: "Academic year exists in student record"
            });
        }

        // 2) Delete from tbl_subject_allocation
        await tbl_subject_allocation.destroy({
            where: { sa_ay_id: id }
        });

        // 3) Delete from tbl_student_manage
        await tbl_student_manage.destroy({
            where: { sm_ay_id: id }
        });

        // 4) Delete from tbl_class_teacher
        await tbl_class_teacher.destroy({
            where: { ct_ay_id: id }
        });

        // 5) Delete academic year
        await tbl_academic_year.destroy({
            where: { ay_id: id }
        });

        return res.json({
            errorcode: "1",
            errormessage: "Deleted Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            errorcode: "500",
            errormessage: error.message
        });
    }
};

const getManageTeacher = async (req, res) => {
    try {
        const { schoolid, academicyearid } = req.body;

        let whereCondition = {
            "$tm_ay.ay_sc_id$": schoolid
        };

        if (academicyearid) {
            whereCondition.tm_ay_id = academicyearid;
        }

        const result = await tbl_teacher_manage.findAll({
            where: whereCondition,
            include: [
                {
                    model: tbl_subject_master,
                    as: "tm_",
                    attributes: ["s_id", "s_name"]
                },
                {
                    model: tbl_staff,
                    as: "tm_st",
                    attributes: ["st_id", "st_name"]
                },
                {
                    model: tbl_academic_year,
                    as: "tm_ay",
                    attributes: ["ay_id", "ay_start_year", "ay_end_year"]
                }
            ]
        });

        const formatted = result.map(x => ({
            id: x.tm_id,
            subjectname: x.tm_.s_name,
            subjectid: x.tm_.s_id,
            teacherid: x.tm_st.st_id,
            academicyearid: x.tm_ay.ay_id,
            teachername: x.tm_st.st_name,
            academicyear: `(${x.tm_ay.ay_start_year} - ${x.tm_ay.ay_end_year})`
        }));

        return res.json(formatted);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};

const saveManageTeacher = async (req, res) => {
    try {
        const {
            id,
            teacherid,
            academicyearid,
            subjectid
        } = req.body;

        // Check for duplicate (subject + academic year + teacher)
        const duplicate = await tbl_teacher_manage.findOne({
            where: {
                tm_s_id: subjectid,
                tm_ay_id: academicyearid,
                tm_st_id: teacherid
            }
        });

        // 1️⃣ DUPLICATE FOUND
        if (duplicate) {
          return res.json({
              errorcode: "3",
              errormessage: "Record Already exists"
          });
        }

        // 2️⃣ INSERT OPERATION
        if (!id || id === "") {
            const newId = uuidv4();

            await tbl_teacher_manage.create({
                tm_id: newId,
                tm_ay_id: academicyearid,
                tm_st_id: teacherid,
                tm_s_id: subjectid
            });

            return res.json({
                errorcode: "1",
                errormessage: "Added Successfully"
            });
        }

        // 3️⃣ UPDATE OPERATION
        await tbl_teacher_manage.update(
            {
                tm_ay_id: academicyearid,
                tm_st_id: teacherid,
                tm_s_id: subjectid
            },
            {
                where: { tm_id: id }
            }
        );

        return res.json({
            errorcode: "1",
            errormessage: "Updated Successfully"
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const deleteManageTeacher = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                errorcode: "0",
                errormessage: "Id is required"
            });
        }

        const record = await tbl_teacher_manage.findByPk(id);

        if (!record) {
            return res.status(404).json({
                errorcode: "0",
                errormessage: "Record not found"
            });
        }

        await record.destroy();

        return res.status(200).json({
            errorcode: "1",
            errormessage: "Deleted Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            errorcode: "0",
            errormessage: error.message
        });
    }
};

const getClassTeacher = async (req, res) => {
    const { schoolid } = req.body;

    try {
      const teachers = await tbl_class_teacher.findAll({
          attributes: [
              ["ct_id", "id"]
          ],

          include: [
              {
                  model: tbl_class_master,
                  as:"ct_c",
                  attributes: [
                      ["c_name", "classnumber"],
                      ["c_div", "classdiv"],
                      ["c_id", "classid"]
                  ],
                  where: { c_sc_id: schoolid }
              },
              {
                  model: tbl_staff,
                  as: "ct_st",
                  attributes: [
                      ["st_name", "teachername"],
                      ["st_id", "teacherid"]
                  ]
              },
              {
                  model: tbl_academic_year,
                  as: "ct_ay",
                  attributes: [
                      ["ay_id", "academicyearid"],
                      [
                          sequelize.literal(
                              `CONCAT(' ( ', ct_ay.ay_start_year, ' - ', ct_ay.ay_end_year, ' )')`
                          ),
                          "academicyear"
                      ]
                  ],
                  where: { "ay_status_id": 1 }
              }
          ]
      });

      res.json(teachers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
}

const saveClassTeacher = async (req, res) => {
  try {
    const { ct_id, ct_st_id, ct_ay_id, ct_c_id } = req.body;

    // If ID is empty -> Create
    if (!ct_id || ct_id === "" || ct_id === "00000000-0000-0000-0000-000000000000") {
      let newId = uuidv4();
      console.log(newId);
      const created = await tbl_class_teacher.create({
        ct_id: newId,
        ct_st_id: ct_st_id,
        ct_ay_id: ct_ay_id,
        ct_c_id: ct_c_id
      });

      return res.json({
        errorcode: 1,
        errormessage: "Added Successfully",
        id: created.id
      });
    }

    // If ID exists -> Update
    const existing = await tbl_class_teacher.findByPk(ct_id);

    if (!existing) {
      return res.status(404).json({
        errorcode: 0,
        errormessage: "Record not found",
        id: id
      });
    }

    await existing.update({
      ct_st_id: ct_st_id,
      ct_ay_id: ct_ay_id,
      ct_c_id: ct_c_id
    });

    return res.json({
      errorcode: 1,
      errormessage: "Updated Successfully",
      id: id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errorcode: 0,
      errormessage: "Internal Server Error",
      errordetail: error.message
    });
  }
};

const deleteClassTeacherRecord = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                errorCode: 0,
                errorMessage: "Id is required"
            });
        }

        // Find record
        const record = await tbl_class_teacher.findOne({
            where: { ct_id: id }
        });

        if (!record) {
            return res.status(404).json({
                errorCode: 0,
                errorMessage: "Record not found"
            });
        }

        // Delete record
        await tbl_class_teacher.destroy({
            where: { ct_id: id }
        });

        return res.json({
            errorCode: 1,
            errorMessage: "Deleted Successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorCode: -1,
            errorMessage: "Something went wrong"
        });
    }
};

const getAllocateSubject = async (req, res) => {
  try {
    const { schoolid } = req.body;   // Data.Id → SchoolId

    const result = await tbl_subject_allocation.findAll({
      where: {},
      include: [
        {
          model: tbl_class_master,
          as: "sa_c",
          attributes: ["c_name", "c_div", "c_id"]
        },
        {
          model: tbl_staff,
          as: "sa_st",
          where: { st_sc_id: schoolid },
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

const saveAllocatedSubject = async (req, res) => {
    const {
        id,
        subjectid,
        teacherid,
        academicyearid,
        classid
    } = req.body;

    try {
        let record;

        // If no ID → Create new
        if (!id || id === "") {
          const subjectAllocationId = uuidv4();
            record = await tbl_subject_allocation.create({
                sa_id:subjectAllocationId,
                sa_st_id: teacherid,
                sa_ay_id: academicyearid,
                sa_c_id: classid,
                sa_s_id: subjectid
            });

            return res.json({
                errorcode: 1,
                errormessage: "Added Successfully",
                id: record.sa_id
            });
        }

        // If ID present → Update record
        const existing = await tbl_subject_allocation.findOne({
            where: { sa_id: id }
        });

        if (!existing) {
            return res.status(404).json({
                errorcode: 0,
                errormessage: "Record not found"
            });
        }

        await existing.update({
            sa_st_id: teacherid,
            sa_ay_id: academicyearid,
            sa_c_id: classid,
            sa_s_id: subjectid
        });

        return res.json({
            errorcode: 1,
            errormessage: "Updated Successfully",
            id: id
        });

    } catch (error) {
        return res.status(500).json({
            errorcode: -1,
            errormessage: error.message
        });
    }
};

const deleteAllocatedSubject = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                errorcode: "0",
                errormessage: "Id is required"
            });
        }

        // find record
        const row = await tbl_subject_allocation.findOne({
            where: { sa_id: id }
        });

        if (!row) {
            return res.status(404).json({
                errorcode: "0",
                errormessage: "Record not found"
            });
        }

        // delete record
        await tbl_subject_allocation.destroy({
            where: { sa_id: id }
        });

        return res.json({
            errorcode: "1",
            errormessage: "Deleted Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            errorcode: "0",
            errormessage: error.message
        });
    }
};

// const getTeacherBySubject = async (req, res) => {
//     try {
//         const { subjectid, schoolid } = req.body;

//         const result = await tbl_teacher_manage.findAll({
//             attributes: [],
//             where: {
//                 tm_s_id: subjectid
//             },
//             include: [
//                 {
//                     model: tbl_staff,
//                     as: "tm_st",
//                     attributes: ['st_name', 'st_id'],
//                     where: {
//                         st_sc_id: schoolid
//                     }
//                 }
//             ],
//             group: ['tm_st.st_id', 'tm_st.st_name']
//         });
//         console.log(result);

//         const response = result.map(r => ({
//             teachername: r.tm_st.st_name,
//             teacherid: r.tm_st.st_id
//         }));

//         return res.json(response);

//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: "Error fetching teachers" });
//     }
// };

const getTeacherBySubject = async (req, res) => {
  try {
      const { subjectid, schoolid } = req.body;

      const result = await tbl_teacher_manage.findAll({
          attributes: ['tm_st_id'], // REQUIRED
          where: {
              tm_s_id: subjectid
          },
          include: [
              {
                  model: tbl_staff,
                  as: "tm_st",
                  attributes: ['st_name', 'st_id'],
                  where: {
                      st_sc_id: schoolid
                  }
              }
          ],
          group: ['tm_st_id','tm_st.st_id', 'tm_st.st_name'],
          raw: true
      });

      const response = result.map(r => ({
          teachername: r['tm_st.st_name'],
          teacherid: r['tm_st.st_id']
      }));

      return res.json(response);

  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching teachers" });
  }
};


const saveTimeTable = async (req, res) => {
  const { classid, schoolid, academicyearid, weekdays } = req.body;
  console.log(req.body);

  const t = await tbl_timetable.sequelize.transaction();

  try {
    // -------------------------------------------
    // 1) CHECK IF TIMETABLE EXISTS
    // -------------------------------------------
    const existingTT = await tbl_timetable.findOne({
      where: { ti_c_id: classid },
      transaction: t,
    });

    if (existingTT) {
      // delete assign
      await tbl_timetable_assign.destroy({
        where: { ta_ti_id: existingTT.ti_id },
        transaction: t,
      });

      // delete timetable
      await tbl_timetable.destroy({
        where: { ti_c_id: classid },
        transaction: t,
      });
    }

    // -------------------------------------------
    // 2) INSERT NEW TIMETABLE
    // -------------------------------------------
    const timeTableId = uuidv4();

    await tbl_timetable.create(
      {
        ti_id: timeTableId,
        ti_sc_id: schoolid,
        ti_c_id: classid,
        ti_ay_id: academicyearid,
        ti_create_dt: new Date(),
        ti_create_by: schoolid,
        ti_update_dt: new Date(),
        ti_update_by: schoolid,
      },
      { transaction: t }
    );

    // -------------------------------------------
    // 3) INSERT TIMETABLE ASSIGN ROWS
    // -------------------------------------------
    for (let day of weekdays) {
      for (let slot of day.TimeTableTiming) {
        await tbl_timetable_assign.create(
          {
            ta_id: uuidv4(),
            ta_ti_id: timeTableId,
            ta_from: slot.StartTiming,
            ta_to: slot.EndTiming,
            ta_s_id: slot.SubjectId,
            ta_st_id: slot.TeacherId,
            ta_day_code: day.Code,
            ta_create_dt: new Date(),
            ta_update_dt: new Date(),
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    return res.json({
      errorcode: "1",
      errormessage: "Added Successfully",
      id: timeTableId,
    });
  } catch (err) {
    console.log(err);
    await t.rollback();
    return res.status(500).json({
      errorcode: "0",
      errormessage: "Error while saving timetable",
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
          ta.ta_st_id AS "TeacherId"
        FROM tbl_timetable_assign ta
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

const getActiveYearTeacherBySubject =async (req, res) => {
    const { subjectid, schoolid } = req.body;

    try {
        const result = await tbl_teacher_manage.findAll({
            where: {
                tm_s_id: subjectid
            },
            include: [
                {
                    model: tbl_staff,
                    as: "tm_st",
                    where: {
                        st_sc_id: schoolid
                    },
                    attributes: ["st_name", "st_id"]
                },
                {
                    model: tbl_academic_year,
                    as: "tm_ay",
                    where: {
                        ay_status_id: 1
                    },
                    attributes: []
                }
            ],
            attributes: []
        });

        const response = result.map(r => ({
            teachername: r.tm_st.st_name,
            teacherid: r.tm_st.st_id
        }));

        return res.json(response);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getStudentClassDailyAT = async (req, res) => {
    const { id, atdate, schoolid } = req.body; // classId, date, schoolId
    console.log('req.body :::>',req.body);

    try {

        // 1️⃣ Check if attendance already exists for this class & date
        const existingAttendance = await tbl_student_attendance.findOne({
            where: {
                sat_c_id: id,
                sat_date: atdate
            }
        });

        // 2️⃣ If attendance exists → return attendance + student details
        if (existingAttendance) {
            const attendanceList = await tbl_student_attendance.findAll({
                include: [
                    {
                        model: tbl_student_info,
                        as: "student",
                        attributes: [
                            "si_id",
                            "si_sc_id",
                            "si_first_name",
                            "si_middle_name",
                            "si_last_name",
                            "si_rollno",
                            "si_ay_id"
                        ],
                        include: [{
                            model: tbl_academic_year,
                            as: "student_aydata",
                            where: { ay_status_id: 1 }
                        }]
                    }
                ],
                where: {
                    sat_c_id: id,
                    sat_date: atdate
                },
                order: [["student", "si_rollno", "ASC"]]
            });

            return res.json(attendanceList.map(a => ({
                id: a.sat_id,
                studentid: a.student.si_id,
                schoolid: a.student.si_sc_id,
                firstname:
                    `${a.student.si_first_name} ${a.student.si_middle_name} ${a.student.si_last_name}`.trim(),
                rollno: a.student.si_rollno,
                academicyearid: a.student.si_ay_id,
                attend: a.sat_attendance_status,
                atdate: a.sat_date,
                classid: a.sat_c_id
            })));
        }

        // 3️⃣ Attendance does NOT exist → return student list only
        const studentList = await tbl_student_info.findAll({
            include: [
                {
                    model: tbl_academic_year,
                    as: "student_aydata",
                    where: { ay_status_id: 1 }
                }
            ],
            where: {
                si_c_id: id,
                si_sc_id: schoolid
            },
            order: [["si_rollno", "ASC"]]
        });

        return res.json(studentList.map(s => ({
            studentid: s.si_id,
            gender: s.si_gender,
            schoolid: s.si_sc_id,
            firstname:
                `${s.si_first_name} ${s.si_middle_name} ${s.si_last_name}`.trim(),
            rollno: s.si_rollno,
            academicyearid: s.si_ay_id
        })));

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const insertStudentClassDailyAT = async (req, res) => {
  const { atdate, id, schoolid, studentattendance } = req.body;

  try {
    for (const item of studentattendance) {
      const { studentid, attend, academicyearid } = item;

      // check if attendance exists for student + date
      const existing = await tbl_student_attendance.findOne({
        where: {
          sat_date: atdate,
          sat_si_id: studentid
        }
      });

      if (existing) {
        // update existing
        await existing.update({
          sat_attendance_status: attend,
          sat_update_by: schoolid,
          sat_update_dt: new Date()
        });

      } else {
        // insert new
        await tbl_student_attendance.create({
          sat_id: uuidv4(),
          sat_c_id: id,
          sat_si_id: studentid,
          sat_ay_id: academicyearid,
          sat_create_by: schoolid,
          sat_created_dt: new Date(),
          sat_attendance_status: attend,
          sat_date: atdate
        });
      }
    }

    return res.json({
      errorcode: 1,
      errormessage: "Saved Successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errorcode: 0,
      errormessage: "Something went wrong"
    });
  }
};

const getAtYearDdl = async (req, res) => {
    try {
        const { schoolid } = req.body;

        if (!schoolid) {
            return res.status(400).json({
                error: "schoolid is required"
            });
        }

        // Fetch AY_START_YEAR and AY_END_YEAR
        const years = await tbl_academic_year.findAll({
            where: { ay_sc_id: schoolid },
            attributes: ["ay_start_year", "ay_end_year"],
            raw: true
        });

        // Convert response into required list (UNION behavior)
        let formattedYears = [];

        years.forEach(y => {
            if (y.ay_start_year && y.ay_end_year) {
                formattedYears.push({ year: y.ay_start_year +'-' + y.ay_end_year});
            }
        });

        return res.json(formattedYears);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

const getStudentClassMonthlyAT = async (req, res) => {
  try {
    const { id, schoolid, year, month } = req.body;

    // 1️⃣ Get Active-year Students of the Class
    const students = await tbl_student_info.findAll({
      where: {
        si_c_id: id,
        si_sc_id: schoolid,
      },
      attributes: [
        ["si_id", "studentid"],
        ["si_sc_id", "schoolid"],
        [sequelize.literal("si_first_name || ' ' || si_middle_name || ' ' || si_last_name"), "firstname"],
        ["si_rollno", "rollno"],
        ["si_ay_id", "academicyearid"],
      ],
      include: [
        {
          model: tbl_academic_year,
          as: "student_aydata",
          where: { ay_status_id: 1 },
          attributes: [],
          required: true
        }
      ],
      order: [["si_rollno", "ASC"]],
    });

    // If no students found
    if (!students.length)
      return res.json([]);

    // 2️⃣ Generate date list for the month
    const daysInMonth = new Date(year, month, 0).getDate();

    const dates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      dates.push(dateStr);
    }

    // 3️⃣ Attach attendance to each student
    const finalData = [];

    for (const stu of students) {

      const attendance = await tbl_student_attendance.findAll({
        where: {
          sat_si_id: stu.dataValues.studentid,
          sat_date: { [Op.between]: [dates[0], dates[dates.length - 1]] }
        },
        attributes: [
          ["sat_date", "date"],
          ["sat_attendance_status", "attend"]
        ],
        order: [["sat_date", "ASC"]]
      });

      // Convert to { DateNumber, Attend }
      const studentAttendance = dates.map((fullDate, index) => {
        const found = attendance.find(x => x.date === fullDate);

        return {
          datenumber: index + 1,
          attend: found ? found.attend : null   // If no record, return null
        };
      });

      finalData.push({
        ...stu.dataValues,
        studentattendance: studentAttendance
      });
    }

    return res.json(finalData);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error", error: err });
  }
};

const getStaffDailyAT = async (req, res) => {
    try {
        const { id, type, atdate } = req.body;  // schoolId, staffType, attendance date

        // Check if attendance exists for the given date
        const exists = await tbl_staff_attendance.findOne({
            include: [
                {
                    model: tbl_staff,
                    as: "satt_st",
                    required: true,
                    where: { st_type: type }
                }
            ],
            where: {
                satt_sc_id: id,
                satt_date: atdate
            }
        });

        // If attendance exists → return today's attendance
        if (exists) {
            const attendanceList = await tbl_staff_attendance.findAll({
                include: [
                    {
                        model: tbl_staff,
                        as: "satt_st",
                        required: true,
                        where: { st_type: type },
                        include: [
                            {
                                model: tbl_academic_year,
                                as: "staff_aydata",
                                required: true,
                                where: { ay_status_id: 1 }
                            }
                        ]
                    }
                ],
                where: {
                    satt_sc_id: id,
                    satt_date: atdate
                },
                attributes: [
                    "satt_id",
                    "satt_date",
                    "satt_attendance_status"
                ]
            });

            const formatted = attendanceList.map(a => ({
                id: a.satt_id,
                teacherid: a.satt_st.st_id,
                schoolid: a.satt_st.st_sc_id,
                teachername: a.satt_st.st_name,
                stafftype: a.satt_st.st_type,
                attend: a.satt_attendance_status,
                atdate: a.satt_date
            }));

            return res.json(formatted);
        }

        // ELSE — Return staff list without attendance
        const staffList = await tbl_staff.findAll({
            where: {
                st_sc_id: id,
                st_type: type
            },
            include: [
                {
                    model: tbl_academic_year,
                    as: "staff_aydata",
                    required: true,
                    where: { ay_status_id: 1 }
                }
            ],
            attributes: [
                "st_id",
                "st_type",
                "st_sc_id",
                "st_name"
            ]
        });

        const formattedStaff = staffList.map(s => ({
            teacherid: s.st_id,
            stafftype: s.st_type,
            schoolid: s.st_sc_id,
            teachername: s.st_name
        }));

        return res.json(formattedStaff);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const insertStaffDailyAT = async (req, res) => {
  const { atdate, stafftype, id, staffattendance } = req.body;

  try {
    for (const item of staffattendance) {
      const teacherId = item.teacherid;
      const attend = item.attend;

      // 1️⃣ Check if attendance already exists for this teacher on the date
      const existingRecord = await tbl_staff_attendance.findOne({
        where: {
          satt_date: atdate,
          satt_st_id: teacherId
        },
        include: [
          {
            model: tbl_staff,
            as: "satt_st",
            where: { st_type: stafftype }
          }
        ]
      });

      // 2️⃣ If record exists → UPDATE
      if (existingRecord) {
        await tbl_staff_attendance.update(
          {
            satt_attendance_status: attend,
            satt_update_dt: new Date()
          },
          {
            where: { satt_st_id: teacherId }
          }
        );

        return res.json({
          errorcode: "1",
          errormessage: "Updated Successfully"
        });
      }

      // 3️⃣ Else → INSERT
      await tbl_staff_attendance.create({
        satt_id: uuidv4(),
        satt_sc_id: id,
        satt_st_id: teacherId,
        satt_created_dt: new Date(),
        satt_attendance_status: attend,
        satt_date: atdate
      });
    }

    return res.json({
      errorcode: "1",
      errormessage: "Added Successfully"
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errorcode: "0",
      errormessage: "Internal Server Error"
    });
  }
};

const getStaffMonthlyAT = async (req, res) => {
    try {
        const { id, teacherId, stafftype, year, month } = req.body; // schoolId, staffType

        // STEP 1: Get all staff for that school & type with active academic year
        const staffList = await tbl_staff.findAll({
            where: {
                st_sc_id: id,
                st_type: stafftype,
                st_id: teacherId
            },
            include: [
                {
                    model: tbl_academic_year,
                    as: "staff_aydata",
                    where: { ay_status_id: 1 },
                    required: true
                }
            ],
            attributes: ["st_id", "st_name", "st_type", "st_sc_id"]
        });

        // If no staff found
        if (!staffList.length) {
            return res.json([]);
        }

        const finalList = [];

        // STEP 2: For each staff → build month attendance array
        for (let staff of staffList) {

            const daysInMonth = new Date(year, month, 0).getDate(); // total days

            let attendanceArray = [];

            for (let d = 1; d <= daysInMonth; d++) {

                // Construct YYYY-MM-DD date
                const dateObj = new Date(year, month - 1, d);
                const dateStart = new Date(dateObj.setHours(0, 0, 0, 0));
                const dateEnd   = new Date(dateObj.setHours(23, 59, 59, 999));

                // Fetch attendance for this day
                const record = await tbl_staff_attendance.findOne({
                    where: {
                        satt_st_id: staff.st_id,
                        satt_date: { [Op.between]: [dateStart, dateEnd] }
                    },
                    attributes: ["satt_attendance_status"]
                });

                attendanceArray.push({
                    datenumber: d,
                    attend: record ? record.satt_attendance_status : null
                });
            }

            // PUSH STAFF ENTRY
            finalList.push({
                teacherid: staff.st_id,
                teachername: staff.st_name,
                stafftype: staff.st_type,
                schoolid: staff.st_sc_id,
                staffattendance: attendanceArray
            });
        }

        res.json(finalList);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

const getExamList = async (req, res) => {
    try {
        const { id } = req.body;   // SchoolId

        if (!id) {
            return res.status(400).json({
                error: "SchoolId (id) is required"
            });
        }

        const examList = await tbl_exam_type.findAll({
            where: { et_sc_id: id },
            attributes: [
                ["et_id", "id"],
                ["et_sc_id", "schoolid"],
                ["et_type", "examtype"]
            ]
        });

        return res.status(200).json(examList);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Server Error"
        });
    }
};

const saveExamType = async (req, res) => { 
    const { id, schoolid, examtype } = req.body;

    try {
        // If id is NULL/Empty => INSERT
        if (!id) {
          let typeId = uuidv4();
            const created = await tbl_exam_type.create({
                et_id:typeId,
                et_sc_id: schoolid,
                et_type: examtype,
                et_create_by: schoolid,
                et_create_dt: new Date(),
                et_update_dt: new Date()
            });

            return res.json({
                errorcode: "1",
                errormessage: "Added Successfully",
                data: created
            });
        }

        // If id exists => UPDATE
        const updated = await tbl_exam_type.update(
            {
                et_sc_id: schoolid,
                et_type: examtype,
                et_update_by: schoolid,
                et_update_dt: new Date()
            },
            { where: { et_id: id } }
        );

        return res.json({
            errorcode: "1",
            errormessage: "Updated Successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            errorcode: "0",
            errormessage: "Error while saving exam type"
        });
    }
};

const deleteExamType = async (req, res) => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.json({
        errorcode: "0",
        errormessage: "Id is required"
      });
    }

    // 1. Check if exam exists in exam_schedule
    const examExists = await tbl_exam_schedule.findOne({
      where: { es_et_id: id }
    });

    if (examExists) {
      return res.json({
        errorcode: "2",
        errormessage: "Exam Exist in Exam Schedule"
      });
    }

    // 2. Delete from exam_type
    await tbl_exam_type.destroy({
      where: { et_id: id }
    });

    return res.json({
      errorcode: "1",
      errormessage: "Deleted Successfully"
    });

  } catch (err) {
    console.error(err);
    return res.json({
      errorcode: "0",
      errormessage: "Something went wrong"
    });
  }
};

const getExamScheduleList = async (req, res) => {
    const { schoolid } = req.body;

    try {
        // Check if any exam schedule exists
        const exists = await tbl_exam_schedule.findOne({
            include: [
                {
                    model: tbl_exam_type,
                    as: "es_et",
                    where: { et_sc_id: schoolid }
                },
                {
                    model: tbl_academic_year,
                    as: "es_ay",
                    where: { ay_status_id: 1 }
                }
            ]
        });

        if (!exists) {
            return res.json({
                errorcode: "2",
                errormessage: "No Records exists"
            });
        }

        // Get exam schedule list
        const records = await tbl_exam_schedule.findAll({
            include: [
                {
                    model: tbl_exam_type,
                    as: "es_et",
                    attributes: ["et_type", "et_id"],
                    where: { et_sc_id: schoolid }
                },
                {
                    model: tbl_class_master,
                    as: "es_c",
                    attributes: ["c_name", "c_div"]
                },
                {
                    model: tbl_academic_year,
                    as: "es_ay",
                    attributes: ["ay_start_year", "ay_end_year"],
                    where: { ay_status_id: 1 }
                },
                {
                    model: tbl_exam_schedule_assign,
                    as: "tbl_exam_schedule_assigns",
                    attributes: ["esa_date"],
                    required: false
                }
            ]
        });

        // Format response
        const response = records.map(item => {
            const assignDates = item.tbl_exam_schedule_assigns?.map(x => x.esa_date) || [];

            const startDate = assignDates.length ? assignDates.sort()[0] : "";
            const endDate = assignDates.length ? assignDates.sort().reverse()[0] : "";

            return {
                examtype: item.es_et.et_type,
                examtypeid: item.es_et.et_id,
                id: item.es_c_id,
                examscheduleid: item.es_id,
                academicyearid: item.es_ay_id,
                classnumber: item.es_c.c_name,
                classdiv: item.es_c.c_div,
                academicyear: `${item.es_ay.ay_start_year} - ${item.es_ay.ay_end_year}`,
                startdate: startDate,
                enddate: endDate
            };
        });

        return res.json(response);

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            errorcode: "500",
            errormessage: "Internal Server Error"
        });
    }
};
//Testing Done till Here
const getExamSchedule = async (req, res) => {
    try {
        const { schoolid, examtypeid, classid } = req.body;

        // Step 1️⃣: Find distinct exam schedule (ES_ID)
        const examSchedules = await tbl_exam_schedule.findAll({
            attributes: ["es_id"],
            include: [
                {
                    model: tbl_exam_type,
                    as: "es_et",
                    attributes: [],
                    where: { et_sc_id: schoolid }
                },
                {
                    model: tbl_academic_year,
                    as: "es_ay",
                    attributes: [],
                    where: { ay_status_id: 1 }
                }
            ],
            where: {
                es_et_id: examtypeid,
                es_c_id: classid
            }
        });

        if (!examSchedules.length) {
            return res.status(200).json([]);
        }

        const esId = examSchedules[0].es_id;

        // Step 2️⃣: Get Assigned Schedule for this ES_ID
        const assigned = await tbl_exam_schedule_assign.findAll({
            where: { esa_es_id: esId },
            attributes: [
                ["esa_s_id", "subjectid"],
                ["esa_id", "examscheduleid"],
                ["esa_id", "examid"],
                ["esa_date", "date"],
                ["esa_start_time", "starttime"],
                ["esa_end_time", "endtime"],
                ["esa_max_marks", "maxmarks"],
                ["esa_min_marks", "minmarks"]
            ],
            include: [
                {
                    model: tbl_subject_master,
                    as: "esa",
                    attributes: [["s_name", "subjectname"]]
                }
            ],
            order: [["esa_date", "ASC"]]
        });

        return res.status(200).json(assigned);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Something went wrong"
        });
    }
};

const saveExamSchedule = async (req, res) => {
    const {
        classid,
        schoolid,
        academicyearid,
        examtypeid,
        examassign
    } = req.body;

    const t = await sequelize.transaction();

    try {

        // 1️⃣ Check if schedule already exists
        const existingSchedule = await tbl_exam_schedule.findOne({
            where: {
                es_c_id: classid,
                es_ay_id: academicyearid
            },
            transaction: t
        });

        // 2️⃣ Delete if exists
        if (existingSchedule) {

            await tbl_exam_schedule_assign.destroy({
                where: { esa_es_id: existingSchedule.es_id },
                transaction: t
            });

            await tbl_exam_schedule.destroy({
                where: { es_id: existingSchedule.es_id },
                transaction: t
            });
        }

        // 3️⃣ Create new Exam Schedule
        const newSchedule = await tbl_exam_schedule.create({
            es_id: uuidv4(),
            es_et_id: examtypeid,
            es_ay_id: academicyearid,
            es_c_id: classid,
            es_create_by: schoolid,
            es_create_dt: new Date(),
            es_update_dt: new Date()
        }, { transaction: t });

        // 4️⃣ Insert subjects list
        for (const item of examassign) {
            await tbl_exam_schedule_assign.create({
                esa_id: uuidv4(),
                esa_es_id: newSchedule.es_id,
                esa_s_id: item.subjectid,
                esa_date: item.date,
                esa_start_time: item.starttime,
                esa_end_time: item.endtime,
                esa_max_marks: item.maxmarks,
                esa_min_marks: item.minmarks,
                esa_create_dt: new Date(),
                esa_update_dt: new Date()
            }, { transaction: t });
        }

        await t.commit();

        return res.status(200).json({
            errorcode: "1",
            errormessage: "Added Successfully",
            id: newSchedule.es_id
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            errorcode: "0",
            errormessage: "Error saving exam schedule",
            error: error.message
        });
    }
};

const updateExamSchedule = async (req, res) => {
  const {
    examscheduleid,
    schoolid,
    starttime,
    endtime,
    subjectid,
    minmarks,
    maxmarks,
    date
  } = req.body;

  try {
    // 1. Check if record exists
    const record = await tbl_exam_schedule_assign.findOne({
      where: { esa_id: examscheduleid }
    });

    if (!record) {
      return res.status(404).json({
        errorcode: "2",
        errormessage: "Record not found"
      });
    }

    // 2. Update record
    await tbl_exam_schedule_assign.update(
      {
        esa_s_id: subjectid,
        esa_date: date,
        esa_start_time: starttime,
        esa_end_time: endtime,
        esa_max_marks: maxmarks,
        esa_min_marks: minmarks,
        esa_update_by: schoolid,
        esa_update_dt: new Date()
      },
      {
        where: { esa_id: examscheduleid }
      }
    );

    return res.json({
      errorcode: "1",
      errormessage: "Updated Successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errorcode: "0",
      errormessage: "Something went wrong"
    });
  }
};

const deleteExamRecord = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ errorCode: "0", errorMessage: "Id is required" });
    }

    try {
        // 1. Find parent ES_ID for the given ESA child record
        const childRecord = await tbl_exam_schedule_assign.findOne({
            where: { esa_id: id },
            include: [
                {
                    model: tbl_exam_schedule,
                    as: "esa_e",
                    attributes: ['es_id']
                }
            ]
        });

        if (!childRecord) {
            return res.json({ errorCode: "0", errorMessage: "Record not found" });
        }

        const parentId = childRecord.esa_e.es_id;

        // 2. Count how many assignment records belong to this parent ES_ID
        const count = await tbl_exam_schedule_assign.count({
            where: { esa_es_id: parentId }
        });

        // 3. If ONLY ONE child exists → delete both exam_schedule & exam_schedule_assign
        if (count === 1) {
            await tbl_exam_schedule_assign.destroy({ where: { esa_id: id } });
            await tbl_exam_schedule.destroy({ where: { es_id: parentId } });

            return res.json({
                errorCode: "1",
                errorMessage: "Deleted Whole Exam"
            });
        }

        // 4. More than one child → only delete the child record
        await tbl_exam_schedule_assign.destroy({
            where: { esa_id: id }
        });

        return res.json({
            errorCode: "1",
            errorMessage: "Deleted Successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            errorCode: "500",
            errorMessage: "Internal Server Error"
        });
    }
};

const deleteExam = async (req, res) => {
    const { id } = req.body;
    const t = await sequelize.transaction();

    try {
        // STEP 1: Check if exam exists in exam type
        const examType = await tbl_exam_type.findOne({
            where: { et_id: id }
        });

        if (examType) {
            await t.rollback();
            return res.json({
                errorcode: "2",
                errormessage: "Exam Exist in Exam Schedule"
            });
        }

        // STEP 2: Find all exam schedule assign rows for this exam
        const assignments = await tbl_exam_schedule_assign.findAll({
            where: { esa_es_id: id }
        });

        if (assignments.length > 0) {
            const assignmentIds = assignments.map(a => a.esa_id);

            // STEP 3: Delete exam evaluation entries
            await tbl_exam_evaluation.destroy({
                where: { ee_esa_id: assignmentIds },
                transaction: t
            });

            // STEP 4: Delete exam schedule assign
            await tbl_exam_schedule_assign.destroy({
                where: { esa_es_id: id },
                transaction: t
            });
        }

        // STEP 5: Delete exam schedule
        await tbl_exam_schedule.destroy({
            where: { es_id: id },
            transaction: t
        });

        await t.commit();

        return res.json({
            errorcode: "1",
            errormessage: "Deleted Successfully"
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        return res.status(500).json({
            errorcode: "0",
            errormessage: "Internal Server Error"
        });
    }
};

const getExamEvaluation = async (req, res) => {
  try {
    const { exam_schedule_id, exam_id, academic_year_id } = req.body;

    // Check if evaluation exists
    const existingEval = await tbl_exam_evaluation.findOne({
      where: { ee_esa_id: exam_id }
    });

    if (existingEval) {
      return res.status(200).json({
        errorcode: '3',
        errormessage: 'Go to View Exam Tab For Records'
      });
    }

    // Get exam schedule to find class
    const examScheduleData = await tbl_exam_schedule.findOne({
      where: { es_id: exam_schedule_id }
    });

    // Get students for the class
    const students = await tbl_student_info.findAll({
      where: { si_c_id: examScheduleData.es_c_id },
      include: [
        {
          model: tbl_academic_year,
          as: 'student_aydata',
          where: { ay_status_id: 1 },
          attributes: [],
          required: true
        }
      ],
      attributes: ['si_id', 'si_sc_id', 'si_first_name', 'si_middle_name', 'si_last_name', 'si_rollno'],
      order: ['si_rollno'],
      raw: true
    });

    // Get max marks
    const examData = await tbl_exam_schedule_assign.findOne({
      where: { esa_id: exam_id },
      attributes: ['esa_max_marks']
    });

    const response = students.map(student => ({
      student_id: student.si_id,
      schoolid: student.si_sc_id,
      first_name: `${student.si_first_name} ${student.si_middle_name} ${student.si_last_name}`.trim(),
      max_marks: examData?.esa_max_marks || 0,
      roll_no: student.si_rollno
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// const getViewExamEvaluation = async (req, res) => {
//   try {
//     const { exam_schedule_id, exam_id, academic_year_id } = req.body;

//     // Get class and max marks
//     const examScheduleData = await tbl_exam_schedule.findOne({
//       where: { es_id: exam_schedule_id },
//       attributes: ['es_c_id']
//     });

//     const examData = await tbl_exam_schedule_assign.findOne({
//       where: { esa_id: exam_id },
//       attributes: ['esa_max_marks']
//     });

//     // Check if evaluation exists
//     const existingEvals = await tbl_exam_evaluation.findAll({
//       where: { ee_esa_id: exam_id }
//     });

//     if (existingEvals.length === 0) {
//       return res.status(200).json({
//         errorcode: '2',
//         errormessage: 'Go to Exam Tab to Add Evaluation'
//       });
//     }

//     // Get evaluations with student details
//     const evaluations = await tbl_exam_evaluation.findAll({
//       where: { ee_esa_id: exam_id },
//       include: [
//         {
//           model: tbl_student_info,
//           as: 'exam_evaluation_student',
//           where: { si_c_id: examScheduleData.es_c_id },
//           attributes: ['si_id', 'si_first_name', 'si_rollno'],
//           include: [
//             {
//               model: tbl_academic_year,
//               as: 'student_aydata',
//               where: { ay_status_id: 1 },
//               attributes: [],
//               required: true
//             }
//           ],
//           required: true
//         }
//       ],
//       order: [[{ model: tbl_student_info, as: 'exam_evaluation_student' }, 'si_rollno', 'ASC']],
//       raw: false
//     });

//     const response = evaluations.map(record => ({
//       id: record.ee_id,
//       marks: record.ee_marks,
//       grace_marks: record.ee_grace_marks,
//       max_marks: examData?.esa_max_marks || 0,
//       student_id: record.ee_si_id,
//       first_name: record.exam_evaluation_student?.si_first_name || '',
//       roll_no: record.exam_evaluation_student?.si_rollno || ''
//     }));

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }


const getViewExamEvaluation = async (req, res) => {
  try {
    const { exam_schedule_id, exam_id, schoolid } = req.body;

    // Get class
    let examScheduleData = await tbl_exam_schedule.findOne({
      where: { es_id: exam_schedule_id },
      attributes: ['es_c_id']
    });

    let examData = await tbl_exam_schedule_assign.findOne({
      where: { esa_id: exam_id },
      attributes: ['esa_max_marks']
    });

    // Check evaluation exists
    let existingEvals = await tbl_exam_evaluation.findAll({
      where: { ee_esa_id: exam_id }
    });
    let percentage = 0;

    if (existingEvals.length === 0) {
      return res.status(200).json({
        errorcode: '2',
        errormessage: 'Go to Exam Tab to Add Evaluation'
      });
    }

    // 🔥 Fetch ALL grade ranges for this school (ONLY ONCE)
    let gradeRanges = await tbl_grade_range.findAll({
      include: [
        {
          model: tbl_exam_grades,
          as: "grade_exam",
          where: { eg_sc_id: schoolid },
          attributes: ['eg_name'],
          required: true
        }
      ]
    });

    // Get evaluations
    let evaluations = await tbl_exam_evaluation.findAll({
      where: { ee_esa_id: exam_id },
      include: [
        {
          model: tbl_student_info,
          as: 'exam_evaluation_student',
          where: { si_c_id: examScheduleData.es_c_id },
          attributes: ['si_id', 'si_first_name', 'si_rollno'],
          required: true
        }
      ],
      order: [[{ model: tbl_student_info, as: 'exam_evaluation_student' }, 'si_rollno', 'ASC']]
    });

    let response = evaluations.map(record => {
      let grade = "Add Grade";

      if (gradeRanges.length > 0) {

        // ✅ Convert to number
        let marks = Number(record.ee_marks);
        let grace = Number(record.ee_grace_marks || 0);
        let maxMarks = Number(examData?.esa_max_marks || 0);

        // ✅ Include grace marks (optional, remove if not needed)
        let totalMarks = marks + grace;

        // ✅ Percentage calculation
         percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

        // ✅ Match percentage with grade range
        let matched = gradeRanges.filter(gr => {
          let min = Number(gr.gr_min_range);
          let max = Number(gr.gr_max_range);

          return percentage >= min && percentage <= max;
        });

        if (matched.length === 1) {
          grade = matched[0].grade_exam.eg_name;
        } else if (matched.length > 1) {
          grade = "Grade is mismatch";
        }
      }

      return {
        id: record.ee_id,
        marks: record.ee_marks,
        grace_marks: record.ee_grace_marks,
        max_marks: examData?.esa_max_marks || 0,
        percentage: percentage?.toFixed(2), // ✅ Optional but useful
        grade: grade,
        student_id: record.ee_si_id,
        first_name: record.exam_evaluation_student?.si_first_name || '',
        roll_no: record.exam_evaluation_student?.si_rollno || ''
      };
    });

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const insertExamEvaluation = async (req, res) => {
  try {
    const { exam_schedule_id, exam_evaluations,exam_id, schoolid } = req.body;
    console.log('req.body :::>', req.body);

    const results = [];

    for (const item of exam_evaluations) {
      const existingEval = await tbl_exam_evaluation.findOne({
        where: {
          ee_esa_id: exam_id,
          ee_si_id: item.student_id
        }
      });

      if (existingEval) {
        // Update
        await tbl_exam_evaluation.update(
          {
            ee_marks: item.marks,
            ee_grace_marks: item.grace_marks,
            ee_update_by: schoolid,
            ee_update_dt: new Date()
          },
          {
            where: {
              ee_si_id: item.student_id,
              ee_esa_id: exam_id
            }
          }
        );

        results.push({
          student_id: item.student_id,
          errorcode: '1',
          errormessage: 'Updated Successfully'
        });
      } else {
        // Insert
        await tbl_exam_evaluation.create({
          ee_id: uuidv4(),
          ee_esa_id: exam_id,
          ee_si_id: item.student_id,
          ee_marks: item.marks,
          ee_grace_marks: item.grace_marks,
          ee_create_by: schoolid,
          ee_create_dt: new Date(),
          ee_update_dt: new Date()
        });

        results.push({
          student_id: item.student_id,
          errorcode: '1',
          errormessage: 'Added Successfully'
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

const updateExamEvaluation = async (req, res) => {
  try {
    const { exam_schedule_id, marks, grace_marks, student_id, schoolid } = req.body;

    const existingEval = await tbl_exam_evaluation.findOne({
      where: {
        ee_esa_id: exam_schedule_id,
        ee_si_id: student_id
      }
    });

    if (!existingEval) {
      return res.status(200).json({
        errorcode: '1',
        errormessage: 'incorrect Inputs'
      });
    }

    await tbl_exam_evaluation.update(
      {
        ee_marks: marks,
        ee_grace_marks: grace_marks,
        ee_update_by: schoolid,
        ee_update_dt: new Date()
      },
      {
        where: {
          ee_si_id: student_id,
          ee_esa_id: exam_schedule_id
        }
      }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getStudentClassEvaluation = async (req, res) => {
  try {
    const { class_id, schoolid, exam_schedule_id } = req.body;

    // Get all students in the class
    const students = await tbl_student_info.findAll({
      where: {
        si_c_id: class_id,
        si_sc_id: schoolid
      },
      include: [
        {
          model: tbl_academic_year,
          as: 'student_aydata',
          where: { ay_status_id: 1 },
          attributes: [],
          required: true
        }
      ],
      attributes: ['si_id', 'si_sc_id', 'si_first_name', 'si_rollno', 'si_ay_id'],
      order: ['si_rollno'],
      raw: true
    });

    // For each student, get their evaluation status
    const response = [];
    for (const student of students) {
      const classResult = await tbl_exam_evaluation.findAll({
        where: { ee_si_id: student.si_id },
        include: [
          {
            model: tbl_exam_schedule_assign,
            as: 'ee_esa',
            where: { esa_es_id: exam_schedule_id },
            attributes: [],
            required: true,
            include: [
              {
                model: tbl_subject_master,
                as: 'esa',
                attributes: ['s_name']
              },
              {
                model: tbl_exam_schedule,
                as: 'esa_e',
                attributes: [],
                include: [
                  {
                    model: tbl_academic_year,
                    as: 'es_ay',
                    attributes: [],
                    where: { ay_status_id: 1 },
                    required: true
                  }
                ]
              }
            ]
          },
          {
            model: tbl_student_info,
            as: 'exam_evaluation_student',
            attributes: ['si_first_name']
          }
        ],
        attributes: ['ee_marks'],
        raw: false
      });

      const totalMarks = classResult.reduce((sum, item) => sum + (parseFloat(item.ee_marks) || 0), 0);

      const formattedResult = classResult.map(item => ({
        subject_name: item.ee_esa?.esa?.s_name || '',
        first_name: item.exam_evaluation_student?.si_first_name || '',
        marks: item.ee_marks,
        total_marks: totalMarks
      }));

      response.push({
        student_id: student.si_id,
        schoolid: student.si_sc_id,
        first_name: student.si_first_name,
        roll_no: student.si_rollno,
        academic_year_id: student.si_ay_id,
        class_result: formattedResult
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getExamNameByAcademicYear = async (req, res) => {
  try {
    const { academic_year_id } = req.body;

    const examSchedules = await tbl_exam_schedule.findAll({
      where: { es_ay_id: academic_year_id },
      include: [
        {
          model: tbl_exam_type,
          as: 'es_et',
          attributes: ['et_type']
        },
        {
          model: tbl_class_master,
          as: 'es_c',
          attributes: ['c_name', 'c_div']
        },
        {
          model: tbl_academic_year,
          as: 'es_ay',
          attributes: ['ay_start_year', 'ay_end_year']
        },
        {
          model: tbl_exam_schedule_assign,
          as: 'tbl_exam_schedule_assigns',
          attributes: ['esa_date'],
          required: false
        }
      ],
      attributes: ['es_id']
    });

    const response = examSchedules.map(schedule => {
      const dates = schedule.tbl_exam_schedule_assigns
        ?.map(assign => new Date(assign.esa_date))
        .filter(date => !isNaN(date)) || [];

      const startDate = dates.length > 0 
        ? dates.reduce((min, date) => date < min ? date : min)
        : null;
      
      const endDate = dates.length > 0
        ? dates.reduce((max, date) => date > max ? date : max)
        : null;

      return {
        exam_type: schedule.es_et?.et_type || '',
        exam_schedule_id: schedule.es_id,
        class_number: schedule.es_c?.c_name || '',
        class_div: schedule.es_c?.c_div || '',
        academic_year: `${schedule.es_ay?.ay_start_year} - ${schedule.es_ay?.ay_end_year}` || '',
        start_date: startDate || '',
        end_date: endDate || ''
      };
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExamByExamSchedule = async (req, res) => {
  try {
    const { exam_schedule_id } = req.body;

    const examAssigns = await tbl_exam_schedule_assign.findAll({
      where: { esa_es_id: exam_schedule_id },
      include: [
        {
          model: tbl_subject_master,
          as: 'esa',
          attributes: ['s_name']
        }
      ],
      attributes: ['esa_id']
    });

    const response = examAssigns.map(assign => ({
      exam_id: assign.esa_id,
      subject_name: assign.esa?.s_name || ''
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getExamGrades = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const grades = await tbl_exam_grades.findAll({
      where: { eg_sc_id: schoolid },
      attributes: [
        ['eg_id', 'id'],
        ['eg_name', 'grade']
      ]
    });

    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveExamGrade = async (req, res) => {
  try {
    const { id, schoolid, grade } = req.body;

    // Check if grade already exists
    const existingGrade = await tbl_exam_grades.findOne({
      where: {
        eg_name: grade,
        eg_sc_id: schoolid,
        [id && id !== '00000000-0000-0000-0000-000000000000' ? Op.not : Op.and]: id && id !== '00000000-0000-0000-0000-000000000000' 
          ? { eg_id: { [Op.ne]: id } } 
          : {}
      }
    });

    if (existingGrade) {
      return res.status(200).json({
        errorcode: '2',
        errormessage: 'Record Already exists'
      });
    }

    if (!id || id === '00000000-0000-0000-0000-000000000000') {
      console.log('Reached here')
      // Insert new record
      await tbl_exam_grades.create({
        eg_id: uuidv4(),
        eg_sc_id: schoolid,
        eg_name: grade,
        eg_create_by: schoolid,
        eg_create_dt: new Date(),
        eg_update_dt: new Date()
      });

      res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    } else {
      // Update existing record
      await tbl_exam_grades.update(
        {
          eg_name: grade,
          eg_update_dt: new Date(),
          eg_update_by: schoolid
        },
        {
          where: { eg_id: id }
        }
      );

      res.status(200).json({
        errorcode: '1',
        errormessage: 'Updated Successfully'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteExamGrade = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_exam_grades.destroy({
      where: { eg_id: id }
    });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getExamGradeRange = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const gradeRanges = await tbl_grade_range.findAll({
      include: [
        {
          model: tbl_exam_grades,
          as: 'grade_exam',
          where: { eg_sc_id: schoolid },
          attributes: ['eg_name', 'eg_id']
        }
      ],
      attributes: ['gr_id', 'gr_min_range', 'gr_max_range'],
      raw: false
    });

    const response = gradeRanges.map(range => ({
      grade: range.grade_exam?.eg_name || '',
      grade_id: range.grade_exam?.eg_id || '',
      id: range.gr_id,
      min_range: range.gr_min_range,
      max_range: range.gr_max_range
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveExamGradeRange = async (req, res) => {
  try {
    const { id, grade_id, schoolid, min_range, max_range } = req.body;

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_grade_range.create({
        gr_id: uuidv4(),
        gr_eg_id: grade_id,
        gr_min_range: min_range,
        gr_max_range: max_range,
        gr_create_by: schoolid,
        gr_create_dt: new Date(),
        gr_update_dt: new Date()
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_grade_range.update(
      {
        gr_eg_id: grade_id,
        gr_min_range: min_range,
        gr_max_range: max_range,
        gr_update_dt: new Date(),
        gr_update_by: schoolid
      },
      { where: { gr_id: id } }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteExamGradeRange = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_grade_range.destroy({ where: { gr_id: id } });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getInvoiceType = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const invoices = await tbl_invoice_master.findAll({
      where: { i_sc_id: schoolid },
      attributes: [['i_id', 'id'], ['i_title', 'title'], ['i_description', 'description']],
      raw: true
    });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveInvoiceType = async (req, res) => {
  try {
    const { id, schoolid, title, description } = req.body;

    const existingInvoice = await tbl_invoice_master.findOne({
      where: {
        i_title: title,
        i_description: description,
        i_sc_id: schoolid
      }
    });

    if (existingInvoice && (!id || id === '' || id === '00000000-0000-0000-0000-000000000000')) {
      return res.status(200).json({
        errorcode: '2',
        errormessage: 'Record Already exists'
      });
    }

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_invoice_master.create({
        i_id: uuidv4(),
        i_sc_id: schoolid,
        i_title: title,
        i_description: description,
        i_create_by: schoolid,
        i_create_dt: new Date(),
        i_update_dt: new Date()
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_invoice_master.update(
      {
        i_title: title,
        i_description: description,
        i_update_dt: new Date(),
        i_update_by: schoolid
      },
      { where: { i_id: id, i_sc_id: schoolid } }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteInvoiceType = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_invoice_master.destroy({ where: { i_id: id } });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getStudentByClass = async (req, res) => {
  try {
    const { class_id, schoolid } = req.body;

    const students = await tbl_student_info.findAll({
      where: { si_c_id: class_id, si_sc_id: schoolid },
      include: [
        {
          model: tbl_academic_year,
          as: 'student_aydata',
          where: { ay_status_id: 1 },
          attributes: [],
          required: true
        }
      ],
      attributes: ['si_id', 'si_first_name', 'si_middle_name', 'si_last_name', 'si_rollno'],
      order: ['si_rollno'],
      raw: true
    });

    const response = students.map(student => ({
      student_id: student.si_id,
      first_name: student.si_first_name,
      middle_name: student.si_middle_name,
      last_name: student.si_last_name,
      roll_no: student.si_rollno
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getInvoice = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const invoices = await tbl_invoice_records.findAll({
      where: {
        '$ir_si.si_sc_id$': schoolid
      },
      include: [
        {
          model: tbl_invoice_master,
          as: 'ir_i',
          attributes: ['i_title']
        },
        {
          model: tbl_student_info,
          as: 'ir_si',
          attributes: ['si_first_name', 'si_middle_name', 'si_last_name'],
          include: [
            {
              model: tbl_academic_year,
              as: 'student_aydata',
              where: { ay_status_id: 1 },
              attributes: [],
              required: true
            }
          ],
          required: true
        },
        {
          model: tbl_class_master,
          as: 'ir_c',
          attributes: ['c_name', 'c_div']
        }
      ],
      raw: false
    });

    const response = invoices.map(inv => ({
      invoice_list_id: inv.ir_id,
      invoice_id: inv.ir_i_id,
      class: inv.ir_c?.c_name || '',
      div: inv.ir_c?.c_div || '',
      first_name: inv.ir_si?.si_first_name || '',
      middle_name: inv.ir_si?.si_middle_name || '',
      last_name: inv.ir_si?.si_last_name || '',
      title: inv.ir_i?.i_title || '',
      class_id: inv.ir_c_id,
      student_id: inv.ir_si_id,
      date: inv.ir_date,
      total_amount: inv.ir_total,
      payment_amount: inv.ir_payment,
      payment_status: inv.ir_status,
      payment_mode: inv.ir_method
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const saveInvoice = async (req, res) => {
  try {
    const { id, class_id, student_id, invoice_id, schoolid, date, total_amount, payment_amount, payment_status, payment_mode } = req.body;

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_invoice_records.create({
        ir_id: uuidv4(),
        ir_i_id: invoice_id,
        ir_c_id: class_id,
        ir_si_id: student_id,
        ir_date: date,
        ir_total: total_amount,
        ir_payment: payment_amount,
        ir_status: payment_status,
        ir_method: payment_mode
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_invoice_records.update(
      {
        ir_i_id: invoice_id,
        ir_c_id: class_id,
        ir_si_id: student_id,
        ir_date: date,
        ir_total: total_amount,
        ir_payment: payment_amount,
        ir_status: payment_status,
        ir_method: payment_mode
      },
      { where: { ir_id: id } }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_invoice_records.destroy({ where: { ir_id: id } });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getExpenseType = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const expenses = await tbl_expense_master.findAll({
      where: { e_sc_id: schoolid },
      attributes: [['e_id', 'id'], ['e_title', 'title'], ['e_description', 'description']],
      raw: true
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveExpenseType = async (req, res) => {
  try {
    const { id, schoolid, title, description } = req.body;

    const existingExpense = await tbl_expense_master.findOne({
      where: {
        e_title: title,
        e_description: description,
        e_sc_id: schoolid
      }
    });

    if (existingExpense && (!id || id === '' || id === '00000000-0000-0000-0000-000000000000')) {
      return res.status(200).json({
        errorcode: '2',
        errormessage: 'Record Already exists'
      });
    }

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_expense_master.create({
        e_id: uuidv4(),
        e_sc_id: schoolid,
        e_title: title,
        e_description: description,
        e_create_by: schoolid,
        e_create_dt: new Date(),
        e_update_dt: new Date()
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_expense_master.update(
      {
        e_title: title,
        e_description: description,
        e_update_dt: new Date(),
        e_update_by: schoolid
      },
      { where: { e_id: id, e_sc_id: schoolid } }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteExpenseType = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_expense_master.destroy({ where: { e_id: id } });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getExpense = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const expenses = await tbl_expense_records.findAll({
      where: { er_sc_id: schoolid },
      include: [
        {
          model: tbl_expense_master,
          as: 'er_e',
          attributes: ['e_title', 'e_description']
        },
        {
          model: tbl_academic_year,
          as: 'er_ay',
          where: { ay_status_id: 1 },
          attributes: [],
          required: true
        }
      ],
      raw: false
    });

    const response = expenses.map(exp => ({
      expense_list_id: exp.er_id,
      expense_id: exp.er_e_id,
      expense_type: exp.er_e?.e_title || '',
      date: exp.er_date,
      academic_year_id: exp.er_ay_id,
      title: exp.er_title,
      description: exp.er_description,
      payment_amount: exp.er_payment,
      payment_mode: exp.er_method
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveExpense = async (req, res) => {
  try {
    const { id, schoolid, title, expense_id, academic_year_id, description, payment_amount, payment_mode, date } = req.body;

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_expense_records.create({
        er_id: uuidv4(),
        er_sc_id: schoolid,
        er_title: title,
        er_e_id: expense_id,
        er_ay_id: academic_year_id,
        er_description: description,
        er_payment: payment_amount,
        er_method: payment_mode,
        er_date: date
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_expense_records.update(
      {
        er_sc_id: schoolid,
        er_title: title,
        er_e_id: expense_id,
        er_ay_id: academic_year_id,
        er_description: description,
        er_payment: payment_amount,
        er_method: payment_mode,
        er_date: date
      },
      { where: { er_id: id } }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_expense_records.destroy({ where: { er_id: id } });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getLibrary = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const libraries = await tbl_library.findAll({
      where: { l_sc_id: schoolid },
      attributes: [
        ['l_id', 'id'],
        ['l_class', 'class'],
        ['l_book', 'book_name'],
        ['l_author', 'author'],
        ['l_description', 'description'],
        ['l_price', 'price'],
        ['l_status', 'status']
      ],
      raw: true
    });

    res.status(200).json(libraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveLibrary = async (req, res) => {
  try {
    const { id, schoolid, book_name, author, description, price, class_name, status } = req.body;

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_library.create({
        l_id: uuidv4(),
        l_sc_id: schoolid,
        l_book: book_name,
        l_author: author,
        l_description: description,
        l_price: price,
        l_class: class_name,
        l_status: status
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_library.update(
      {
        l_sc_id: schoolid,
        l_book: book_name,
        l_author: author,
        l_description: description,
        l_price: price,
        l_class: class_name,
        l_status: status
      },
      { where: { l_id: id } }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteLibrary = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_library.destroy({ where: { l_id: id } });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getNoticeType = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const noticeTypes = await tbl_notice_type.findAll({
      where: { nt_sc_id: schoolid },
      attributes: [
        ['nt_id', 'id'],
        ['nt_title', 'title'],
        ['nt_description', 'description']
      ],
      raw: true
    });

    res.status(200).json(noticeTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveNoticeType = async (req, res) => {
  try {
    const { id, schoolid, title, description } = req.body;

    const existingNoticeType = await tbl_notice_type.findOne({
      where: {
        nt_title: title,
        nt_description: description,
        nt_sc_id: schoolid
      }
    });

    if (existingNoticeType && (!id || id === '' || id === '00000000-0000-0000-0000-000000000000')) {
      return res.status(200).json({
        errorcode: '2',
        errormessage: 'Record Already exists'
      });
    }

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_notice_type.create({
        nt_id: uuidv4(),
        nt_sc_id: schoolid,
        nt_title: title,
        nt_description: description,
        nt_create_by: schoolid,
        nt_create_dt: new Date(),
        nt_update_dt: new Date()
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_notice_type.update(
      {
        nt_title: title,
        nt_description: description,
        nt_update_dt: new Date(),
        nt_update_by: schoolid
      },
      {
        where: {
          nt_id: id,
          nt_sc_id: schoolid
        }
      }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteNoticeType = async (req, res) => {
  try {
    const { id } = req.body;

    // Delete all related notices first
    await tbl_notice.destroy({
      where: { n_nt_id: id }
    });

    // Then delete the notice type
    await tbl_notice_type.destroy({
      where: { nt_id: id }
    });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getNotice = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const notices = await tbl_notice.findAll({
      where: { n_sc_id: schoolid },
      attributes: [
        ['n_id', 'id'],
        ['n_title', 'title'],
        ['n_description', 'description'],
        ['n_date', 'date'],
        ['n_nt_id', 'notice_type_id']
      ],
      raw: true
    });

    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveNotice = async (req, res) => {
  try {
    const { id, schoolid, title, description, date, notice_type_id } = req.body;

    const existingNotice = await tbl_notice.findOne({
      where: {
        n_title: title,
        n_sc_id: schoolid
      }
    });

    if (existingNotice && (!id || id === '' || id === '00000000-0000-0000-0000-000000000000')) {
      return res.status(200).json({
        errorcode: '2',
        errormessage: 'Record Already exists'
      });
    }

    if (!id || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      await tbl_notice.create({
        n_id: uuidv4(),
        n_sc_id: schoolid,
        n_title: title,
        n_description: description,
        n_date: date,
        n_nt_id: notice_type_id,
        n_create_by: schoolid,
        n_create_dt: new Date(),
        n_update_dt: new Date()
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_notice.update(
      {
        n_title: title,
        n_description: description,
        n_date: date,
        n_nt_id: notice_type_id,
        n_update_dt: new Date(),
        n_update_by: schoolid
      },
      {
        where: {
          n_id: id,
          n_sc_id: schoolid
        }
      }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_notice.destroy({
      where: { n_id: id }
    });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getTransport = async (req, res) => {
  try {
    const { schoolid } = req.body;

    const transports = await tbl_transport.findAll({
      where: { tr_sc_id: schoolid },
      attributes: [
        ['tr_id', 'id'],
        ['tr_sc_id', 'schoolid'],
        ['tr_route', 'route'],
        ['tr_vehicle', 'vehicle'],
        ['tr_description', 'description'],
        ['tr_fare', 'fare']
      ],
      raw: true
    });

    res.status(200).json(transports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const saveTransport = async (req, res) => {
  try {
    
    const { id, schoolid, route, vehicle, description, fare } = req.body;

    const existingTransport = await tbl_transport.findOne({
      where: {
        tr_sc_id: schoolid,
        tr_route: route,
        tr_vehicle: vehicle,
        tr_description: description,
        tr_fare: fare
      }
    });

    if (existingTransport && (!id || id === '' || id === '00000000-0000-0000-0000-000000000000')) {
      return res.status(200).json({
        errorcode: '2',
        errormessage: 'Record Already exists'
      });
    }

    if (!id || id == null || id === '' || id === '00000000-0000-0000-0000-000000000000') {
      // Insert
      console.log('Reached Here ::>');
      await tbl_transport.create({
        tr_id: uuidv4(),
        tr_sc_id: schoolid,
        tr_route: route,
        tr_vehicle: vehicle,
        tr_description: description,
        tr_fare: fare,
        tr_create_by: schoolid,
        tr_create_dt: new Date(),
        tr_update_dt: new Date()
      });

      return res.status(200).json({
        errorcode: '1',
        errormessage: 'Added Successfully'
      });
    }

    // Update
    await tbl_transport.update(
      {
        tr_route: route,
        tr_vehicle: vehicle,
        tr_description: description,
        tr_fare: fare,
        tr_update_dt: new Date(),
        tr_update_by: schoolid
      },
      {
        where: {
          tr_id: id,
          tr_sc_id: schoolid
        }
      }
    );

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Updated Successfully'
    });
  } catch (error) {
    console.log('error ::>',error);
    res.status(500).json({ error: error.message });
  }
}

const deleteTransport = async (req, res) => {
  try {
    const { id } = req.body;

    await tbl_transport.destroy({
      where: { tr_id: id }
    });

    res.status(200).json({
      errorcode: '1',
      errormessage: 'Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getActiveAcademicYear = async(req, res) => {
   try {
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'SchoolId is required'
      });
    }

    const academicYear = await tbl_academic_year.findOne({
      attributes: [
        [
          Sequelize.fn('CONCAT',
            'ACADEMIC YEAR : ( ',
            Sequelize.col('ay_start_year'),
            ' - ',
            Sequelize.col('ay_end_year'),
            ' )'
          ),
          'activeYear'
        ],
        ['ay_id', 'id']
      ],
      where: {
        ay_sc_id: schoolId,
        ay_status_id: '1'
      },
      raw: true
    });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'No active academic year found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Active academic year retrieved successfully',
      data: academicYear
    });

  } catch (error) {
    console.error('Error fetching active academic year:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}


module.exports = {
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
  deleteExamGrade,

  
  getExamGradeRange,
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
  saveExamGradeRange,
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
};