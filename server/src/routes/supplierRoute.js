const express = require("express");
const supplierController = require("../controller/supplierController");

let Router = express.Router();

Router.get("/getAllSupplier", supplierController.getAllSupplier);
Router.post("/insertUpdateSupplier", supplierController.insertUpdateSupplier);
Router.post("/searchSupplier", supplierController.searchSupplier);

module.exports = Router;
