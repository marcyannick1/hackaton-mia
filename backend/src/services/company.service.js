const Company = require("../models/company.model");

exports.createCompany = async (companyData) => {
  try {
    const existingCompany = await Company.findOne({ siret: companyData.siret });

    if (existingCompany) {
      return {
        error: false,
        message:
          "L'entreprise existe déjà, elle a été récupérée au lieu d'être créée",
        data: existingCompany,
        statusCode: 200,
      };
    }

    const newCompany = new Company(companyData);
    const savedCompany = await newCompany.save();

    return {
      error: false,
      message: "Entreprise créée avec succès",
      data: savedCompany,
      statusCode: 201,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Erreur lors de la création de l'entreprise",
      statusCode: 500,
    };
  }
};

exports.getAllCompanies = async () => {
  try {
    const companies = await Company.find({})
      .populate("documents")
      .sort({ createdAt: -1 });

    return {
      error: false,
      message: "Entreprises récupérées avec succès",
      data: companies,
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur lors de la récupération des entreprises",
      statusCode: 500,
    };
  }
};

exports.getCompanyById = async (companyId) => {
  try {
    const company = await Company.findById(companyId).populate("documents");

    if (!company) {
      return {
        error: true,
        message: "Entreprise introuvable",
        statusCode: 404,
      };
    }

    return {
      error: false,
      message: "Entreprise récupérée avec succès",
      data: company,
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur lors de la récupération de l'entreprise",
      statusCode: 500,
    };
  }
};