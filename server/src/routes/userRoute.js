const express = require("express");
const userController = require("../controller/userController");

let Router = express.Router();

Router.post("/login", userController.login);
Router.post("/register", userController.register);
Router.post("/getUserByToken", userController.getUserByToken);
Router.post("/updateUser", userController.updateUser);
Router.post("/getAllCustomers", userController.getAllCustomers);
Router.post("/searchUser", userController.searchUser);
Router.post("/getAllStaffs", userController.getAllStaffs);
Router.post("/forgotPassword", userController.forgotPassword);
Router.post("/resetPassword", userController.resetPassword);

module.exports = Router;
