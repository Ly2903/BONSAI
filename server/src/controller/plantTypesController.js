const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const jwt = require(`jsonwebtoken`);
const dotenv = require(`dotenv`);
const bcrypt = require(`bcrypt`);
const nodemailer = require(`nodemailer`);
const userController = require("./userController");
const productController = require("./productController");
const { spawn } = require('child_process');
dotenv.config();

let getAllCategories = async (req, res) => {
  try {
    const { role_id } = req?.query;

    await sql.connect(pool.config);

    let categories = null;
    if (role_id == "NV" || role_id == "ADMIN") {
      const { recordset: result } = await sql.query(`select * from PlantTypes`);
      categories = result;
    } else {
      const { recordset: result } = await sql.query(
        `select * from PlantTypes where plant_type_status = 1`
      );
      categories = result;
    }
    return res.status(200).json({
      success: true,
      code: `e000`,
      message: `Lấy loại danh mục sản phẩm thành công!`,
      data: categories,
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

let insertUpdateCategory = async (req, res) => {
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
      const {
        plant_type_status,
        plant_type_id,
        plant_type_name,
        plant_type_description,
        plant_type_image,
      } = req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("plant_type_id", sql.Int, plant_type_id);
      request.input(
        "plant_type_name",
        sql.NVarChar(255),
        plant_type_name ? plant_type_name : ""
      );
      request.input(
        "description",
        sql.NVarChar(sql.MAX),
        plant_type_description ? plant_type_description : ""
      );
      request.input(
        "image_url",
        sql.NVarChar(sql.MAX),
        plant_type_image ? plant_type_image : ""
      );
      request.input("plant_type_status", sql.Bit, plant_type_status);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantType"
      );

      if (plant_type_name && plant_type_description) {
        productController.insertDataToExcel(plant_type_name, plant_type_description)
        spawn('py', ['./src/controller/trainData.py', 'update']);
      }
      return res.status(200).json({
        success: true,
        code: result[0].code,
        message: result[0].message,
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

module.exports = {
  getAllCategories,
  insertUpdateCategory,
};
