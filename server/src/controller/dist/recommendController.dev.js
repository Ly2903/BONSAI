"use strict";

var _require = require('child_process'),
    spawn = _require.spawn;

process.env.PYTHONIOENCODING = 'utf-8';

var fs = require('fs');

var sql = require("mssql");

var pool = require("../configs/connectDB"); // let recommendProduct = (keySearch) => {
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


var recommendProduct = function recommendProduct(keySearch) {
  console.log(keySearch);
  return new Promise(function _callee(resolve, reject) {
    var list_products, result_find_product_name, pythonProcess;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            list_products = []; // Tìm các từ khóa về tên cây có trong văn bản khách hàng viết

            fs.readFile('./src/assets/data.json', 'utf8', function (err, data) {
              if (err) {
                console.error('Error reading file:', err);
              } else {
                list_products = JSON.parse(data);
              }
            });

            if (list_products && list_products[0]) {
              result_find_product_name = chunkFeature(keySearch, list_products);
              console.log(result_find_product_name);
            }

            try {
              // const pythonProcess = spawn('py', ['./src/controller/trainData.py', keySearch]);
              pythonProcess = spawn('py', ['./src/controller/trainData.py', 'find_tree_from_keywords', keySearch]);
              pythonProcess.stderr.setEncoding('utf8');
              pythonProcess.stderr.on('data', function (data) {
                try {
                  var errorData = data.toString();
                  console.log("reuslt", errorData);
                  var result = [];
                  if (errorData) result = JSON.parse(errorData); // Chuyển chuỗi JSON thành mảng

                  console.log(result);

                  if (errorData.includes("some error consdition")) {
                    reject({
                      success: false,
                      code: 'e001',
                      message: "Lỗi trong quá trình huấn luyện dữ liệu"
                    });
                  } // let result = [];
                  // if (data) {
                  //   result = data.split(',');
                  //   if (result && result[0] && result[result.length - 1] == "") {
                  //     result.pop();
                  //   }
                  // }


                  resolve({
                    success: true,
                    code: 'e000',
                    data: result
                  });
                } catch (error) {
                  console.log(error);
                  reject({
                    success: false,
                    code: 'e001',
                    message: "Lỗi trong quá trình huấn luyện dữ liệu"
                  });
                }
              });
            } catch (error) {
              console.log("Lỗi: " + error);
              reject({
                success: false,
                code: "e001",
                message: "L\u1ED7i trong qu\xE1 tr\xECnh l\u1EA5y th\xF4ng tin"
              });
            }

          case 4:
          case "end":
            return _context.stop();
        }
      }
    });
  });
}; // Tìm từ khóa xuất hiện trong câu và có trong bộ từ điển


function chunkFeature(inputStr, arrPolarityTerm) {
  var vTerm = [];
  var strRemain = "";
  var start = 0;
  var isTerm = false;
  var isStop = false;
  var inputStrLower = inputStr.toLowerCase();
  var wordList = inputStrLower.trim().split(" ");
  var stop = wordList.length;

  while (!isStop && stop >= 0) {
    for (var num = start; num < stop; num++) {
      strRemain += wordList[num] + " ";
    }

    strRemain = strRemain.trim().toLowerCase();
    isTerm = false;

    for (var cha = 0; cha < arrPolarityTerm.length; cha++) {
      var arr = arrPolarityTerm[cha];

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

module.exports = {
  recommendProduct: recommendProduct
};