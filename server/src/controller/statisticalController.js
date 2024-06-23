const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const jwt = require(`jsonwebtoken`);
const dotenv = require(`dotenv`);
const bcrypt = require(`bcrypt`);
const userController = require("./userController");

dotenv.config();

let getRevenueByDay = async (req, res) => {
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
      if (user?.role_id == "KH") {
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: "Lỗi phân quyền",
        });
      }

      let { month, year } = req.body;

      const { recordset: orders } = await sql.query(
        `EXEC dbo.SP_GetRevenueByDay @month = ${month}, @year = ${year};`
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: orders,
        message: `Lấy thông tin thống kê đơn hàng thành công!`,
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

let getRevenueByStatus = async (req, res) => {
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
      if (user?.role_id == "KH") {
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: "Lỗi phân quyền",
        });
      }
      const { recordset: orders } = await sql.query(
        `EXEC dbo.SP_GetRevenueByStatus`
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: orders,
        message: `Lấy thông tin thống kê đơn hàng thành công!`,
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

let getYearsOrder = async (req, res) => {
  try {
    await sql.connect(pool.config);

    let result = null;

    const { recordset: orders } = await sql.query(`
      SELECT DISTINCT YEAR(order_date) AS order_year FROM [Order]`);

    result = orders.map((item) => item.order_year);

    return res.status(200).json({
      success: true,
      code: `e000`,
      data: result,
      message: `Lấy thông tin năm thành công!`,
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


let getOrdersByPlantType = async (req, res) => {
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
      const { recordset: result } = await sql.query('EXEC SP_GetOrdersByPlantType');

      return res.status(200).json({
        success: true,
        code: "e000",
        message: "Lấy thông tin thành công",
        data: result,
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



let getStockPlant = async (req, res) => {
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

      request.input("PlantType", sql.Int, req.query?.PlantType ? Number(req.query?.PlantType) : null);

      const { recordset: result } = await request.execute("dbo.SP_GetStockReport");


      return res.status(200).json({
        success: true,
        code: "e000",
        message: "Lấy thông tin thành công",
        data: result,
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

module.exports = {
  getRevenueByDay,
  getRevenueByStatus,
  getYearsOrder,
  getOrdersByPlantType,
  getStockPlant
};
