const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const jwt = require(`jsonwebtoken`);
const dotenv = require(`dotenv`);
const bcrypt = require(`bcrypt`);
const nodemailer = require(`nodemailer`);

dotenv.config();

let login = async (req, res) => {
  try {
    await sql.connect(pool.config);
    let { phone, password } = req.body;

    let { recordset: user } = await sql.query(
      `select * from [user] where  phone = '${phone}'`
    );


    if (user?.length == 0) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Số điện thoại chưa đăng ký tài khoản!`,
      });
    } else if (user[0]?.user_status != 1) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Tài khoản đã bị khóa!`,
      });
    } else {
      user = user[0];

      const isMatch = await bcrypt.compareSync(password, user.password);

      let userToken = { ...user };
      delete userToken.avatar;
      if (isMatch) {
        const token = jwt.sign(userToken, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: `10d`,
        });

        delete user.password;

        return res.status(200).json({
          success: true,
          code: `e000`,
          message: `Đăng nhập thành công!`,
          token,
          user,
        });
      } else {
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: `Mật khẩu không hợp lệ`,
        });
      }
    }
  } catch (error) {
    console.log("Lỗi: " + error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Lỗi trong quá trình đăng nhập`,
    });
  }
};

let register = async (req, res) => {
  try {
    await sql.connect(pool.config);
    let User = req.body;
    if (
      !User.phone ||
      !User.name ||
      !User.address ||
      !User.password ||
      !User.email ||
      !User.role_id
    ) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Vui lòng điền đầy đủ thông tin`,
      });
    }

    const { recordset: user } = await sql.query(
      `Select * from [User] where phone=${User.phone}`
    );

    if (user.length != 0 && user[0].phone == User.phone) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Số điện thoại (tài khoản) đã tồn tại!`,
      });
    } else {
      const salt = await bcrypt.genSaltSync(12);
      const hashPw = bcrypt.hashSync(User.password, salt);
      sql.query(
        `INSERT INTO [User](phone,name, gender, avatar, email, address, password, user_status, role_id) VALUES (
          '${User.phone}',
          N'${User.name}',
          ${parseInt(User.gender)},
          '${User.avatar ? User.avatar : ""}',
          '${User.email}',
          N'${User.address}',
          '${hashPw}',
          ${User.status},
          '${User.role_id}')`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(200).json({
              success: false,
              code: `e001`,
              message: `Lỗi khi lưu thông tin`,
            });
          }
        }
      );

      if (User?.isStaff) {
        const { recordset: staff } = await sql.query(
          `SELECT TOP 1 user_id FROM [User] ORDER BY user_id DESC; `
        );

        const staff_id = staff[0].user_id;

        sql.query(
          `INSERT INTO [Staff](staff_id, salary) VALUES (
            ${staff_id},
            ${User.salary ? parseInt(User.salary) : 0})`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(200).json({
                success: false,
                code: `e001`,
                message: `Lỗi khi lưu thông tin`,
              });
            }
          }
        );
      }

      return res.status(200).json({
        success: true,
        code: `e000`,
        message: `Đăng kí tài khoản thành công`,
      });
    }
  } catch (error) {
    console.log(`error`, error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Có lỗi trong quá trình thêm tài khoản`,
    });
  }
};

const checkTokenAndGetUser = async (req) => {
  let token = req.headers["authorization"];
  if (token && token.split(" ").length > 1) token = token.split(" ")[1];
  if (!token) {
    return "";
  }
  try {
    const user = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (user && Object.keys(user).length > 0) {
      // Lấy thông tin user
      const { recordset: result } = await sql.query(
        `select * from [User] where phone  =  '${user?.phone}'`
      );

      return result[0] ? result[0] : null;
    } else {
      return null;
    }
  } catch (error) {
    if (error?.name == "TokenExpiredError") {
      return -1;
    }
    return null;
  }
};

let getUserByToken = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const user = await checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user?.user_status != 1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Tài khoản đã bị khóa!`,
      });
    } else if (user) {
      let token = req.headers["authorization"];
      if (token.split(" ").length > 1) token = token.split(" ")[1];

      delete user.password;
      return res.status(200).json({
        success: true,
        code: `e000`,
        message: `Lấy thông tin user thành công`,
        user,
        token,
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Tài khoản không tồn tại`,
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

