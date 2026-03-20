const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");
const {upload} = require("../middlewares/upload.middleware");
const validateWithJoi = require("../middlewares/validation.middleware");

router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    documentController.getAllDocuments,
);
router.get("/me", authenticate, documentController.getMyDocuments);
router.get(
    "/anomalies",
    authenticate,
    authorizeRoles("admin"),
    documentController.getAnomalies
);

router.get("/:id", authenticate, documentController.getDocumentById);
router.delete("/:id", authenticate, documentController.deleteDocument);

router.post(
    "/upload",
    authenticate,
    upload.single("file"),
    documentController.uploadDocument,
);

router.get(
    "/company/:companyId",
    authenticate,
    authorizeRoles("admin", "fournisseur"),
    documentController.getDocumentsByCompany,
);

router.patch(
    "/curated/:id/status",
    authenticate,
    authorizeRoles("admin"),
    documentController.updateCuratedStatus
);

module.exports = router;
