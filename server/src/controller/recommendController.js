const { spawn } = require('child_process');
process.env.PYTHONIOENCODING = 'utf-8';
const fs = require('fs');
const sql = require(`mssql`);
const pool = require(`../configs/connectDB`);
const userController = require("./userController");


// let recommendProduct = (keySearch) => {
//   return new Promise((resolve, reject) => {
//     try {
//       // const pythonProcess = spawn('py', ['./src/controller/trainData.py', keySearch]);
//       const pythonProcess = spawn('py', ['./src/controller/trainData.py', 'find_tree_from_keywords', keySearch]);
//       pythonProcess.stderr.setEncoding('utf8');

//       pythonProcess.stderr.on('data', (data) => {
//         try {
//           const errorData = data.toString();
//           console.log("reuslt", errorData);
//           let result = []
//           if (errorData)
//             result = JSON.parse(errorData);  // Chuyển chuỗi JSON thành mảng
//           console.log(result);

//           if (errorData.includes("some error consdition")) {
//             reject({
//               success: false,
//               code: 'e001',
//               message: "Lỗi trong quá trình huấn luyện dữ liệu"
//             });
//           }

//           // let result = [];
//           // if (data) {
//           //   result = data.split(',');
//           //   if (result && result[0] && result[result.length - 1] == "") {
//           //     result.pop();
//           //   }
//           // }

//           resolve({
//             success: true,
//             code: 'e000',
//             data: result
//           });
//         } catch (error) {
//           console.log(error);
//           reject({
//             success: false,
//             code: 'e001',
//             message: "Lỗi trong quá trình huấn luyện dữ liệu"
//           });
//         }
//       });
//     } catch (error) {
//       console.log("Lỗi: " + error);
//       reject({
//         success: false,
//         code: `e001`,
//         message: `Lỗi trong quá trình lấy thông tin`,
//       });
//     }
//   });
// };


