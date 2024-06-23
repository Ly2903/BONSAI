"use strict";

var express = require("express");

var productController = require("../controller/productController");

var recommendController = require("../controller/recommendController");

var Router = express.Router();
Router.get("/getAllProduct", productController.getAllProduct);
Router.get("/getAllRelated", productController.getAllRelated);
Router.post("/insertUpdateProduct", productController.insertUpdateProduct);
Router.post("/searchProductPrice", productController.searchProductPrice);
Router.post("/recommend", recommendController.recommendProduct);
Router.get("/getProductById", productController.getProductById);
module.exports = Router;