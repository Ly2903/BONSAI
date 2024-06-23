"use strict";

var pool = require("../configs/connectDB");

var config = require("../configs/configVNPAY.json");

var sql = require("mssql");

var jwt = require("jsonwebtoken");

require("dotenv").config();

var moment = require("moment");

var getAllPaymentMethod = function getAllPaymentMethod(req, res, next) {
  var request, _ref, result;

  return regeneratorRuntime.async(function getAllPaymentMethod$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(sql.connect(pool.config));

        case 3:
          request = new sql.Request();
          _context.next = 6;
          return regeneratorRuntime.awrap(request.query("select * from PaymentMethod"));

        case 6:
          _ref = _context.sent;
          result = _ref.recordsets;
          return _context.abrupt("return", res.status(200).json({
            success: true,
            code: "e000",
            data: result && result[0] ? result[0] : []
          }));

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.log("Lỗi: " + _context.t0);
          return _context.abrupt("return", res.status(200).json({
            success: false,
            code: "e001",
            message: "L\u1ED7i trong qu\xE1 tr\xECnh l\u1EA5y th\xF4ng tin"
          }));

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

var insertOrUpdatePayment = function insertOrUpdatePayment(req, res) {
  var user, _req$body, payment_id, order_id, payment_method_id, transaction_id, payment_status, payment_date, request, _ref2, result;

  return regeneratorRuntime.async(function insertOrUpdatePayment$(_context2) {
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
            _context2.next = 26;
            break;
          }

          _req$body = req.body, payment_id = _req$body.payment_id, order_id = _req$body.order_id, payment_method_id = _req$body.payment_method_id, transaction_id = _req$body.transaction_id, payment_status = _req$body.payment_status, payment_date = _req$body.payment_date;
          request = new sql.Request();
          request.input("payment_id", sql.Int, payment_id);
          request.input("order_id", sql.Int, order_id);
          request.input("payment_method_id", sql.Int, payment_method_id);
          request.input("transaction_id", sql.NVarChar, transaction_id);
          request.input("payment_status", sql.NVarChar, payment_status);
          request.input("payment_date", sql.NVarChar, payment_date ? payment_date + '' : '');
          _context2.next = 21;
          return regeneratorRuntime.awrap(request.execute("dbo.InsertOrUpdatePayment"));

        case 21:
          _ref2 = _context2.sent;
          result = _ref2.recordsets;
          return _context2.abrupt("return", res.status(200).json({
            success: result[0][0].code == 'e000' ? true : false,
            code: result[0][0].code,
            message: result[0][0].message
          }));

        case 26:
          return _context2.abrupt("return", res.status(200).json({
            success: false,
            code: "e003",
            message: "L\u1ED7i x\xE1c th\u1EF1c t\xE0i kho\u1EA3n"
          }));

        case 27:
          _context2.next = 33;
          break;

        case 29:
          _context2.prev = 29;
          _context2.t0 = _context2["catch"](0);
          console.log("Lỗi: " + _context2.t0);
          return _context2.abrupt("return", res.status(200).json({
            success: false,
            code: "e001",
            message: "L\u1ED7i trong qu\xE1 tr\xECnh l\u1EA5y th\xF4ng tin"
          }));

        case 33:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 29]]);
};

var createPayment = function createPayment(req, res, next) {
  var _req$body2, amount, note, orderId, customerName, date, createDate, ipAddr, tmnCode, secretKey, vnpUrl, returnUrl, bankCode, locale, currCode, vnp_Params, paymentId, querystring, signData, crypto, hmac, signed;

  return regeneratorRuntime.async(function createPayment$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body2 = req.body, amount = _req$body2.amount, note = _req$body2.note, orderId = _req$body2.orderId, customerName = _req$body2.customerName;
          process.env.TZ = "Asia/Ho_Chi_Minh";
          date = new Date();
          createDate = moment(date).format("YYYYMMDDHHmmss");
          ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
          tmnCode = config.vnp_TmnCode;
          secretKey = config.vnp_HashSecret;
          vnpUrl = config.vnp_Url;
          returnUrl = config.vnp_ReturnUrl;
          bankCode = "";
          locale = "";

          if (locale === null || locale === "") {
            locale = "vn";
          }

          currCode = "VND";
          vnp_Params = {};
          vnp_Params["vnp_Version"] = "2.1.0";
          vnp_Params["vnp_Command"] = "pay";
          vnp_Params["vnp_TmnCode"] = tmnCode;
          vnp_Params["vnp_Locale"] = locale;
          vnp_Params["vnp_CurrCode"] = currCode;
          paymentId = orderId && orderId != 0 ? orderId : moment(date).format("DDHHmmss");
          vnp_Params["vnp_TxnRef"] = paymentId;
          vnp_Params["vnp_OrderInfo"] = "Mã GD:" + paymentId + " \nKH: " + customerName + " \n" + note;
          vnp_Params["vnp_OrderType"] = "Thanh toán hóa đơn";
          vnp_Params["vnp_Amount"] = amount * 100;
          vnp_Params["vnp_ReturnUrl"] = returnUrl;
          vnp_Params["vnp_IpAddr"] = ipAddr;
          vnp_Params["vnp_CreateDate"] = createDate;

          if (bankCode !== null && bankCode !== "") {
            vnp_Params["vnp_BankCode"] = bankCode;
          }

          vnp_Params = sortObject(vnp_Params);
          querystring = require("qs");
          signData = querystring.stringify(vnp_Params, {
            encode: false
          });
          crypto = require("crypto");
          hmac = crypto.createHmac("sha512", secretKey);
          signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
          vnp_Params["vnp_SecureHash"] = signed;
          vnpUrl += "?" + querystring.stringify(vnp_Params, {
            encode: false
          });
          return _context3.abrupt("return", res.status(200).json({
            success: true,
            code: "e000",
            message: "T\u1EA1o h\xF3a \u0111\u01A1n th\xE0nh c\xF4ng!",
            vnpayURL: vnpUrl
          }));

        case 40:
          _context3.prev = 40;
          _context3.t0 = _context3["catch"](0);
          console.log("Lỗi: " + _context3.t0);
          return _context3.abrupt("return", res.status(200).json({
            success: false,
            code: "e002",
            message: "L\u1ED7i trong qu\xE1 tr\xECnh l\u1EA5y t\u1EA1o h\xF3a \u0111\u01A1n"
          }));

        case 44:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 40]]);
}; // Nhận kết quả thanh toán từ VNPAY


