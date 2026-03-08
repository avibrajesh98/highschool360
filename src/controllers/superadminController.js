const { 
    tbl_super_admin,
    tbl_school,
    tbl_academic_year,
    tbl_staff,
    tbl_student_info
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../models");


const getSuperAdmin = async (req, res) => {
  try {
    const data = await tbl_super_admin.findAll({
      attributes: [
        ["su_user_name", "username"],
        ["su_id", "id"],
        ["su_password_hash", "su_password_hash"]
      ]
    });

    return res.status(200).json({
      status: true,
      message: "Super admin records fetched successfully",
      data: data
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};

const saveSuperAdmin = async (req, res) => {
  const { username, passwordhash } = req.body;

  if (!username || !passwordhash) {
    return res.status(400).json({
      status: false,
      message: "username & passwordhash are required"
    });
  }

  try {
    // 1) Check username already exists in TBL_SCHOOL
    const existingSchoolUser = await tbl_school.findOne({
      where: { sc_user_name: username }
    });

    if (existingSchoolUser) {
      return res.json({
        errorcode: "2",
        errormessage: "Record Already Exists"
      });
    }

    const hashedPassword = await bcrypt.hash(passwordhash, 10);

    // 2) Insert into TBL_SUPER_ADMIN
    const newId = uuidv4();

    await tbl_super_admin.create({
      su_id: newId,
      su_user_name: username,
      su_password_hash: hashedPassword,
      su_create_dt: new Date(),
      su_update_dt: new Date()
    });

    return res.json({
      errorcode: "1",
      errormessage: "Added Successfully"
    });

  } catch (err) {
    console.error("Error saving super admin:", err);

    return res.status(500).json({
      errornumber: err.number || null,
      errorseverity: err.severity || null,
      errorstate: err.state || null,
      errorprocedure: err.procedure || null,
      errorline: err.lineNumber || null,
      errormessage: err.message
    });
  }
};

const deleteSuperAdmin = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      status: false,
      message: "id is required"
    });
  }

  try {
    // 1️⃣ Count how many super admins exist
    const count = await tbl_super_admin.count();

    if (count === 1) {
      return res.json({
        errorcode: "1",
        errormessage: "One Admin is Necessary"
      });
    }

    // 2️⃣ Delete the given ID
    const deletedRows = await tbl_super_admin.destroy({
      where: { su_id: id }
    });

    if (deletedRows === 0) {
      return res.json({
        errorcode: "0",
        errormessage: "Invalid Id or Record not found"
      });
    }

    // 3️⃣ Return stored-procedure-like response
    return res.json({
      errorcode: "1",
      errormessage: "Deleted Successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errorcode: "-1",
      errormessage: "Server Error"
    });
  }
};

const getSchoolDetails = async (req, res) => {
  try {
    const schools = await tbl_school.findAll({
      attributes: [
        ["sc_id", "id"],
        ["sc_name", "name"],
        ["sc_user_name", "username"],
        ["sc_password_hash", "passwordhash"],
        ["sc_email_id", "emailid"],
        ["sc_address", "address"],
        ["sc_phone_number_1", "mobilenumber"],
        ["sc_phone_number_2", "mobilenumber2"],
      ],
    });

    return res.status(200).json({
      status: true,
      message: "School records fetched successfully",
      data: schools,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getAcademicYearFromSchool = async (req, res) => {
  const { id } = req.body;   // SchoolId comes in Data.Id

  if (!id) {
    return res.status(400).json({
      status: false,
      message: "SchoolId (id) is required"
    });
  }

  try {
    const years = await tbl_academic_year.findAll({
      where: { ay_sc_id: id },
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

const getSchoolDashboard = async (req, res) => {
  const { schoolid, academicyearid } = req.body;

  if (!schoolid || !academicyearid) {
    return res.status(400).json({
      status: false,
      message: "schoolid & academicyearid are required"
    });
  }

  try {
    // 1️⃣ Get School Name
    const school = await tbl_school.findOne({
      where: { sc_id: schoolid },
      attributes: ["sc_name"]
    });

    if (!school) {
      return res.status(404).json({
        status: false,
        message: "School not found"
      });
    }

    // 2️⃣ Get Staff Count for school + academic year
    const staffCount = await tbl_staff.count({
      where: {
        st_sc_id: schoolid,
        st_ay_id: academicyearid
      }
    });

    // 3️⃣ Get Student Count for school + academic year
    const studentCount = await tbl_student_info.count({
      where: {
        si_sc_id: schoolid,
        si_ay_id: academicyearid
      }
    });

    // 4️⃣ Build final response
    const dashboardData = {
      name: school.sc_name,
      staffcount: staffCount,
      studentcount: studentCount
    };

    return res.status(200).json({
      status: true,
      message: "Dashboard fetched successfully",
      data: dashboardData
    });

  } catch (error) {
    console.log("Dashboard error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};



module.exports = {
  getSuperAdmin,
  saveSuperAdmin,
  deleteSuperAdmin,
  getSchoolDetails,
  getAcademicYearFromSchool,
  getSchoolDashboard 
};