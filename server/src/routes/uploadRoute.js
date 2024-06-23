const express = require("express");
const path = require("path");
const fs = require("fs");
const uploadController = require("../controller/uploadController");
const link = 'http://localhost:5000/api/v1/upload/images/'

let Router = express.Router();

const currentDirectory = process.cwd().replace(/\\/g, "/");

Router.post("/manyFile", uploadController.upload.array("image"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No images uploaded.");
  }

  const imageUrls = req.files.map((file) => `${link+ file.filename}`);
  res.send(imageUrls);
});

Router.post("/oneFile", uploadController.upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image uploaded.");
  }

  const imageUrl = `${link+ req.file.filename}`;
  res.send(imageUrl);
});

Router.get("/images/:imageName", (req, res) => {
  const uploadsPath = path.join(currentDirectory, "uploads");
  const imageName = req.params.imageName;
  const imagePath = path.join(uploadsPath, imageName);

  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error("Error reading image file:", err);
      return res.status(500).end();
    }

    res.writeHead(200, { "Content-Type": "image/jpeg" }); // Adjust the content type based on your image format
    res.end(data);
  });
});
module.exports = Router;