let updateUser = async (req, res) => {
  try {
    await sql.connect(pool.config);
    let User = req.body;
    if (
      !User.phone ||
      !User.name ||
      !User.address ||
      !User.role_id ||
      !User.email
    ) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Vui lòng điền đầy đủ thông tin`,
      });
    }

    const { recordset: user } = await sql.query(
      `Select * from [User] where phone=${User.phone}`
    );
    if (user.length != 0 && user[0].user_id != User.user_id) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Số điện thoại (tài khoản) đã tồn tại!`,
      });
    } else {
      if (User.isStaff) {
        sql.query(
          `UPDATE [Staff] SET salary = ${User.salary} where staff_id = ${User?.user_id}`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(200).json({
                success: false,
                code: `e001`,
                message: `Lỗi khi lưu thông tin`,
              });
            }
          }
        );
      }

      sql.query(
        `UPDATE [User] SET phone = '${User.phone}', name = N'${User.name
        }', gender =${parseInt(User.gender)}, avatar = '${User.avatar}',
         email = '${User.email}', address = N'${User.address}', user_status =${User.user_status ? 1 : 0
        }, role_id ='${User.role_id}' where user_id = ${User?.user_id}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(200).json({
              success: false,
              code: `e001`,
              message: `Lỗi khi lưu thông tin`,
            });
          }
        }
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        message: `Cập nhật thông tin thành công`,
      });
    }
  } catch (error) {
    console.log(`error`, error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Có lỗi trong quá trình cập nhật thông tin`,
    });
  }
};

let getAllCustomers = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const user = await checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user && user?.role_id != "KH") {
      // lấy thông tin user
      const { recordset: result } = await sql.query(
        `select * from [User] where role_id = 'KH'`
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: result,
        message: `Lấy danh sách khách hàng thành công`,
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Lỗi phân quyền`,
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

let searchUser = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const phoneCheck = await checkTokenAndGetUser(req);
    if (phoneCheck == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (phoneCheck) {
      // lấy thông tin user
      const { recordset: result } = await sql.query(
        `select user_id from [User] where phone  =  '${phoneCheck}'`
      );

      if (result[0]?.role_id == "KH") {
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: "Lỗi phân quyền",
        });
      }

      const { valueInput, phone, isStaff } = req.body;

      let users = [];
      if (isStaff) {
        const { recordset } = await sql.query(
          `SELECT * FROM [User], [Staff] where role_id = 'NV' and [Staff].staff_id = [User].user_id and [User].role_id = 'NV' and LOWER(name)  LIKE '%${valueInput ? valueInput : ""
          }%' and LOWER(phone) LIKE '%${phone ? phone : ""}%'`
        );

        users = [...recordset];
      } else {
        const { recordset } = await sql.query(
          `SELECT * FROM [User] where LOWER(name)  LIKE '%${valueInput ? valueInput : ""
          }%' and LOWER(phone) LIKE '%${phone ? phone : ""}%'`
        );

        users = [...recordset];
      }

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: users,
        message: `Tìm kiếm thành công!`,
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

