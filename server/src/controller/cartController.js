const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const dotenv = require(`dotenv`);
const userController = require("./userController");

dotenv.config();

let insertUpdateCart = async (req, res) => {
  try {
    await sql.connect(pool.config);

    const { plant_id, quantity, isUpdate } = req.body;
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
      request.input("plant_id", sql.Int, plant_id);
      request.input("quantity", sql.Int, quantity);
      request.input("isUpdate", sql.Int, isUpdate);

      const { recordsets: resultAdd } = await request.execute(
        "SP_InsertUpdateCart"
      );
      if (resultAdd[0][0].code == "e000") {
        return res.status(200).json({
          success: true,
          code: resultAdd[0][0].code,
          data: resultAdd[1],
          total_amount: resultAdd[2][0].total_amount,
          total_quantity: resultAdd[2][0].total_quantity,
          message: resultAdd[0][0].message,
        });
      } else {
        return res.status(200).json({
          success: false,
          code: resultAdd[0][0].code,
          message: resultAdd[0][0].message,
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Lỗi xác thực tài khoản`,
      });
    }
  } catch (error) {
    console.log("Lỗi: " + error);
    return res.status(200).json({
      success: false,
      code: `e002`,
      message: `Lỗi trong quá trình lấy thông tin`,
    });
  }
};

let getCartInformation = async (req, res) => {
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

      const { recordsets: resultAdd } = await request.execute(
        "SP_GetCartInformation"
      );

      return res.status(200).json({
        data: resultAdd[0],
        total_amount: resultAdd[1][0].total_amount,
        total_quantity: resultAdd[1][0].total_quantity,
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
  insertUpdateCart,
  getCartInformation,
};
