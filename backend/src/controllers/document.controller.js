const documentService = require("../services/document.service");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: "Aucun fichier n'a été fourni",
      });
    }

    const userId = req.user.userId;

    const result = await documentService.createDocument(
      req.file,
      req.body,
      userId,
    );

    if (result.error) {
      return res.status(result.statusCode).json({
        error: true,
        message: result.message,
      });
    }

    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors de l'upload du document",
      details: error.message,
    });
  }
};