let getAllStaffs = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const user = await checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user?.role_id == "ADMIN") {
      // lấy thông tin user
      const { recordset: result } = await sql.query(
        `select * from [User], [Staff] where role_id = 'NV' and [Staff].staff_id = [User].user_id`
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        data: result,
        message: `Lấy danh sách nhân viên thành công`,
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Lỗi phân quyền`,
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
let forgotPassword = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const { email, phone } = req.body;
    if (phone) {
      // lấy thông tin user
      const { recordset: result } = await sql.query(
        `select * from [User] where phone  =  '${phone}'`
      );

      if (result?.length <= 0) {
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: `Số điện thoại chưa được đăng kí tài khoản`,
        });
      } else if (result[0]?.email.toLowerCase() != email.toLowerCase()) {
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: `Email bạn nhập không đúng với thông tin đăng ký trước đó`,
        });
      } else {
        const confirmationCode = Math.random().toString(36).substring(6);

        const salt = await bcrypt.genSaltSync(12);
        const hashPw = bcrypt.hashSync(confirmationCode, salt);

        sql.query(
          `UPDATE [User] SET password = '${hashPw}' where user_id = ${result[0]?.user_id}`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(200).json({
                success: false,
                code: `e001`,
                message: `Lỗi khi lưu thông tin`,
              });
            }
          }
        );

        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "tttrucly2903@gmail.com", // Email gửi
            pass: "wiqtpjcyfelxbxbb", // Mật khẩu ứng dụng email gửi
          },
        });

        const htmlContent = `<table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td>
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <img
                width="200px"
                src="https://webcaycanh.com/wp-content/themes/cay/imgs/logo.png"
                alt=""
              />
            </td>
          </tr>
          <tr>
            <td align="start">
              <h1>Xin chào ${result[0]?.name},</h1>
              <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
              <p>Mật khẩu mới của bạn là: ${confirmationCode}</p>
              <table cellspacing="0" cellpadding="0" align="start">
                <tr>
                  <td>
                    <a href="http://localhost:3000/reset-password" style="background: #077915;
                                          color: white;
                                          border-radius: 8px;
                                          padding: 8px 12px;
                                          text-decoration: none;">Đổi mật khẩu</a>
                  </td>
                </tr>
              </table>
              <p>
                Nếu bạn không yêu cầu điều này, bạn không cần thực hiện hành động nào -
                vui lòng bỏ qua email này.
              </p>
              <p>Kết nối vui vẻ,</p>
              <p>Webcaycanh.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;

        // Định dạng nội dung email
        const mailOptions = {
          from: "tttrucly2903@gmail.com",
          to: email,
          subject: "Xác nhận đặt lại mật khẩu",
          html: htmlContent,
        };

        // Gửi email
        try {
          await transporter.sendMail(mailOptions);
          return res.status(200).json({
            success: true,
            code: `e000`,
            message: `Yêu cầu xác nhận đã được gửi.`,
          });
        } catch (error) {
          console.error(error);
          return res.status(200).json({
            success: false,
            code: `e001`,
            message: `Lỗi khi gửi email.`,
          });
        }
      }
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Vui lòng nhập số điện thoại`,
      });
    }
  } catch (error) {
    console.log("Lỗi: " + error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Lỗi trong quá trình gửi mail`,
    });
  }
};

let resetPassword = async (req, res) => {
  try {
    await sql.connect(pool.config);
    let { phone, pwOld, pwNew } = req.body;
    if (!phone || !pwOld || !pwNew) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Vui lòng điền đầy đủ thông tin`,
      });
    }

    const { recordset: user } = await sql.query(
      `Select * from [User] where phone=${phone}`
    );
    if (user.length == 0) {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Số điện thoại ` + phone + " chưa đăng kí tài khoản!",
      });
    } else {
      const isMatch = await bcrypt.compareSync(pwOld, user[0]?.password);

      if (!isMatch) {
        return res.status(200).json({
          success: false,
          code: `e001`,
          message: `Mật khẩu cũ không đúng`,
        });
      }

      const salt = await bcrypt.genSaltSync(12);
      const hashPw = bcrypt.hashSync(pwNew, salt);

      sql.query(
        `UPDATE [User] SET password = '${hashPw}' where user_id = ${user[0]?.user_id}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(200).json({
              success: false,
              code: `e001`,
              message: `Lỗi khi lưu thông tin`,
            });
          }
        }
      );

      return res.status(200).json({
        success: true,
        code: `e000`,
        message: `Cập nhật mật khẩu thành công`,
      });
    }
  } catch (error) {
    console.log(`error`, error);
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Có lỗi trong quá trình cập nhật thông tin`,
    });
  }
};

module.exports = {
  login,
  register,
  checkTokenAndGetUser,
  getUserByToken,
  updateUser,
  getAllCustomers,
  getAllStaffs,
  searchUser,
  forgotPassword,
  resetPassword,
};
