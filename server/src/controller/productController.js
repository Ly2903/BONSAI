const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const dotenv = require(`dotenv`);
const userController = require("./userController");
const ExcelJS = require('exceljs');
const { spawn } = require('child_process');

dotenv.config();

let getAllProduct = async (req, res) => {
  try {
    await sql.connect(pool.config);

    const { role_id, isPlant, valueInput, category } = req?.query;
    const request = new sql.Request();
    request.input("role_id", sql.NVarChar, role_id);
    request.input("isPlant", sql.Int, (isPlant == null || isPlant == undefined) ? 1 : Number(isPlant));
    request.input("keySearch", sql.NVarChar, valueInput ? valueInput : null);
    request.input("category", sql.Int, category ? Number(category) : null);


    const { recordset: result } = await request.execute("SP_GetAllProduct");

    return res.status(200).json({
      success: true,
      code: `e000`,
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

let getProductById = async (req, res) => {
  try {
    await sql.connect(pool.config);

    const { plant_id } = req?.query;
    const request = new sql.Request();
    request.input("plant_id", sql.Int, plant_id == null ? 0 : Number(plant_id));

    const { recordset: result } = await request.execute("SP_GetProductById");

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


let getAllRelated = async (req, res) => {
  try {
    await sql.connect(pool.config);

    const { role_id } = req?.query;
    const request = new sql.Request();
    request.input("role_id", sql.NVarChar, role_id);

    const { recordset: result } = await request.execute("SP_getAllRelated");

    return res.status(200).json({
      success: true,
      code: `e000`,
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

let insertUpdateProduct = async (req, res) => {
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
      const request = new sql.Request();
      const {
        plant_id,
        plant_name,
        plant_price,
        stock_quantity,
        plant_description,
        plant_image,
        image_more,
        supplier_id,
        plant_type_id,
        environment_id,
        age_id,
        size_id,
        plant_status_id,
        warehouse_id,
        growth_id,
        light_need_id,
        require_id,
        water_need_id,
        isPlant,
        isDelete,
        relatedItems,
        care_reminder_time,
        isActive
      } = req.body;

      request.input("plant_id", sql.Int, plant_id);
      request.input("plant_name", plant_name);
      request.input("plant_price", sql.Money, plant_price ? plant_price : 0);
      request.input("stock_quantity", sql.Int, stock_quantity);
      request.input("plant_description", sql.NVarChar(sql.MAX), plant_description);
      request.input("plant_image", sql.NVarChar(sql.MAX), plant_image);
      request.input("image_more", sql.NVarChar(sql.MAX), image_more ? image_more : "");
      addInputIfNotNull(request, "supplier_id", supplier_id, sql.Int);
      request.input("plant_type_id", sql.Int, plant_type_id == -1 ? null : plant_type_id);
      request.input("environment_id", sql.Int, environment_id == -1 ? null : environment_id);
      request.input("age_id", sql.Int, age_id == -1 ? null : age_id);
      request.input("size_id", sql.Int, size_id == -1 ? null : size_id);
      request.input("plant_status_id", sql.Int, plant_status_id == -1 ? null : plant_status_id);
      request.input("warehouse_id", sql.Int, warehouse_id);
      request.input("growth_id", sql.Int, growth_id == -1 ? null : growth_id);
      request.input("light_need_id", sql.Int, light_need_id == -1 ? null : light_need_id);
      request.input("require_id", sql.Int, require_id == -1 ? null : require_id);
      request.input("water_need_id", sql.Int, water_need_id == -1 ? null : water_need_id);
      request.input("isPlant", sql.Int, isPlant ? Number(isPlant) : 1);
      request.input("isDelete", sql.Bit, isDelete);
      request.input("care_reminder_time", sql.DateTime, care_reminder_time ? care_reminder_time : null);
      request.input("relatedItems", sql.NVarChar, relatedItems ? JSON.stringify(relatedItems) : null);
      console.log(JSON.stringify(relatedItems));
      request.input("isActive", sql.Bit, isActive);
      const { recordsets: result } = await request.execute("SP_InsertUpdateProduct");

      // if (result && result[1]) {
      //   insertDataToExcel(plant_name, result[1].map(item => Object.values(item) ? Object.values(item) : '').join(', '))
      //   spawn('py', ['./src/controller/trainData.py', 'update']);
      // }
      return res.status(200).json({
        success: result[0][0].code == 'e000' ? true : false,
        code: result[0][0].code,
        message: result[0][0].message,
      });
    } else {
      return res.status(200).json({
        success: false,
        code: result[0]?.code,
        message: result[0]?.message,
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

function addInputIfNotNull(request, paramName, paramValue, sqlType) {
  if (paramValue && paramValue !== undefined) {
    request.input(paramName, sqlType, paramValue);
  }
}

let searchProductPrice = async (req, res) => {
  try {
    const { valueInput, category, valueMoneyTo, valueMoneyFrom } = req.body;

    await sql.connect(pool.config);

    const request = new sql.Request();

    let products = null;

    request.input("valueInput", sql.NVarChar, valueInput);
    request.input("valueMoneyFrom", sql.Int, valueMoneyFrom);
    request.input("valueMoneyTo", sql.Int, valueMoneyTo);
    request.input("category", sql.Int, category ? category : null);

    const { recordset } = await request.execute("GetPlants");


    products = recordset;

    let result = [...products].map((val) => {
      return { ...val, image_more: null };
    });

    for (let index = 0; index < products?.length; index++) {
      const element = products[index].plant_id;
      const { recordset: row } = await sql.query(`SELECT image_url FROM ImagesPlant where plant_id = ${element}`);
      if (row)
        result[index] = {
          ...products[index],
          image_more: row.map((val) => val?.image_url),
        };
    }

    return res.status(200).json({
      success: true,
      code: `e000`,
      message: `Lấy sản phẩm thành công!`,
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

const insertDataToExcel = async (key, value) => {
  const inputFile = './src/assets/Data.xlsx';
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(inputFile);
    const worksheet = workbook.getWorksheet(1);
    let checkExist = false;

    for (const row of worksheet.getRows(1, worksheet.rowCount)) {
      const cell = row.getCell(1);
      if (cell.value && cell.value.toLowerCase() === key.trim().toLowerCase()) {
        row.getCell(2).value = value;
        checkExist = true;
        break;
      }
    }

    if (!checkExist) {
      worksheet.addRow([key, value]);
    }

    await workbook.xlsx.writeFile(inputFile);
    console.log('Data updated successfully');
  } catch (err) {
    console.error('Error:', err);
  }
};

module.exports = {
  getAllProduct,
  insertUpdateProduct,
  searchProductPrice,
  insertDataToExcel,
  getAllRelated,
  getProductById
};
