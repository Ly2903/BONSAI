const express = require("express");
const statisticalController = require("../controller/statisticalController");

let Router = express.Router();
Router.post("/getRevenueByDay", statisticalController.getRevenueByDay);
Router.post("/getRevenueByStatus", statisticalController.getRevenueByStatus);
Router.get("/getYearsOrder", statisticalController.getYearsOrder);
Router.get("/getOrdersByPlantType", statisticalController.getOrdersByPlantType);
Router.get("/getStockPlant", statisticalController.getStockPlant);

module.exports = Router;
