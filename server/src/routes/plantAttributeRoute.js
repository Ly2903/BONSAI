const express = require("express");
const plantStatusController = require("../controller/plantAttributeController");

let Router = express.Router();

Router.get(
  "/getAllTableByAttribute",
  plantStatusController.getAllTableByAttribute
);
Router.post(
  "/insertUpdatePlantStatus",
  plantStatusController.insertUpdatePlantStatus
);
Router.post(
  "/insertUpdateEnvironment",
  plantStatusController.insertUpdateEnvironment
);
Router.post(
  "/insertUpdatePlantAge",
  plantStatusController.insertUpdatePlantAge
);
Router.post(
  "/insertUpdatePlantLightNeed",
  plantStatusController.insertUpdatePlantLightNeed
);
Router.post(
  "/insertUpdatePlantRequireCare",
  plantStatusController.insertUpdatePlantRequireCare
);
Router.post(
  "/insertUpdatePlantSize",
  plantStatusController.insertUpdatePlantSize
);
Router.post(
  "/insertUpdatePlantWaterNeed",
  plantStatusController.insertUpdatePlantWaterNeed
);
Router.post(
  "/insertUpdatePlantGrowth",
  plantStatusController.insertUpdatePlantGrowth
);

module.exports = Router;
