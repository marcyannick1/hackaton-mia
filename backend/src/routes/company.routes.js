const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const validateWithJoi = require("../middlewares/validation.middleware");

router.post(
  "/",
  // authenticate,
  // validateWithJoi(createCompanySchema),
  companyController.createCompany,
);

router.get("/", authenticate, companyController.getAllCompanies);
router.get("/:id", authenticate, companyController.getCompanyById);

module.exports = router;