var vnpayCheckStatusPayment = function vnpayCheckStatusPayment(req, res, next) {
  var request, vnp_Params, _ref3, result, secureHash, rspCode, secretKey, querystring, signData, crypto, hmac, signed, paymentStatus, checkOrderId, checkAmount;

  return regeneratorRuntime.async(function vnpayCheckStatusPayment$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(sql.connect(pool.config));

        case 2:
          request = new sql.Request();
          vnp_Params = req.body;

          if (!vnp_Params["vnp_TransactionNo"]) {
            _context4.next = 10;
            break;
          }

          _context4.next = 7;
          return regeneratorRuntime.awrap(request.query("SELECT * FROM dbo.Payment WHERE transaction_id = '".concat(vnp_Params["vnp_TransactionNo"], "'")));

        case 7:
          _ref3 = _context4.sent;
          result = _ref3.recordsets;
          console.log(result);

        case 10:
          secureHash = vnp_Params["vnp_SecureHash"];
          rspCode = vnp_Params["vnp_ResponseCode"];
          delete vnp_Params["vnp_SecureHash"];
          delete vnp_Params["vnp_SecureHashType"];
          vnp_Params = sortObject(vnp_Params);
          secretKey = config.vnp_HashSecret;
          querystring = require("qs");
          signData = querystring.stringify(vnp_Params, {
            encode: false
          });
          crypto = require("crypto");
          hmac = crypto.createHmac("sha512", secretKey);
          signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
          paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
          //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
          //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

          checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn

          checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn

          if (!(secureHash === signed)) {
            _context4.next = 44;
            break;
          }

          if (!checkOrderId) {
            _context4.next = 41;
            break;
          }

          if (!checkAmount) {
            _context4.next = 38;
            break;
          }

          if (!(paymentStatus == "0")) {
            _context4.next = 35;
            break;
          }

          if (!(rspCode == "00")) {
            _context4.next = 32;
            break;
          }

          return _context4.abrupt("return", res.status(200).json({
            success: true,
            code: rspCode,
            message: "Thanh to\xE1n th\xE0nh c\xF4ng!"
          }));

        case 32:
          return _context4.abrupt("return", res.status(200).json({
            success: false,
            code: rspCode,
            message: "Thanh to\xE1n th\u1EA5t b\u1EA1i!"
          }));

        case 33:
          _context4.next = 36;
          break;

        case 35:
          return _context4.abrupt("return", res.status(200).json({
            success: false,
            code: "02",
            message: "Đơn hàng đã được cập nhật trạng thái thanh toán"
          }));

        case 36:
          _context4.next = 39;
          break;

        case 38:
          return _context4.abrupt("return", res.status(200).json({
            success: false,
            code: "04",
            message: "Số tiền không hợp lệ!"
          }));

        case 39:
          _context4.next = 42;
          break;

        case 41:
          return _context4.abrupt("return", res.status(200).json({
            success: false,
            code: "01",
            message: "Không tìm thấy đơn hàng!"
          }));

        case 42:
          _context4.next = 45;
          break;

        case 44:
          return _context4.abrupt("return", res.status(200).json({
            success: false,
            code: "97",
            message: "Chữ ký không hợp lệ!"
          }));

        case 45:
        case "end":
          return _context4.stop();
      }
    }
  });
};

function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }

  return sorted;
}

module.exports = {
  createPayment: createPayment,
  vnpayCheckStatusPayment: vnpayCheckStatusPayment,
  getAllPaymentMethod: getAllPaymentMethod,
  insertOrUpdatePayment: insertOrUpdatePayment
};