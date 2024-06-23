"use strict";

var pool = require("../configs/connectDB");

var sql = require("mssql");

var jwt = require("jsonwebtoken");

require("dotenv").config();

var bcrypt = require("bcrypt");

var userController = require("./userController");

var pdf = require("html-pdf");

var ejs = require("ejs");

var fs = require("fs");

var moment = require("moment");

var getOrdersByPlantType = function getOrdersByPlantType(req, res) {
  var user, _ref, result;

  return regeneratorRuntime.async(function getOrdersByPlantType$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(sql.connect(pool.config));

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(userController.checkTokenAndGetUser(req));

        case 5:
          user = _context.sent;

          if (!(user == -1)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", res.status(200).json({
            success: false,
            code: "e002",
            message: "H\u1EBFt phi\xEAn \u0111\u0103ng nh\u1EADp. Vui l\xF2ng \u0111\u0103ng nh\u1EADp l\u1EA1i \u0111\u1EC3 ti\u1EBFp t\u1EE5c!"
          }));

        case 10:
          if (!user) {
            _context.next = 19;
            break;
          }

          _context.next = 13;
          return regeneratorRuntime.awrap(sql.query('EXEC SP_GetOrdersByPlantType'));

        case 13:
          _ref = _context.sent;
          result = _ref.recordset;
          console.log(result);
          return _context.abrupt("return", res.status(200).json({
            success: true,
            code: "e000",
            message: "Lấy thông tin thành công",
            data: result
          }));

        case 19:
          return _context.abrupt("return", res.status(200).json({
            success: false,
            code: "e003",
            message: "L\u1ED7i x\xE1c th\u1EF1c t\xE0i kho\u1EA3n"
          }));

        case 20:
          _context.next = 26;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](0);
          console.log("Lỗi: " + _context.t0);
          return _context.abrupt("return", res.status(200).json({
            success: false,
            code: "e001",
            message: "L\u1ED7i trong qu\xE1 tr\xECnh l\u1EA5y th\xF4ng tin"
          }));

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 22]]);
};

var getStockPlant = function getStockPlant(req, res) {
  var user, _ref2, result;

  return regeneratorRuntime.async(function getStockPlant$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(sql.connect(pool.config));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(userController.checkTokenAndGetUser(req));

        case 5:
          user = _context2.sent;

          if (!(user == -1)) {
            _context2.next = 10;
            break;
          }

          return _context2.abrupt("return", res.status(200).json({
            success: false,
            code: "e002",
            message: "H\u1EBFt phi\xEAn \u0111\u0103ng nh\u1EADp. Vui l\xF2ng \u0111\u0103ng nh\u1EADp l\u1EA1i \u0111\u1EC3 ti\u1EBFp t\u1EE5c!"
          }));

        case 10:
          if (!user) {
            _context2.next = 19;
            break;
          }

          _context2.next = 13;
          return regeneratorRuntime.awrap(sql.query('EXEC SP_GetStockReport'));

        case 13:
          _ref2 = _context2.sent;
          result = _ref2.recordset;
          console.log(result);
          return _context2.abrupt("return", res.status(200).json({
            success: true,
            code: "e000",
            message: "Lấy thông tin thành công",
            data: result
          }));

        case 19:
          return _context2.abrupt("return", res.status(200).json({
            success: false,
            code: "e003",
            message: "L\u1ED7i x\xE1c th\u1EF1c t\xE0i kho\u1EA3n"
          }));

        case 20:
          _context2.next = 26;
          break;

        case 22:
          _context2.prev = 22;
          _context2.t0 = _context2["catch"](0);
          console.log("Lỗi: " + _context2.t0);
          return _context2.abrupt("return", res.status(200).json({
            success: false,
            code: "e001",
            message: "L\u1ED7i trong qu\xE1 tr\xECnh l\u1EA5y th\xF4ng tin"
          }));

        case 26:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 22]]);
};

module.exports = {
  getOrdersByPlantType: getOrdersByPlantType,
  getStockPlant: getStockPlant
};