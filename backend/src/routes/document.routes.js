const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");
const { upload } = require("../middlewares/upload.middleware");

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  documentController.getAllDocuments,
);
router.get("/me", authenticate, documentController.getMyDocuments);

router.get("/:id", authenticate, documentController.getDocumentById);
router.get("/:id/curated", authenticate, documentController.getCuratedData);
router.put(
  "/:id/validate",
  authenticate,
  authorizeRoles("admin"),
  documentController.validateDocument,
);

router.delete("/:id", authenticate, documentController.deleteDocument);

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  documentController.uploadDocument,
);

module.exports = router;
