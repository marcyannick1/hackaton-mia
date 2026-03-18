const companyService = require("../services/company.service");

exports.createCompany = async (req, res) => {
  try {
    const result = await companyService.createCompany(req.body);

    if (result.error) {
      return res.status(result.statusCode).json({
        error: true,
        message: result.message,
      });
    }

    return res.status(result.statusCode).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur serveur lors de la création de l'entreprise",
      details: error.message,
    });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const result = await companyService.getAllCompanies();

    if (result.error) {
      return res.status(result.statusCode).json({
        error: true,
        message: result.message,
      });
    }

    return res.status(result.statusCode).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur serveur lors de la récupération des entreprises",
      details: error.message,
    });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await companyService.getCompanyById(id);

    if (result.error) {
      return res.status(result.statusCode).json({
        error: true,
        message: result.message,
      });
    }

    return res.status(result.statusCode).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur serveur lors de la récupération de l'entreprise",
      details: error.message,
    });
  }
};
