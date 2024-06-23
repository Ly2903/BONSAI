"use strict";

var express = require("express");

var path = require("path");

var paymentController = require("../controller/paymentController");

var Router = express.Router();
Router.post("/create_payment_url", paymentController.createPayment);
Router.post("/vnpay_ipn", paymentController.vnpayCheckStatusPayment);
Router.get("/getAllPaymentMethod", paymentController.getAllPaymentMethod);
Router.post("/insertUpdatePayment", paymentController.insertUpdatePayment);
module.exports = Router;