let recommendProduct = async (req, res) => {
  keySearch = req?.body?.question_content
  console.log(keySearch);
  return new Promise(async (resolve, reject) => {
    if (!keySearch) {
      resolve({
        success: false,
        code: 'e001',
        message: 'Chúng tôi có thể giúp gì cho bạn?'
      });
      return;
    }
    await sql.connect(pool.config);
    const user = await userController.checkTokenAndGetUser(req);

    if (user == -1) {
      return resolve({
        success: false,
        code: `e002`,
        message: `Hết phiên đăng nhập. Vui lòng đăng nhập lại để tiếp tục!`,
      });
    } else if (user) {
      let list_products = [];

      const readFileAsync = () => {
        return new Promise((resolve, reject) => {
          fs.readFile('./src/assets/data.json', 'utf8', (err, data) => {
            if (err) {
              return resolve({
                success: false,
                code: 'e001',
                message: 'Lỗi trong quá trình đọc file ./src/assets/data.json',
                err,
              });
            } else {
              resolve(JSON.parse(data));
            }
          });
        });
      };

      list_products = await readFileAsync();
      if (list_products && list_products[0]) {
        let result_find_product_name = chunkFeature(keySearch, list_products)
        if (result_find_product_name && result_find_product_name[0]) {
          // Đã tìm thấy tên cây trong câu nói
          // Chuẩn bị file tên tất cả cây
          const request = new sql.Request();
          request.input("plant_name", result_find_product_name[0])
          request.input("user_id", user?.user_id)
          const { recordsets: resultCheckOrder } = await request.execute("dbo.[CheckOrderByProductName]");

          if ((resultCheckOrder && resultCheckOrder[0] && resultCheckOrder[0][0] && resultCheckOrder[0][0]?.purchase_count > 0) || !result_find_product_name[0]) {
            //Sản phẩm này đã được user mua trước đó
            let productName = result_find_product_name[0]

            try {
              // const pythonProcess = spawn('py', ['./src/controller/trainData.py', keySearch]);
              const pythonProcess = spawn('py', ['./src/controller/trainData.py', keySearch, productName]);
              pythonProcess.stderr.setEncoding('utf8');

              pythonProcess.stderr.on('data', async (data) => {
                try {
                  const errorData = data.toString();

                  if (errorData.includes("some error consdition")) {
                    resolve({
                      success: false,
                      code: 'e001',
                      message: "Lỗi trong quá trình huấn luyện dữ liệu",
                      data: ["Webcaycanh đã nhận được thông tin, chúng tôi sẽ phản hồi trong giây lát"]
                    });
                  }
                  let result = []
                  if (errorData && JSON.parse(errorData) && JSON.parse(errorData)?.success) {
                    result = JSON.parse(errorData)?.data;  // Chuyển chuỗi JSON thành mảng
                    if (result && result[0]) {
                      if (result[0]?.includes("NhanKem")) {
                        // Nếu là nhãn kém thì trả vì cách chăm sóc
                        const request = new sql.Request();
                        request.input("plant_name", result[0].split('_')[0])
                        request.input("isPlant", 3)
                        const { recordsets: resultRelateds } = await request.execute("dbo.[SP_GetReferenceItems]");

                        return resolve({
                          success: true,
                          code: 'e000',
                          message: result[0].split('_')[0] + " của bạn đang bị bệnh. Bạn có thể tham khảo một vài phân bón này",
                          data: [result[0].split('_')[0] + " của bạn đang bị bệnh. Bạn có thể tham khảo một vài phân bón này",
                          ...resultRelateds[0].map(val => { return 'http://localhost:3000/product/' + val?.plant_id })
                          ]
                        })
                      } else {
                        //Nếu là nhãn tốt thì nói cho người dùng biết
                        return resolve({
                          success: true,
                          code: 'e000',
                          message: result[0].split('_')[0] + " của bạn đang phát triển tốt",
                          data: [result[0].split('_')[0] + " của bạn đang phát triển tốt"]
                        })
                      }
                    } else {
                      return resolve({
                        success: true,
                        code: 'e000',
                        message: "Vui lòng cho chúng tôi biết thêm thông tin về vấn đề của bạn!",
                        data: ["Vui lòng cho chúng tôi biết thêm thông tin về vấn đề của bạn!"]
                      })
                    }
                  } else {
                    return resolve({
                      success: false,
                      code: 'e001',
                      message: "Vui lòng cho chúng tôi biết thêm thông tin về vấn đề của bạn!",
                      data: ["Vui lòng cho chúng tôi biết thêm thông tin về vấn đề của bạn!"]
                    })
                  }
                } catch (error) {
                  console.log(error);
                  return resolve({
                    success: false,
                    code: 'e001',
                    message: "Lỗi trong quá trình huấn luyện dữ liệu"
                  });
                }
              });
            } catch (error) {
              console.log("Lỗi: " + error);
              return resolve({
                success: false,
                code: `e001`,
                message: `Lỗi trong quá trình lấy thông tin`,
              });
            }
          } else if (resultCheckOrder && resultCheckOrder[1] && resultCheckOrder[1]?.length > 0) {
            // Sau khi kiểm tra xong, nếu khách chưa từng mua cây này
            // Thì trả về danh sách sản phẩm gợi ý
            return resolve({
              success: true,
              type: "Recommend",
              code: 'e000',
              message: 'Danh sách cây được user nhắc đến trong câu',
              data: resultCheckOrder[1].map(val => { return 'http://localhost:3000/product/' + val?.plant_id })
            });
          } else {
            // Không tìm thấy từ khóa nào được nhắc đến trong câu
            resolve({
              success: false,
              code: 'e001',
              message: 'Vui lòng cung cấp thêm thông tin để chúng tôi có thể hỗ trợ bạn tốt hơn',
              data: ['Vui lòng cung cấp thêm thông tin để chúng tôi có thể hỗ trợ bạn tốt hơn']
            });
          }
        } else {
          // Không tìm thấy từ khóa nào được nhắc đến trong câu
          resolve({
            success: false,
            code: 'e001',
            message: 'Vui lòng cung cấp thêm thông tin để chúng tôi có thể hỗ trợ bạn tốt hơn',
            data: ['Vui lòng cung cấp thêm thông tin để chúng tôi có thể hỗ trợ bạn tốt hơn']
          });
        }
      } else {
        resolve({
          success: false,
          code: 'e001',
          message: 'Không có sản phẩm trong file',
          data: ["Chúng tôi sẽ phản hồi sớm sau khi cập nhật dữ liệu"]
        });
      }
    } else {
      return resolve({
        success: false,
        code: `e003`,
        message: `Lỗi xác thực tài khoản`,
      });
    }
  });
};

// Tìm từ khóa xuất hiện trong câu và có trong bộ từ điển
function chunkFeature(inputStr, arrPolarityTerm) {
  const vTerm = [];
  let strRemain = "";
  let start = 0;
  let isTerm = false;
  let isStop = false;
  const inputStrLower = inputStr.toLowerCase();
  const wordList = inputStrLower.trim().split(" ");
  let stop = wordList.length;

  while (!isStop && stop >= 0) {
    for (let num = start; num < stop; num++) {
      strRemain += wordList[num] + " ";
    }

    strRemain = strRemain.trim().toLowerCase();
    isTerm = false;

    for (let cha = 0; cha < arrPolarityTerm.length; cha++) {
      const arr = arrPolarityTerm[cha];
      if (arr.toLowerCase() === strRemain) {
        vTerm.push(strRemain);
        isTerm = true;

        if (start === 0) {
          isStop = true;
        } else {
          stop = start;
          start = 0;
        }
      }
    }

    if (!isTerm) {
      if (start === stop) {
        stop = stop - 1;
        start = 0;
      } else {
        start += 1;
      }
    }

    strRemain = "";
  }

  return vTerm;
}

const handleQuestionFromDataTraining = () => {

}

module.exports = {
  recommendProduct
};
