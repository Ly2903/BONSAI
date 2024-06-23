const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const jwt = require(`jsonwebtoken`);
require("dotenv").config();
const bcrypt = require(`bcrypt`);
const userController = require("./userController");
const pdf = require("html-pdf");
const ejs = require("ejs");
const fs = require("fs");
const moment = require("moment");
const pushNotification = require("./notificationController")

let sendOrder = async (req, res) => {
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
      const { note, address, recipients_name, plants, payment_date } = req.body;

      const request = new sql.Request();

      request.input("user_id", sql.Int, user.user_id);
      request.input("note", sql.NVarChar, note);
      request.input("address", sql.NVarChar, address);
      request.input("recipients_name", sql.NVarChar, recipients_name);
      request.input("plants_json", sql.NVarChar, JSON.stringify(plants));

      const { recordsets: result } = await request.execute("dbo.SP_SendOrder");

      return res.status(200).json({
        success: result[0][0].code == 'e000' ? true : false,
        code: result[0][0].code,
        message: result[0][0].message,
        data: result[1],
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

let getAllOrderByUser = async (req, res) => {
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
      const request = new sql.Request();
      request.input("user_id", sql.Int, user?.user_id);
      const { recordsets: result } = await request.execute(
        "SP_GetAllOrdersByUser"
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: result[0],
        message: `Lấy thông tin tất cả đơn hàng thành công!`,
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

let getOrderDetailById = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const { order_id } = req.body;
    const user = await userController.checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user) {
      let { recordset: orderDetailsResult } = await sql.query(
        `select order_id, unit_price, quantity, [product].* from [orderdetails], [product] 
        where [orderdetails].order_id = ${order_id} and [product].product_id = [orderdetails].product_id`
      );

      let { recordset: orderResult } = await sql.query(
        `select * from [Order] 
        where order_id = ${order_id} and user_id = ${user_id}`
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: {
          order: orderResult[0],
          orderDetails: orderDetailsResult,
        },
        message: `Lấy thông tin chi tiết đơn hàng thành công!`,
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

let getAllOrder = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const user = await userController.checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user && user?.role_id == "KH") {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: "Lỗi phân quyền",
      });
    }

    const { recordset: orders } = await sql.query(`EXEC SP_GetAllOrders`);

    return res.status(200).json({
      success: true,
      code: orders?.code,
      data: orders,
      message: orders?.message,
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

let searchOrder = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const user = await userController.checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user && user?.role_id == "KH") {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: "Lỗi phân quyền",
      });
    } else {
      const { valueInput, status, phone } = req.body;

      const request = new sql.Request();

      request.input("valueInput", sql.NVarChar(255), valueInput);
      request.input("status_order_id", sql.Int, Number(status));
      request.input("phone", sql.Int, phone);

      const { recordset: orders } = await request.execute("SP_SearchOrder");

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: orders,
        message: `Lấy thông tin tất cả đơn hàng thành công!`,
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

let updateStatusOrder = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const { order_id, status } = req.body;
    const user = await userController.checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user) {
      const request = new sql.Request();

      request.input("order_id", sql.Int, order_id);
      request.input("status_order_id", sql.Int, status);

      const { recordset: result } = await request.execute(
        "SP_UpdateStatusOrder"
      );

      // Push thông báo cho người dùng
      pushNotification.pushNotification({
        title: 'Tiêu đề thông báo ' + order_id,
        body: 'Nội dung thông báo',
      }, "dje0e4lA-mr1ShhMNn29UB:APA91bETU-CRCXne1FhPkDM63cofNuozwPljJ_T3Gx4Vg7dNiXpN0P5O_Lhi9SiEm2NXXN1ZGkfwIvf3frFTjpPFXCBtAEstZPng-LNun0tlkvEZjqDvUvuXINxEzmE-nchQQBiaz1rj")

      return res.status(200).json({
        success: true,
        code: result[0].code,
        message: result[0].message,
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

let getAllStatus = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const { recordset: result } = await sql.query(
      `select * from OrderStatus where isDelete = 0 order by status_order_id`
    );
    return res.status(200).json({
      success: true,
      code: `e000`,
      message: `Lấy danh sách trạng thái thành công!`,
      data: result,
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

const formattedAmount = (money) => {
  return money.toLocaleString("en-US", {
    useGrouping: true,
  });
};

let reportInvoice = async (req, res) => {
  try {
    const dataInvoice = req.body;

    const template = fs.readFileSync("invoice_template.ejs", "utf-8");

    const renderedHTML = ejs.render(template, { dataInvoice, formattedAmount });

    const pdfOptions = {
      format: "Letter",
      border: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    };

    pdf.create(renderedHTML, pdfOptions).toFile("hoadon.pdf", (err, res1) => {
      if (err) {
        console.error("Error creating PDF:", err);
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: `Lỗi trong quá trình xuất file`,
        });
      } else {
        console.log("PDF created:", res1.filename);
        return res.status(200).json({
          success: true,
          code: `e000`,
          message: `Xuất hóa đơn thành công`,
        });
      }
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

let insertUpdateStatus = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const user = await userController.checkTokenAndGetUser(req);

    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user?.role_id == "NV" || user?.role_id == "ADMIN") {
      const { status_order_id, status_order_name, color, isDelete } = req.body;

      const request = new sql.Request();

      request.input("status_order_id", sql.Int, status_order_id);
      request.input("status_order_name", sql.NVarChar(255), status_order_name);
      request.input("color", sql.NVarChar(50), color);
      request.input("isDelete", sql.Bit, isDelete ? isDelete : 0);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdateOrderStatus"
      );

      return res.status(200).json({
        success: true,
        code: result[0]?.code,
        message: result[0]?.message,
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Không có quyền chỉnh sửa`,
      });
    }
  } catch (error) {
    console.log("Lỗi: " + error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Lỗi trong quá trình chỉnh sửa thông tin`,
    });
  }
};


let importProductsToWarehouse = async (req, res) => {
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
      const { order_id, status_order_id, plants } = req.body;

      const request = new sql.Request();

      request.input("user_id", sql.Int, user.user_id);
      request.input("plants_json", sql.NVarChar, JSON.stringify(plants));
      request.input("order_id", sql.NVarChar, JSON.stringify(order_id));
      request.input("status_order_id", sql.NVarChar, JSON.stringify(status_order_id));

      const { recordsets: result } = await request.execute("dbo.[SP_ImportProductsToWarehouse]");

      return res.status(200).json({
        success: true,
        code: result[0][0].code,
        message: result[0][0].message,
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


module.exports = {
  sendOrder,
  getAllOrderByUser,
  getOrderDetailById,
  getAllOrder,
  searchOrder,
  updateStatusOrder,
  getAllStatus,
  reportInvoice,
  insertUpdateStatus,
  importProductsToWarehouse
};
