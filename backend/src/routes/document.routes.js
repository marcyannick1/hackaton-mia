const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const upload = require("../middlewares/upload.middleware");
const validateWithJoi = require("../middlewares/validation.middleware");
const { uploadMetadataSchema } = require("../dtos/document.dtos");

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  validateWithJoi(uploadMetadataSchema),
  documentController.uploadDocument,
);

module.exports = router;
