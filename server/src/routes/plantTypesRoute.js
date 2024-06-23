const express = require("express");
const plantTypesController = require("../controller/plantTypesController");

let Router = express.Router();

Router.get("/getAllCategories", plantTypesController.getAllCategories);
Router.post("/insertUpdateCategory", plantTypesController.insertUpdateCategory);
module.exports = Router;
