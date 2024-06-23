const pool = require(`../configs/connectDB`);
const sql = require(`mssql`);
const dotenv = require(`dotenv`);
const userController = require("./userController");
const recommendController = require("./recommendController");

dotenv.config();

let getAllChatByUser = async (req, res) => {
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
      let user_id = user.user_id;
      if (req.body && req.body?.user_id && user?.role_id != "KH") {
        user_id = req.body?.user_id;
      }

      const { recordset: chats } = await sql.query(`EXEC [dbo].[SP_GetAllChatByUser] @user_id = ${user_id}`);

      return res.status(200).json({
        success: true,
        code: "e000",
        data: chats,
        message: "Lấy thông tin cuộc trò chuyện thành công",
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

let insertQuestion = async (req, res) => {
  let { question_content, image_more, typeChat } = req.body;
  if (!question_content && image_more?.length <= 0)
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Vui lòng điền nội dung câu hỏi`,
    });
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
      let { recordsets: resultInsert } = await sql.query(`EXEC [dbo].[SP_InsertQuestion] @user_id = ${user.user_id}, @question_content = N'${question_content}', @question_url = '${image_more}'`);

      let data = []
      if (typeChat == "chatbot") {
        // search bằng KNN để đưa ra câu trả lời cho người dùng trước khi nhân viên trả lời
        let resultSearch = await recommendController.recommendProduct(req, res);
        if (resultSearch && resultSearch?.data) {
          data = resultSearch?.data
        }
      }

      return res.status(200).json({
        success: resultInsert[0][0].code == "e000",
        code: resultInsert[0][0].code,
        message: resultInsert[0][0].message,
        data,
        question: resultInsert[1][0]
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Lỗi trong quá trình lấy thông tin`,
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

let insertAnswer = async (req, res) => {
  let { answer_content, image_more, question_id, isBot } = req.body;
  if (!answer_content && image_more?.length <= 0)
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Vui lòng nhập câu trả lời`,
    });

  if (!question_id)
    return res.status(200).json({
      success: false,
      code: `e001`,
      message: `Vui lòng thêm question_id để gán câu trả lời cho đúng câu hỏi`,
    });
  try {
    await sql.connect(pool.config);

    const user = await userController.checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user && user?.user_id) {
      const result = await sql.query(`
              EXEC dbo.SP_InsertAnswer
                @question_id = ${question_id},
                @answer_content = N'${answer_content}',
                @answer_url = '${image_more}',
                @staff_id = ${isBot ? 0 : user.user_id},
                @status = 1;
            `);

      const { code, message } = result.recordset[0];

      return res.status(200).json({
        success: code === "e000",
        code,
        message,
      });
    } else {
      return res.status(200).json({
        success: false,
        code: `e001`,
        message: `Lỗi trong quá trình lấy thông tin`,
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

let getAllQuestions = async (req, res) => {
  try {
    await sql.connect(pool.config);
    const user = await userController.checkTokenAndGetUser(req);
    if (user == -1) {
      return res.status(200).json({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user && user?.user_id && (user?.role_id == "NV" || user?.role_id == "ADMIN")) {
      let { valueInput } = req.body;

      const request = new sql.Request();

      request.input("keySearch", sql.NVarChar, valueInput);

      const { recordset: resultQuestions } = await request.execute("dbo.SP_GetAllQuestions");

      return res.status(200).json({
        success: false,
        code: `e000`,
        data: resultQuestions,
        message: `Lấy tất cả câu hỏi thành công`,
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

module.exports = {
  insertQuestion,
  getAllChatByUser,
  insertAnswer,
  getAllQuestions,
};
