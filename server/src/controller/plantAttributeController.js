const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const jwt = require(`jsonwebtoken`);
const dotenv = require(`dotenv`);
const bcrypt = require(`bcrypt`);
const userController = require("./userController");

dotenv.config();

let getAllTableByAttribute = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const { attribute_id } = req.query;

    const request = new sql.Request();
    // Input parameters for the stored procedure
    request.input("attribute_id", sql.Int, attribute_id != "undefined" ? Number(attribute_id) : 0);

    const { recordsets: result } = await request.execute(
      "GetAllTableByAttribute"
    );

    return res.status(200).json({
      success: true,
      code: `e000`,
      data: result[0],
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

//Trạng thái cây
let insertUpdatePlantStatus = async (req, res) => {
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
        plant_status_id,
        plant_status_name,
        plant_status_note,
        isDelete,
      } = req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("plant_status_id", sql.Int, plant_status_id);
      request.input(
        "plant_status_name",
        sql.NVarChar(255),
        plant_status_name ? plant_status_name : ""
      );
      request.input(
        "plant_status_note",
        sql.NVarChar(sql.MAX),
        plant_status_note ? plant_status_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantStatus"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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

// Môi trường

let insertUpdateEnvironment = async (req, res) => {
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
      const { environment_id, environment_name, environment_note, isDelete } =
        req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("environment_id", sql.Int, environment_id);
      request.input(
        "environment_name",
        sql.NVarChar(255),
        environment_name ? environment_name : ""
      );
      request.input(
        "environment_note",
        sql.NVarChar(sql.MAX),
        environment_note ? environment_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdateEnvironment"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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

// Tuổi của cây
let insertUpdatePlantAge = async (req, res) => {
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
      const { age_id, age, age_note, isDelete } = req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("age_id", sql.Int, age_id);
      request.input("age", sql.Float, age ? Number(age) : 0);
      request.input(
        "age_note",
        sql.NVarChar(sql.MAX),
        age_note ? age_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantAge"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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

// Yêu cầu ánh sáng
let insertUpdatePlantLightNeed = async (req, res) => {
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
      const { light_need_id, light_need_name, light_need_note, isDelete } =
        req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("light_need_id", sql.Int, light_need_id);
      request.input(
        "light_need_name",
        sql.NVarChar(255),
        light_need_name ? light_need_name : ""
      );
      request.input(
        "light_need_note",
        sql.NVarChar(sql.MAX),
        light_need_note ? light_need_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantLightNeed"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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

//yêu cầu chăm sóc
let insertUpdatePlantRequireCare = async (req, res) => {
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
      const { require_id, require_name, require_note, isDelete } = req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("require_id", sql.Int, require_id);
      request.input(
        "require_name",
        sql.NVarChar(255),
        require_name ? require_name : ""
      );
      request.input(
        "require_note",
        sql.NVarChar(sql.MAX),
        require_note ? require_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantRequireCare"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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

// Kích thước
let insertUpdatePlantSize = async (req, res) => {
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
      const { size_id, size_name, size_note, isDelete } = req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("size_id", sql.Int, size_id);
      request.input("size_name", sql.NVarChar(100), size_name ? size_name : "");
      request.input(
        "size_note",
        sql.NVarChar(sql.MAX),
        size_note ? size_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantSize"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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

// Yêu cấu nước
let insertUpdatePlantWaterNeed = async (req, res) => {
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
      const { water_need_id, watering_times, water_need_note, isDelete } =
        req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("water_need_id", sql.Int, water_need_id);
      request.input(
        "watering_times",
        sql.Int,
        watering_times ? watering_times : 0
      );
      request.input(
        "water_need_note",
        sql.NVarChar(sql.MAX),
        water_need_note ? water_need_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantWaterNeed"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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

// Tốc độ tăng trưởng
let insertUpdatePlantGrowth = async (req, res) => {
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
      const { growth_id, week_old, growth_note, isDelete } = req.body;

      const request = new sql.Request();

      // Input parameters for the stored procedure
      request.input("growth_id", sql.Int, growth_id);
      request.input("week_old", sql.Int, week_old ? week_old : 0);
      request.input(
        "growth_note",
        sql.NVarChar(sql.MAX),
        growth_note ? growth_note : ""
      );
      request.input("isDelete", sql.Bit, isDelete);

      // Execute the stored procedure
      const { recordset: result } = await request.execute(
        "SP_InsertUpdatePlantGrowth"
      );

      return res.status(200).json({
        success: result[0]?.code == 'e000' ? true : false,
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
  getAllTableByAttribute,
  insertUpdatePlantStatus,
  insertUpdateEnvironment,
  insertUpdatePlantAge,
  insertUpdatePlantLightNeed,
  insertUpdatePlantRequireCare,
  insertUpdatePlantSize,
  insertUpdatePlantWaterNeed,
  insertUpdatePlantGrowth,
};
