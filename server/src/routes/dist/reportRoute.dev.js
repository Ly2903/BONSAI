"use strict";

var express = require("express");

var reportController = require("../controller/reportController");

var Router = express.Router();
Router.get("/getOrdersByPlantType", reportController.getOrdersByPlantType);
Router.get("/getStockPlant", reportController.getStockPlant);
module.exports = Router;