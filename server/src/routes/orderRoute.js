const express = require("express");
const path = require("path");
const orderController = require("../controller/orderController");

let Router = express.Router();
Router.post("/sendOrder", orderController.sendOrder);
Router.post("/getAllOrderByUser", orderController.getAllOrderByUser);
Router.post("/getOrderDetailById", orderController.getOrderDetailById);
Router.post("/getAllOrder", orderController.getAllOrder);
Router.post("/searchOrder", orderController.searchOrder);
Router.post("/updateStatusOrder", orderController.updateStatusOrder);
Router.get("/getAllStatus", orderController.getAllStatus);
Router.post("/insertUpdateStatus", orderController.insertUpdateStatus);
Router.post("/reportInvoice", orderController.reportInvoice);
Router.post("/importProductsToWarehouse", orderController.importProductsToWarehouse);


// hóa đơn
const pdfPath = "D:\\TNDH\\souce-code\\server\\hoadon.pdf";

Router.get("/pdf", (req, res) => {
  res.sendFile(path.resolve(pdfPath));
});
module.exports = Router;
