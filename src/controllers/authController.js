const jwt = require('jsonwebtoken');
const { User } = require('../models');

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");

const { tbl_school, tbl_staff, tbl_student_info, tbl_super_admin, tbl_class_teacher } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const adminLogin = async (req, res) => {
  const { UserName, PasswordHash } = req.body;
  console.log(req.body);

  const Status = { ErrorCode: "", ErrorMessage: "", Result: "" };

  try {
    // 1️⃣ Validate input
    if (!UserName) {
      Status.ErrorCode = "4";
      Status.ErrorMessage = "Data is null or empty.";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 2️⃣ Check admin exists (Sequelize findOne)
    const admin = await tbl_school.findOne({
      where: { sc_user_name: UserName }
    });
    console.log(admin);

    if (!admin) {
      Status.ErrorCode = "3";
      Status.ErrorMessage = "Mobile Number doesn't exist";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 3️⃣ Compare password hash
    const isMatch = await bcrypt.compare(PasswordHash, admin.sc_password_hash);

    if (!isMatch) {
      Status.ErrorCode = "2";
      Status.ErrorMessage = "Invalid credential";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 4️⃣ Prepare result (profile details like old SP)
    const profile = {
      Id: admin.id,
      Name: admin.sc_name,
      UserName: admin.sc_user_name,
      EmailId: admin.sc_email_id,
      Address: admin.sc_address,
      MobileNumber: admin.sc_phone_number_1,
      statusCode: "200",
      Result: "Success",
      ErrorCode: "1"
    };

    return res.json(profile);

  } catch (error) {
    console.error(error);

    Status.ErrorCode = "2";
    Status.ErrorMessage = error.message;
    Status.Result = "Failed";
    return res.json(Status);
  }
}

const teacherLogin = async (req, res) => {
  const { UserName, PasswordHash } = req.body;
  console.log(req.body);

  const Status = { ErrorCode: "", ErrorMessage: "", Result: "" };

  try {
    // 1️⃣ Validate input
    if (!UserName) {
      Status.ErrorCode = "4";
      Status.ErrorMessage = "Data is null or empty.";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 2️⃣ Check admin exists (Sequelize findOne)
    const staff = await tbl_staff.findOne({
      where: { st_user_name: UserName }
    });

    const classTeacher = await tbl_class_teacher.findOne({
      where: {
        ct_st_id: staff.st_id
      }
    });
    console.log(staff);

    if (!staff) {
      Status.ErrorCode = "3";
      Status.ErrorMessage = "Mobile Number doesn't exist";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 3️⃣ Compare password hash
    const isMatch = await bcrypt.compare(PasswordHash, staff.st_password_hash);

    if (!isMatch) {
      Status.ErrorCode = "2";
      Status.ErrorMessage = "Invalid credential";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 4️⃣ Prepare result (profile details like old SP)
    const profile = {
      Id: staff.st_id,
      Name: staff.st_name,
      UserName: staff.st_user_name,
      EmailId: staff.st_email_id,
      Address: staff.st_address,
      MobileNumber: staff.st_phone_number,
      SchoolId:staff.st_sc_id,
      AcademicYearId:staff.st_ay_id,
      ClassId:classTeacher.ct_c_id,
      statusCode: "200",
      Result: "Success",
      ErrorCode: "1"
    };

    return res.json(profile);

  } catch (error) {
    console.error(error);

    Status.ErrorCode = "2";
    Status.ErrorMessage = error.message;
    Status.Result = "Failed";
    return res.json(Status);
  }
}

const studentLogin = async (req, res) => {
  const { UserName, PasswordHash } = req.body;
  console.log(req.body);

  const Status = { ErrorCode: "", ErrorMessage: "", Result: "" };

  try {
    // 1️⃣ Validate input
    if (!UserName) {
      Status.ErrorCode = "4";
      Status.ErrorMessage = "Data is null or empty.";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 2️⃣ Check admin exists (Sequelize findOne)
    const student = await tbl_student_info.findOne({
      where: { si_user_name: UserName }
    });
    console.log(student);

    if (!student) {
      Status.ErrorCode = "3";
      Status.ErrorMessage = "Mobile Number doesn't exist";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 3️⃣ Compare password hash
    const isMatch = await bcrypt.compare(PasswordHash, student.si_password_hash);

    if (!isMatch) {
      Status.ErrorCode = "2";
      Status.ErrorMessage = "Invalid credential";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 4️⃣ Prepare result (profile details like old SP)
    const profile = {
      Id: student.si_id,
      SchoolId: student.si_sc_id,
      FirstName: student.si_first_name,
      MiddleName: student.si_middle_name,
      LastName: student.si_last_name,
      UserName: student.si_user_name,
      EmailId: student.si_email_id,
      StudentAddress: student.si_address,
      StudentMobileNumber: student.si_phone_number,
      AcademicYearId: student.si_ay_id,
      ClassId: student.si_c_id,
      statusCode: "200",
      Result: "Success",
      ErrorCode: "1"
    };

    return res.json(profile);

  } catch (error) {
    console.error(error);

    Status.ErrorCode = "2";
    Status.ErrorMessage = error.message;
    Status.Result = "Failed";
    return res.json(Status);
  }
}

const superAdminLogin = async (req, res) => {
  const { UserName, PasswordHash } = req.body;
  console.log(req.body);

  const Status = { ErrorCode: "", ErrorMessage: "", Result: "" };

  try {
    // 1️⃣ Validate input
    if (!UserName) {
      Status.ErrorCode = "4";
      Status.ErrorMessage = "Data is null or empty.";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 2️⃣ Check admin exists (Sequelize findOne)
    const superadmin = await tbl_super_admin.findOne({
      where: { su_user_name: UserName }
    });
    console.log(superadmin);

    if (!superadmin) {
      Status.ErrorCode = "3";
      Status.ErrorMessage = "Mobile Number doesn't exist";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 3️⃣ Compare password hash
    const isMatch = await bcrypt.compare(PasswordHash, superadmin.su_password_hash);

    if (!isMatch) {
      Status.ErrorCode = "2";
      Status.ErrorMessage = "Invalid credential";
      Status.Result = "Failed";
      return res.json(Status);
    }

    // 4️⃣ Prepare result (profile details like old SP)
    const profile = {
      UserName: superadmin.su_user_name,
      Id: superadmin.si_sc_id,
      statusCode: "200",
      Result: "Success",
      ErrorCode: "1"
    };

    return res.json(profile);

  } catch (error) {
    console.error(error);

    Status.ErrorCode = "2";
    Status.ErrorMessage = error.message;
    Status.Result = "Failed";
    return res.json(Status);
  }
}

const registerSchool = async (req, res) => {
  try {
    const {
      name,
      userName,
      passwordHash,
      emailId,
      address,
      mobileNumber,
      mobileNumber2
    } = req.body;

    // Basic validation
    if (!name || !userName || !passwordHash || !emailId) {
      return res.status(400).json({
        errorCode: "2",
        message: "Required fields missing"
      });
    }

    // Check if username already exists
    const existing = await tbl_school.findOne({ where: { sc_user_name: userName } });
    if (existing) {
      return res.status(400).json({
        errorCode: "3",
        message: "Username already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(passwordHash, 10);

    const newSchool = await tbl_school.create({
      sc_id: uuidv4(),
      sc_name: name,
      sc_user_name: userName,
      sc_password_hash: hashedPassword,
      sc_email_id: emailId,
      sc_address: address,
      sc_phone_number_1: mobileNumber,
      sc_phone_number_2: mobileNumber2
    });

    return res.json({
      errorCode: "1",
      message: "School created successfully",
      data: newSchool
    });

  } catch (error) {
    return res.status(500).json({
      errorCode: "5",
      message: "Internal Server Error",
      error: error.message
    });
  }
};

module.exports = {

  adminLogin,
  teacherLogin,
  studentLogin,
  superAdminLogin,

  registerSchool
};