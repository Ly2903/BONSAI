const express = require("express");
const cartController = require("../controller/cartController");

let Router = express.Router();

Router.post("/insertUpdateCart", cartController.insertUpdateCart);

Router.post("/getCartInformation", cartController.getCartInformation);

module.exports = Router;
