"use strict";

var express = require("express");

var statisticalController = require("../controller/statisticalController");

var Router = express.Router();
Router.post("/getRevenueByDay", statisticalController.getRevenueByDay);
Router.post("/getRevenueByStatus", statisticalController.getRevenueByStatus);
Router.get("/getYearsOrder", statisticalController.getYearsOrder);
Router.get("/getOrdersByPlantType", statisticalController.getOrdersByPlantType);
Router.get("/getStockPlant", statisticalController.getStockPlant);
module.exports = Router;