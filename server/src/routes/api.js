const userRoute = require("./userRoute.js");
const productRoute = require("./productRoute.js");
const plantTypesRoute = require("./plantTypesRoute.js");
const orderRoute = require("./orderRoute.js");
const cartRoute = require("./cartRoute.js");
const uploadRoute = require("./uploadRoute.js");
const chatRoute = require("./chatRoute.js");
const statisticalRoute = require("./statisticalRoute.js");
const supplierRoute = require("./supplierRoute.js");
const paymentRoute = require("./paymentRoute.js");
const plantAttributeRoute = require("./plantAttributeRoute.js");

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
