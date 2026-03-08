const jwt = require('jsonwebtoken');
const { User } = require('../models');

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");

const { tbl_ref_codes, tbl_country_state_code, tbl_country_city_code } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const getRefCodes = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        errorCode: "2",
        message: "Type is required"
      });
    }

    const result = await tbl_ref_codes.findAll({
      where: { rc_type: type },
      attributes: [
        ["rc_id", "Id"],
        ["rc_type", "Type"],
        ["rc_code", "Code"],
        ["rc_name", "Name"]
      ]
    });

    return res.json({
      errorCode: "1",
      result: "Success",
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      errorCode: "5",
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getStateRefCodes = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        errorCode: "2",
        message: "Type is required"
      });
    }

    const result = await tbl_country_state_code.findAll({
      where: { cs_type: type },
      attributes: [
        ["cs_id", "Id"],
        ["cs_type", "Type"],
        ["cs_code", "Code"],
        ["cs_name", "Name"],
        ["cs_status", "Status"]
      ]
    });

    return res.json({
      errorCode: "1",
      result: "Success",
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      errorCode: "5",
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getCityRefCodes = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        errorCode: "2",
        message: "Type is required"
      });
    }

    const result = await tbl_country_city_code.findAll({
      where: { cc_type: type },
      attributes: [
        ["cc_id", "Id"],
        ["cc_type", "Type"],
        ["cc_code", "Code"],
        ["cc_name", "Name"],
        ["cc_status", "Status"]
      ]
    });

    return res.json({
      errorCode: "1",
      result: "Success",
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      errorCode: "5",
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getWeekDays = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        errorCode: "2",
        message: "Type is required"
      });
    }

    const result = await tbl_ref_codes.findAll({
      where: { rc_type: type },
      attributes: [
        ["rc_id", "Id"],
        ["rc_type", "Type"],
        ["rc_code", "Code"],
        ["rc_name", "Name"]
      ]
    });

    return res.json({
      errorCode: "1",
      result: "Success",
      data: result
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

  getRefCodes,
  getStateRefCodes,
  getCityRefCodes,
  getWeekDays
};