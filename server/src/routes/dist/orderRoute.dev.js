"use strict";

var express = require("express");

var path = require("path");

var orderController = require("../controller/orderController");

var Router = express.Router();
Router.post("/sendOrder", orderController.sendOrder);
Router.post("/getAllOrderByUser", orderController.getAllOrderByUser);
Router.post("/getOrderDetailById", orderController.getOrderDetailById);
Router.post("/getAllOrder", orderController.getAllOrder);
Router.post("/searchOrder", orderController.searchOrder);
Router.post("/updateStatusOrder", orderController.updateStatusOrder);
Router.get("/getAllStatus", orderController.getAllStatus);
Router.post("/insertUpdateStatus", orderController.insertUpdateStatus);
Router.post("/reportInvoice", orderController.reportInvoice);
Router.post("/importProductsToWarehouse", orderController.importProductsToWarehouse); // hóa đơn

var pdfPath = "D:\\TNDH\\souce-code\\server\\hoadon.pdf";
Router.get("/pdf", function (req, res) {
  res.sendFile(path.resolve(pdfPath));
});
module.exports = Router;