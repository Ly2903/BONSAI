const express = require("express");
const path = require("path");
const paymentController = require("../controller/paymentController");

let Router = express.Router();
Router.post("/create_payment_url", paymentController.createPayment);
Router.post("/vnpay_ipn", paymentController.vnpayCheckStatusPayment);
Router.get("/getAllPaymentMethod", paymentController.getAllPaymentMethod);
Router.post("/insertUpdatePayment", paymentController.insertUpdatePayment);
module.exports = Router;
