"use strict";

var express = require("express");

var initAPIRoute = require("./src/routes/api.js");

var app = express();
var port = 5000;

var route = require("./src/routes/api.js");

var bp = require("body-parser");

var _require = require('child_process'),
    spawn = _require.spawn;

var fs = require('fs');

var sql = require("mssql");

var pool = require("./src/configs/connectDB");

var notificationController = require("./src/controller/notificationController.js"); //cors


var cors = require("cors");

app.use(bp.json({
  limit: "50mb"
}));
app.use(bp.urlencoded({
  limit: "50mb",
  extended: true
}));
app.use(express.json());
app.use(cors()); //cross site orgin resource sharing

initAPIRoute(app);
app.listen(port, function _callee() {
  var request, _ref, result, jsonData;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("Example app listening " + port); // Chuẩn bị file tên tất cả cây

          _context.next = 3;
          return regeneratorRuntime.awrap(sql.connect(pool.config));

        case 3:
          request = new sql.Request();
          _context.next = 6;
          return regeneratorRuntime.awrap(request.execute("dbo.[SP_GetAllNameProduct]"));

        case 6:
          _ref = _context.sent;
          result = _ref.recordset;
          jsonData = result && result[0] ? result.map(function (item) {
            return item.plant_name;
          }) : [];
          jsonData = JSON.stringify(jsonData, null, 2);
          fs.writeFile('./src/assets/data.json', jsonData, 'utf8', function (err) {
            if (err) {
              console.error('Error writing file:', err);
            } else {
              console.log('File saved successfully!');
            }
          }); // Chuẩn bị sẵn dữ liệu huấn luyện

          spawn('py', ['./src/controller/trainData.py', 'update']);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
});