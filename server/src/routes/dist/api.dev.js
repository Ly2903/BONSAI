"use strict";

var userRoute = require("./userRoute.js");

var productRoute = require("./productRoute.js");

var plantTypesRoute = require("./plantTypesRoute.js");

var orderRoute = require("./orderRoute.js");

var cartRoute = require("./cartRoute.js");

var uploadRoute = require("./uploadRoute.js");

var chatRoute = require("./chatRoute.js");

var statisticalRoute = require("./statisticalRoute.js");

var supplierRoute = require("./supplierRoute.js");

var paymentRoute = require("./paymentRoute.js");

var plantAttributeRoute = require("./plantAttributeRoute.js");

function initAPIRoute(app) {
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/product", productRoute);
  app.use("/api/v1/category", plantTypesRoute);
  app.use("/api/v1/order", orderRoute);
  app.use("/api/v1/cart", cartRoute);
  app.use("/api/v1/chat", chatRoute);
  app.use("/api/v1/upload", uploadRoute);
  app.use("/api/v1/statistical", statisticalRoute);
  app.use("/api/v1/supplier", supplierRoute);
  app.use("/api/v1/payment", paymentRoute);
  app.use("/api/v1/plantAttribute", plantAttributeRoute);
}

module.exports = initAPIRoute;