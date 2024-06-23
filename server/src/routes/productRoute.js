const express = require("express");
const productController = require("../controller/productController");
const recommendController = require("../controller/recommendController");

let Router = express.Router();

Router.get("/getAllProduct", productController.getAllProduct);
Router.get("/getAllRelated", productController.getAllRelated);
Router.post("/insertUpdateProduct", productController.insertUpdateProduct);
Router.post("/searchProductPrice", productController.searchProductPrice);
Router.post("/recommend", recommendController.recommendProduct);
Router.get("/getProductById", productController.getProductById);

module.exports = Router;
