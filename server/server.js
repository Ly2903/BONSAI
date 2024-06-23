const express = require("express");
const initAPIRoute = require("./src/routes/api.js");
const app = express();
const port = 5000;
const route = require("./src/routes/api.js");
const bp = require("body-parser");
const { spawn } = require('child_process');
const fs = require('fs');
const sql = require(`mssql`);
const pool = require(`./src/configs/connectDB`);
const notificationController = require("./src/controller/notificationController.js");

//cors
const cors = require("cors");

app.use(bp.json({ limit: "50mb" }));
app.use(bp.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors()); //cross site orgin resource sharing
initAPIRoute(app);

app.listen(port, async () => {
  console.log("Example app listening " + port);

  // Chuẩn bị file tên tất cả cây
  await sql.connect(pool.config);
  const request = new sql.Request();
  const { recordset: result } = await request.execute("dbo.[SP_GetAllNameProduct]");


  let jsonData = result && result[0] ? result.map(item => item.plant_name) : []
  jsonData = JSON.stringify(jsonData, null, 2);

  fs.writeFile('./src/assets/data.json', jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('File saved successfully!');
    }
  });

  // Chuẩn bị sẵn dữ liệu huấn luyện
  spawn('py', ['./src/controller/trainData.py', 'update']);
});
