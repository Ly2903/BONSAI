const pool = require(`../configs/connectDB`);
const config = require(`../configs/configVNPAY.json`);
const sql = require(`mssql`);
const jwt = require(`jsonwebtoken`);
const userController = require("./userController");

require("dotenv").config();
const moment = require("moment");

let getAllPaymentMethod = async (req, res, next) => {
  try {
    await sql.connect(pool.config);
    const request = new sql.Request();
    const { recordsets: result } = await request.query("select * from PaymentMethod");

    return res.status(200).json({
      success: true,
      code: `e000`,
      data: result && result[0] ? result[0] : [],
    });
  } catch (error) {
    console.log("Lỗi: " + error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Lỗi trong quá trình lấy thông tin`,
    });
  }
};


let insertUpdatePayment = async (req, res) => {
  try {
    await sql.connect(pool.config);

    const user = await userController.checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user) {
      const { payment_id,
        order_id,
        payment_method_id,
        transaction_id,
        payment_status,
        payment_date } = req.body;

      const request = new sql.Request();

      request.input("payment_id", sql.Int, payment_id);
      request.input("order_id", sql.Int, order_id);
      request.input("payment_method_id", sql.Int, payment_method_id);
      request.input("transaction_id", sql.NVarChar, transaction_id);
      request.input("payment_status", sql.Bit, payment_status);
      request.input("payment_date", sql.NVarChar, payment_date ? payment_date + '' : '');

      const { recordsets: result } = await request.execute("dbo.SP_InsertUpdatePayment");

      return res.status(200).json({
        success: result[0][0].code == 'e000' ? true : false,
        code: result[0][0].code,
        message: result[0][0].message
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e003`,
        message: `Lỗi xác thực tài khoản`,
      });
    }
  } catch (error) {
    console.log("Lỗi: " + error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Lỗi trong quá trình lấy thông tin`,
    });
  }
};

let createPayment = async (req, res, next) => {
  try {
    const { amount, note, orderId, customerName } = req.body
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    let returnUrl = config.vnp_ReturnUrl;
    let bankCode = "";
    let locale = "";
    if (locale === null || locale === "") {
      locale = "vn";
    }
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    let paymentId = orderId && orderId != 0 ? orderId : moment(date).format("DDHHmmss")
    vnp_Params["vnp_TxnRef"] = paymentId;
    vnp_Params["vnp_OrderInfo"] =
      "Mã GD:" + paymentId + " \nKH: " + customerName + " \n" + note;
    vnp_Params["vnp_OrderType"] = "Thanh toán hóa đơn";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    return res.status(200).json({
      success: true,
      code: `e000`,
      message: `Tạo hóa đơn thành công!`,
      vnpayURL: vnpUrl,
    });
  } catch (error) {
    console.log("Lỗi: " + error);
    return res.status(200).json({
      success: false,
      code: `e002`,
      message: `Lỗi trong quá trình lấy tạo hóa đơn`,
    });
  }
};

//http://localhost:3000/confirm-order?vnp_Amount=3500000&vnp_BankCode=NCB&vnp_BankTranNo=VNP14167734&vnp_CardType=ATM&vnp_OrderInfo=M%C3%A3+GD%3A1082+%0AKH%3A+Nguy%E1%BB%85n+Nam+1+%0A&vnp_PayDate=20231105235304&vnp_ResponseCode=00&vnp_TmnCode=X9HT5UP8&vnp_TransactionNo=14167734&vnp_TransactionStatus=00&vnp_TxnRef=1082&vnp_SecureHash=b24707915af784cf4494a224697dd5f55093edcde42c348ef0447fdc3e07c08db5960c70052e81b98369143b63b69c01126d32de2280f8e909ea9c66192b85ad
// Nhận kết quả thanh toán từ VNPAY
let vnpayCheckStatusPayment = async (req, res, next) => {
  await sql.connect(pool.config);
  const request = new sql.Request();

  const user = await userController.checkTokenAndGetUser(req);
  if (user == -1) {
    return res.status(200).json({
      success: false,
      code: `e002`,
      message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
    });
  } else if (user) {

    let vnp_Params = req.body;
    let checkOrder = null;
    if (vnp_Params["vnp_TxnRef"]) {//Lấy thông tin đơn hàng
      let { recordsets: result } = await request.query(
        `SELECT * FROM dbo.[Order] WHERE order_id = ${vnp_Params["vnp_TxnRef"]}`)
      if (result && result[0] && result[0][0]) {
        checkOrder = result[0][0]
        if (checkOrder?.user_id != user?.user_id) {
          return res.status(200).json({
            success: false,
            code: "01",
            message: "Đơn hàng này thuộc về khách hàng khác",
          });
        }
      }
      else
        return res.status(200).json({
          success: false,
          code: "01",
          message: "Không tìm thấy đơn hàng!",
        });
    } else
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: 'Vui lòng cung cấp đầy đủ thông tin khi kiểm tra thanh toán'
      });


    let secureHash = vnp_Params["vnp_SecureHash"];
    let rspCode = vnp_Params["vnp_ResponseCode"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = config.vnp_HashSecret;
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");

    // Kiểm tra thanh toán có hay chưa
    let { recordsets: checkPayment } = await request.query(
      `SELECT TOP 1 * FROM dbo.[Payment] WHERE order_id = ${vnp_Params["vnp_TxnRef"]}`)
    checkPayment = checkPayment && checkPayment[0] && checkPayment[0][0] ? checkPayment[0][0] : null

    let paymentStatus = checkPayment ? (checkPayment?.payment_status == 1 ? 1 : 0) : 0;
    // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    if (secureHash === signed) {
      if (paymentStatus == 0) {
        request.input("payment_id", sql.Int, checkPayment?.payment_id ? checkPayment?.payment_id : 0);
        request.input("order_id", sql.Int, checkOrder?.order_id);
        request.input("payment_method_id", sql.Int, 2);
        request.input("transaction_id", sql.NVarChar, vnp_Params["vnp_TransactionNo"]);
        request.input("payment_date", sql.NVarChar, moment().format("YYYY-MM-DD HH:mm:ss") + '');

        //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
        if (rspCode == "00") {
          //thanh cong
          //paymentStatus = '1'
          // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL 
          request.input("payment_status", sql.Int, 1);
        } else {
          //that bai
          //paymentStatus = '2'
          // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL
          request.input("payment_status", sql.Int, 2);
        }
        const { recordsets: result } = await request.execute("dbo.SP_InsertUpdatePayment");

        return res.status(200).json({
          success: result[0][0].code == 'e000' ? true : false,
          code: result[0][0].code,
          message: result[0][0].message
        });
      } else {
        return res.status(200).json({
          success: false,
          code: "02",
          message: "Đơn hàng đã được cập nhật trạng thái thanh toán",
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        code: "97",
        message: "Chữ ký không hợp lệ!",
      });
    }
  } else {
    return res.status(200).json({
      success: false,
      code: `e003`,
      message: `Lỗi xác thực tài khoản`,
    });
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
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
  createPayment,
  vnpayCheckStatusPayment,
  getAllPaymentMethod,
  insertUpdatePayment
};
