const express = require("express");
const chatController = require("../controller/chatController");

let Router = express.Router();

Router.post("/insertQuestion", chatController.insertQuestion);
Router.post("/insertAnswer", chatController.insertAnswer);
Router.post("/getAllChatByUser", chatController.getAllChatByUser);
Router.post("/getAllQuestions", chatController.getAllQuestions);

module.exports = Router;
