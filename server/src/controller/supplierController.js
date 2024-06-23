const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const jwt = require(`jsonwebtoken`);
const dotenv = require(`dotenv`);
const bcrypt = require(`bcrypt`);
const userController = require("./userController");

dotenv.config();

let getAllSupplier = async (req, res) => {
  try {
    const { role_id } = req?.query;

    await sql.connect(pool.config);

    if (role_id == "NV" || role_id == "ADMIN") {
      const { recordset: result } = await sql.query(`SELECT * FROM Suppliers`);
      return res.status(200).json({
        success: true,
        code: `e000`,
        message: `Lấy thông tin nhà cung cấp thành công!`,
        data: result,
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Lỗi phân quyền!`,
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
let insertUpdateSupplier = async (req, res) => {
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
        supplier_id,
        supplier_name,
        supplier_phone,
        supplier_address,
        supplier_email,
        representative,
        supplier_status,
      } = req.body;

      const request = new sql.Request();

      const { recordset: result } = await request
        .input("supplier_id", sql.Int, supplier_id)
        .input("supplier_name", sql.NVarChar(255), supplier_name)
        .input("supplier_phone", sql.NVarChar(20), supplier_phone)
        .input("supplier_address", sql.NVarChar(255), supplier_address)
        .input("supplier_email", sql.NVarChar(50), supplier_email)
        .input("representative", sql.NVarChar(255), representative)
        .input("supplier_status", sql.Bit, supplier_status)
        .execute("InsertUpdateSupplier");

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

let searchSupplier = async (req, res) => {
  try {
    const { role_id } = req?.query;
    const { valueInput, category } = req.body;

    await sql.connect(pool.config);

    let Supplier = null;
    if (role_id == "NV" || role_id == "ADMIN") {
      if (category != " ") {
        const { recordset: result } = await sql.query(
          `SELECT p.*,
                  STUFF((
                  SELECT ',' + CAST(category_id AS VARCHAR(10))
                  FROM Detail_Category_Supplier
                  WHERE supplier_id = p.supplier_id 
                  FOR XML PATH('')
                ), 1, 1, '') AS categories
          FROM
            Supplier p
            WHERE
            p.supplier_name LIKE N'%${valueInput}%'
            AND p.supplier_id IN (
              SELECT supplier_id
              FROM Detail_Category_Supplier
              WHERE category_id = ${category}
            );`
        );
        Supplier = result;
      } else {
        const { recordset: result } = await sql.query(
          `SELECT p.*,
                  STUFF((
                  SELECT ',' + CAST(category_id AS VARCHAR(10))
                  FROM Detail_Category_Supplier
                  WHERE supplier_id = p.supplier_id 
                  FOR XML PATH('')
                ), 1, 1, '') AS categories
          FROM
            Supplier p
            WHERE
            p.supplier_name LIKE N'%${valueInput}%'
           `
        );
        Supplier = result;
      }
    } else {
      const { recordset: result } = await sql.query(
        `SELECT
      p.*,
       STUFF((
         SELECT ',' + CAST(category_id AS VARCHAR(10))
         FROM Detail_Category_Supplier
         WHERE supplier_id = p.supplier_id 
         FOR XML PATH('')
       ), 1, 1, '') AS categories
     FROM
       Supplier p where status_id = 1 and stock_quantity > 0
       AND
      p.supplier_name LIKE N'%${valueInput}%'
      OR p.supplier_id IN (
        SELECT supplier_id
        FROM Detail_Category_Supplier dcp
        WHERE category_id IN (
          SELECT category_id
          FROM categories
          WHERE category_name LIKE N'%${valueInput}%'
        )
      );`
      );

      Supplier = result;
    }

    let result = [...Supplier].map((val) => {
      return { ...val, image_more: null };
    });

    for (let index = 0; index < Supplier?.length; index++) {
      const element = Supplier[index].supplier_id;
      const { recordset: row } = await sql.query(
        `SELECT image_url FROM ImagesSupplier where supplier_id = ${element}`
      );
      if (row)
        result[index] = {
          ...Supplier[index],
          image_more: row.map((val) => val?.image_url),
        };
    }

    return res.status(200).json({
      success: true,
      code: `e000`,
      message: `Lấy thông tin nhà cung cấp thành công!`,
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

module.exports = {
  getAllSupplier,
  insertUpdateSupplier,
  searchSupplier,
};
